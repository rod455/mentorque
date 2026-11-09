// A compra avulsa no servidor: ler o saldo, gravar a compra, passar o direito
// do aparelho para a conta. A regra pura mora em ./direito.ts.
//
// SEM A TABELA, TUDO COMO ANTES (09/11/2026). A tabela `compras_avulsas` e a
// coluna `biela_perguntas.pago_com` nascem pelo SQL em
// supabase/compras_avulsas.sql. Se o deploy chegar antes delas, o Biela não
// pode trocar de comportamento: filtrar por uma coluna que não existe devolve
// erro, a contagem do grátis viraria zero e todo mundo perguntaria sem limite.
// Por isso `avulsaPronta` confere uma vez por instância, e a rota só usa o
// caminho novo quando ela diz sim.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ehProdutoAvulso, oQueACompraLibera, SALDO_VAZIO, type Saldo } from "./direito.ts";

let pronta: boolean | null = null;

export async function avulsaPronta(admin: SupabaseClient): Promise<boolean> {
  if (pronta !== null) return pronta;
  const [a, b] = await Promise.all([
    admin.from("compras_avulsas").select("id", { head: true, count: "exact" }).limit(1),
    admin.from("biela_perguntas").select("pago_com", { head: true, count: "exact" }).limit(1),
  ]);
  const ok = !a.error && !b.error;
  if (!ok) console.warn("[avulsa] tabela ou coluna ausente: a compra avulsa fica desligada", { a: a.error?.message, b: b.error?.message });
  // Só o "sim" fica guardado: um "não" volta a perguntar na próxima, para o
  // SQL valer sem esperar a instância reciclar.
  if (ok) pronta = true;
  return ok;
}

/** Id de aparelho que pode entrar num filtro `or` do PostgREST sem escapar nada. */
export function anonSeguro(anonId: string | null | undefined): string | null {
  const a = String(anonId ?? "").trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(a) ? a : null;
}

/** O filtro "é desta pessoa": a conta, o aparelho, ou os dois. */
export function filtroDeDono(userId: string | null, anonId: string | null): string | null {
  const partes: string[] = [];
  if (userId && /^[0-9a-f-]{36}$/i.test(userId)) partes.push(`user_id.eq.${userId}`);
  const a = anonSeguro(anonId);
  if (a) partes.push(`anon_id.eq.${a}`);
  return partes.length ? partes.join(",") : null;
}

export async function lerSaldo(admin: SupabaseClient, userId: string | null, anonId: string | null, agora = new Date()): Promise<Saldo> {
  const dono = filtroDeDono(userId, anonId);
  if (!dono) return SALDO_VAZIO;
  const umDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const [compras, usados, hoje] = await Promise.all([
    admin.from("compras_avulsas").select("perguntas, passe_ate").or(dono),
    admin.from("biela_perguntas").select("id", { count: "exact", head: true }).eq("pago_com", "credito").or(dono),
    admin.from("biela_perguntas").select("id", { count: "exact", head: true }).eq("pago_com", "passe").gte("criado_em", umDiaAtras).or(dono),
  ]);
  if (compras.error || usados.error || hoje.error) {
    // Falha de leitura não pode virar pergunta de graça nem cobrança dupla:
    // devolve saldo vazio, que é o comportamento de antes da compra existir.
    console.error("[avulsa] saldo não lido", { motivo: compras.error?.message ?? usados.error?.message ?? hoje.error?.message });
    return SALDO_VAZIO;
  }
  let creditosComprados = 0;
  let passeAte: Date | null = null;
  for (const c of (compras.data ?? []) as { perguntas: number | null; passe_ate: string | null }[]) {
    creditosComprados += c.perguntas ?? 0;
    if (c.passe_ate) {
      const d = new Date(c.passe_ate);
      if (!passeAte || d > passeAte) passeAte = d;
    }
  }
  return { creditosComprados, creditosUsados: usados.count ?? 0, passeAte, perguntasDoPasseHoje: hoje.count ?? 0 };
}

/** A compra feita sem conta passa para a conta quando a pessoa entra. */
export async function adotarCompras(admin: SupabaseClient, userId: string | null, anonId: string | null): Promise<void> {
  const a = anonSeguro(anonId);
  if (!userId || !a) return;
  const { error } = await admin.from("compras_avulsas").update({ user_id: userId }).eq("anon_id", a).is("user_id", null);
  if (error) console.error("[avulsa] compra do aparelho não passou para a conta", { motivo: error.message });
}

type SessaoDoStripe = {
  id: string;
  mode?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
};

/** É uma sessão de compra avulsa, paga? */
export function sessaoAvulsaPaga(s: SessaoDoStripe): boolean {
  return s.mode === "payment" && s.payment_status === "paid" && s.metadata?.tipo === "avulsa" && ehProdutoAvulso(s.metadata?.produto);
}

/**
 * Grava a compra. Devolve "gravou", "ja_existia" ou "recusou". Os dois
 * caminhos (webhook e confirmação do app) chamam isto; o id da sessão é único,
 * então quem chegar depois encontra "ja_existia" e não duplica.
 */
export async function gravarCompra(admin: SupabaseClient, s: SessaoDoStripe, agora = new Date()): Promise<"gravou" | "ja_existia" | "recusou"> {
  if (!sessaoAvulsaPaga(s)) return "recusou";
  const m = s.metadata ?? {};
  const produto = m.produto;
  if (!ehProdutoAvulso(produto)) return "recusou";
  const userId = m.user_id && /^[0-9a-f-]{36}$/i.test(m.user_id) ? m.user_id : null;
  const anonId = anonSeguro(m.anon_id);
  if (!userId && !anonId) return "recusou";
  const libera = oQueACompraLibera(produto, agora);
  const { data, error } = await admin
    .from("compras_avulsas")
    .upsert(
      {
        sessao: s.id,
        produto,
        perguntas: libera.perguntas,
        passe_ate: libera.passeAte?.toISOString() ?? null,
        valor_centavos: s.amount_total ?? null,
        moeda: s.currency ?? null,
        user_id: userId,
        anon_id: anonId,
        plataforma: (m.plataforma ?? "").slice(0, 16) || null,
        versao: (m.versao ?? "").slice(0, 16) || null,
      },
      { onConflict: "sessao", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    console.error("[avulsa] compra paga NÃO gravada", { sessao: s.id, motivo: error.message });
    throw new Error(`compra_nao_gravada: ${error.message}`);
  }
  return (data ?? []).length > 0 ? "gravou" : "ja_existia";
}
