import { NextResponse } from "next/server";

// Versões disponíveis de um marca+modelo(+ano), via tabela FIPE pública
// (parallelum.com.br). Cache agressivo: o catálogo muda raramente.
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
  const year = parseInt(searchParams.get("year") ?? "", 10);
  if (!make || !model) return NextResponse.json({ versions: [] });

  try {
    // 1) Marca (nomes FIPE têm prefixos: "VW - VolksWagen", "GM - Chevrolet").
    const brands = await fj<{ nome: string; codigo: string }[]>(`${FIPE}/${type}/marcas`);
    const nm = norm(make);
    const brand = brands.find((b) => {
      const nb = norm(b.nome);
      return nb.includes(nm) || nm.includes(nb);
    });
    if (!brand) return NextResponse.json({ versions: [] });

    // 2) "Modelos" da FIPE já são as versões (ex.: "Polo 1.0 200 TSI").
    const resp = await fj<{ modelos: { nome: string; codigo: number }[] }>(
      `${FIPE}/${type}/marcas/${brand.codigo}/modelos`
    );
    const nmodel = norm(model);
    let matches = (resp.modelos ?? []).filter((m) => norm(m.nome).includes(nmodel));
    if (matches.length === 0) return NextResponse.json({ versions: [] });

    // 3) Filtro por ano (melhor esforço; se falhar, devolve sem filtrar).
    if (year && matches.length <= 20) {
      const checked = await Promise.all(
        matches.map(async (m) => {
          try {
            const anos = await fj<{ codigo: string }[]>(
              `${FIPE}/${type}/marcas/${brand.codigo}/modelos/${m.codigo}/anos`
            );
            // Códigos "2022-1"; "32000-..." é zero-km (vale para o ano corrente).
            return anos.some((a) => a.codigo.startsWith(String(year))) ? m : null;
          } catch {
            return m;
          }
        })
      );
      const filtered = checked.filter((m): m is NonNullable<typeof m> => !!m);
      if (filtered.length > 0) matches = filtered;
    }

    return NextResponse.json(
      { versions: matches.map((m) => m.nome).slice(0, 30) },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ versions: [] });
  }
}
