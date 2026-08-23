export const maxDuration = 15;
import { NextResponse } from "next/server";

// Valor FIPE do veículo (marca+modelo+ano, refinado pela versão quando ela
// bate com um nome da tabela). A FIPE publica uma tabela de referência POR
// MÊS; a API pública devolve sempre a referência vigente (MesReferencia).
// Cache de 24h aqui → no pior caso, 1 dia de atraso na virada do mês.
const FIPE = "https://parallelum.com.br/fipe/api/v1";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

type CacheEntry = { at: number; data: unknown };
const g = globalThis as unknown as { __fipeCache?: Map<string, CacheEntry> };
const cache = (g.__fipeCache ??= new Map());
const DAY = 24 * 60 * 60 * 1000;

async function fj<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < DAY) return hit.data as T;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`fipe ${res.status}`);
  const data = (await res.json()) as T;
  cache.set(url, { at: Date.now(), data });
  return data;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "moto" ? "motos" : "carros";
  const make = searchParams.get("make")?.trim() ?? "";
  const model = searchParams.get("model")?.trim() ?? "";
  const version = searchParams.get("version")?.trim() ?? "";
  const year = parseInt(searchParams.get("year") ?? "", 10);
  if (!make || !model || !year) return NextResponse.json({ value: null });

  try {
    const brands = await fj<{ nome: string; codigo: string }[]>(`${FIPE}/${type}/marcas`);
    const nm = norm(make);
    const brand = brands.find((b) => {
      const nb = norm(b.nome);
      return nb.includes(nm) || nm.includes(nb);
    });
    if (!brand) return NextResponse.json({ value: null });

    const resp = await fj<{ modelos: { nome: string; codigo: number }[] }>(
      `${FIPE}/${type}/marcas/${brand.codigo}/modelos`
    );
    const nmodel = norm(model);
    const nver = version ? norm(version) : "";
    // Candidatos do modelo, com a versão informada primeiro (match exato →
    // contém → demais); tenta cada um até achar o ano na tabela.
    const candidates = (resp.modelos ?? [])
      .filter((m) => norm(m.nome).includes(nmodel))
      .sort((a, b) => {
        const rank = (m: { nome: string }) => {
          const n = norm(m.nome);
          if (nver && n === nver) return 0;
          if (nver && n.includes(nver)) return 1;
          return 2;
        };
        return rank(a) - rank(b);
      })
      .slice(0, 10);

    for (const m of candidates) {
      try {
        const anos = await fj<{ codigo: string }[]>(
          `${FIPE}/${type}/marcas/${brand.codigo}/modelos/${m.codigo}/anos`
        );
        const ano = anos.find((a) => a.codigo.startsWith(String(year)));
        if (!ano) continue;
        const val = await fj<{ Valor: string; MesReferencia: string; CodigoFipe: string }>(
          `${FIPE}/${type}/marcas/${brand.codigo}/modelos/${m.codigo}/anos/${ano.codigo}`
        );
        return NextResponse.json(
          {
            value: val.Valor,
            month: val.MesReferencia?.trim() ?? null,
            fipeCode: val.CodigoFipe ?? null,
            matchedName: m.nome,
            // Sem versão casada, o valor é da 1ª versão do modelo → aproximado.
            approximate: !(nver && norm(m.nome).includes(nver)),
          },
          { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
        );
      } catch {
        continue;
      }
    }
    return NextResponse.json({ value: null });
  } catch {
    return NextResponse.json({ value: null });
  }
}
