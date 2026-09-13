import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  compararComFaixas,
  extrairJson,
  mesDe,
  normalizarAnalise,
  podeAnalisar,
  promptDaAnalise,
  LIMITE_GRATIS_POR_MES,
  type CarroDaAnalise,
} from "@/lib/orcamento/analise";

export const runtime = "nodejs";
// Ler uma imagem e escrever o JSON leva mais que uma resposta da Biela.
export const maxDuration = 60;

// A análise de orçamento por foto (13/09/2026). O molde, a leitura e a
// comparação moram em lib/orcamento/analise.ts; aqui é a borda pública: o
// limite do gratuito, a chamada ao modelo, o registro sem a foto.
//
// LIMITE: duas por mês no gratuito (decisão do dono em 13/09/2026), sem
// limite no Premium. O Premium é conferido no servidor pela tabela
// subscriptions com o Bearer do Supabase, e não pelo que o app diz: cada
// análise é uma chamada com imagem paga por uso, e um corpo forjado com
// "premium: true" não pode virar conta nossa. Sem sessão, o limite é por
// aparelho (anon_id).

const MAX_IMAGEM = 4_500_000; // bytes de base64, uns 3,3 MB de imagem
const TIPOS_DE_IMAGEM = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = {
  imagem?: string; // data URL ou base64 puro
  tipoImagem?: string;
  locale?: string;
  car?: CarroDaAnalise;
  anonId?: string;
  uf?: string | null;
  cidade?: string | null;
  plataforma?: string;
  versao?: string;
};

function separaImagem(bruto: string | undefined, tipoDito: string | undefined): { tipo: string; dados: string } | null {
  if (typeof bruto !== "string" || !bruto) return null;
  const m = bruto.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i);
  const tipo = (m ? m[1] : tipoDito ?? "image/jpeg").toLowerCase();
  const dados = m ? m[2] : bruto;
  if (!TIPOS_DE_IMAGEM.has(tipo)) return null;
  if (dados.length > MAX_IMAGEM || dados.length < 100) return null;
  return { tipo, dados };
}

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "sem_modelo" }, { status: 503 });

  let b: Body = {};
  try { b = (await req.json()) as Body; } catch { /* abaixo */ }
  const imagem = separaImagem(b.imagem, b.tipoImagem);
  if (!imagem) return NextResponse.json({ error: "imagem_invalida" }, { status: 400 });

  // Quem é: a conta pelo Bearer (e só assim o Premium vale), senão o aparelho.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  let userId: string | null = null;
  if (bearer) {
    const { data } = await admin.auth.getUser(bearer).catch(() => ({ data: { user: null } }));
    userId = data?.user?.id ?? null;
  }
  const anonId = typeof b.anonId === "string" && b.anonId.trim() ? b.anonId.trim().slice(0, 64) : null;
  if (!userId && !anonId) return NextResponse.json({ error: "sem_identidade" }, { status: 400 });

  let premium = false;
  if (userId) {
    const { data: sub } = await admin.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
    premium = sub?.status === "active" || sub?.status === "trialing";
  }

  const mes = mesDe();
  let feitas = 0;
  if (!premium) {
    const q = admin.from("orcamentos_analisados").select("id", { count: "exact", head: true }).eq("mes", mes);
    const { count } = userId ? await q.eq("user_id", userId) : await q.eq("anon_id", anonId!);
    feitas = count ?? 0;
    if (!podeAnalisar(feitas, premium)) {
      return NextResponse.json({ error: "limite", limite: LIMITE_GRATIS_POR_MES, feitas, restantes: 0 }, { status: 429 });
    }
  }

  const locale = b.locale === "en" ? "en" : "pt";
  const car: CarroDaAnalise = b.car && typeof b.car === "object"
    ? { make: b.car.make ?? null, model: b.car.model ?? null, year: b.car.year ?? null, km: b.car.km ?? null, engine: b.car.engine ?? null }
    : null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.BIELA_MODEL ?? "claude-sonnet-5",
        max_tokens: 1800,
        system: promptDaAnalise(locale, car),
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: imagem.tipo, data: imagem.dados } },
            { type: "text", text: locale === "en" ? "Read this quote and return the JSON." : "Leia este orçamento e devolva o JSON." },
          ],
        }],
      }),
    });
    if (!res.ok) {
      const detalhe = await res.text().catch(() => "");
      throw new Error(`anthropic_${res.status}: ${detalhe.slice(0, 500)}`);
    }
    const data = await res.json();
    const textoDoModelo = Array.isArray(data.content)
      ? data.content.filter((x: { type: string }) => x.type === "text").map((x: { text: string }) => x.text).join("\n")
      : "";
    const analiseBruta = normalizarAnalise(extrairJson(textoDoModelo));
    if (!analiseBruta) throw new Error("resposta_sem_json");
    const analise = compararComFaixas(analiseBruta, b.uf ?? null, b.cidade ?? null);

    // O registro conta para o limite mesmo quando a foto não era um
    // orçamento: a chamada foi paga do mesmo jeito. Sem a foto, sem oficina.
    await admin.from("orcamentos_analisados").insert({
      mes,
      user_id: userId,
      anon_id: userId ? null : anonId,
      premium,
      ilegivel: analise.ilegivel,
      n_itens: analise.itens.length,
      total: analise.total,
      servicos: analise.itens.filter((it) => it.servico && it.valor != null).map((it) => ({ servico: it.servico, valor: it.valor })),
      uf: typeof b.uf === "string" ? b.uf.trim().toUpperCase().slice(0, 2) || null : null,
      cidade: typeof b.cidade === "string" ? b.cidade.trim().toLowerCase().slice(0, 80) || null : null,
      plataforma: typeof b.plataforma === "string" ? b.plataforma.slice(0, 16) : null,
      versao: typeof b.versao === "string" ? b.versao.slice(0, 16) : null,
    });

    const restantes = premium ? null : Math.max(0, LIMITE_GRATIS_POR_MES - feitas - 1);
    return NextResponse.json({ ok: true, analise, restantes, premium });
  } catch (err) {
    console.warn("[orcamento] falhou:", err);
    return NextResponse.json({ error: "falhou", detalhe: err instanceof Error ? err.message.slice(0, 200) : "erro" }, { status: 502 });
  }
}
