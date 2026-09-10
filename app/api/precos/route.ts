import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { chaveDadosOk, negada } from "@/lib/chaveDados";

export const runtime = "nodejs";
export const maxDuration = 10;

// Preços de serviço observados (tabela public.precos_observados, ver
// supabase/precos_observados.sql e lib/app/precos.ts).
//
// POST: grava um valor pago, sem ninguém dentro. A rota é pública e não
// confia em ninguém: corta texto, exige tipo conhecido e valor plausível.
//
// GET (com a chave de dados): por par (serviço, estado), quantas observações
// e a mediana, com os quartis. É daqui que a faixa de referência vai ser
// trocada pela observada, par a par, quando houver 30 ou mais. Hoje serve
// para o Analista ver o dado crescer.
const corta = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

/** Os tipos que o app conhece (lib/app/conteudo/servicos.ts), menos "other". */
const TIPOS = new Set(["oil", "brakes", "revision", "suspension", "tires", "battery", "timing", "airfilter", "brakefluid"]);
const VALOR_MAXIMO = 100_000;
const MINIMO_PARA_VALER = 30;

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  let b: Record<string, unknown> | undefined;
  try { b = (await req.json()) as Record<string, unknown>; } catch { /* abaixo */ }
  const tipo = corta(b?.tipo, 24);
  const valor = typeof b?.valor === "number" ? Math.round(b.valor) : NaN;
  if (!tipo || !TIPOS.has(tipo)) return NextResponse.json({ error: "tipo_desconhecido" }, { status: 400 });
  if (!Number.isFinite(valor) || valor <= 0 || valor > VALOR_MAXIMO) return NextResponse.json({ error: "valor_fora_da_faixa" }, { status: 400 });
  const ano = typeof b?.ano === "number" && b.ano >= 1950 && b.ano <= 2100 ? Math.round(b.ano) : null;

  await admin.from("precos_observados").insert({
    tipo,
    valor,
    uf: corta(b?.uf, 2)?.toUpperCase() ?? null,
    cidade: corta(b?.cidade, 60),
    tipo_veiculo: corta(b?.tipoVeiculo, 8),
    ano,
    plataforma: corta(b?.plataforma, 16),
    versao: corta(b?.versao, 16),
  });
  return NextResponse.json({ ok: true });
}

function quantil(ordenado: number[], q: number): number {
  if (!ordenado.length) return 0;
  const pos = (ordenado.length - 1) * q;
  const i = Math.floor(pos);
  const frac = pos - i;
  return ordenado[i + 1] != null ? ordenado[i] + (ordenado[i + 1] - ordenado[i]) * frac : ordenado[i];
}

export async function GET(req: Request) {
  if (!chaveDadosOk(req)) return negada();
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 501 });

  const { data } = await admin
    .from("precos_observados")
    .select("tipo, valor, uf")
    .order("criado_em", { ascending: false })
    .limit(20_000);

  const grupos: Record<string, number[]> = {};
  for (const l of data ?? []) {
    const chave = `${l.tipo}|${l.uf ?? "?"}`;
    (grupos[chave] ??= []).push(Number(l.valor));
  }
  const pares = Object.entries(grupos)
    .map(([chave, valores]) => {
      const [tipo, uf] = chave.split("|");
      const ordenado = [...valores].sort((a, b) => a - b);
      return {
        tipo,
        uf,
        n: ordenado.length,
        vale: ordenado.length >= MINIMO_PARA_VALER,
        p25: Math.round(quantil(ordenado, 0.25)),
        mediana: Math.round(quantil(ordenado, 0.5)),
        p75: Math.round(quantil(ordenado, 0.75)),
      };
    })
    .sort((a, b) => b.n - a.n);

  return NextResponse.json({ total: (data ?? []).length, minimoParaValer: MINIMO_PARA_VALER, pares });
}
