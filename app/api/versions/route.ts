export const maxDuration = 15;
import { NextResponse } from "next/server";
import {
  LOTE_DE_ANO,
  MAX_VERSOES,
  ORCAMENTO_DE_ANO_MS,
  TETO_PARA_FILTRAR_POR_ANO,
  versaoServeParaOAno,
} from "@/lib/app/versoesDoCarro";

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

    // 3) Filtro por ano, em lotes e com prazo. NA DÚVIDA, MANTÉM.
    //
    // O teto era 20 e isso desligava o filtro justamente nos carros populares:
    // o Creta tem 29 versões e o Gol mais de 30, então os dois recebiam a
    // lista inteira, de todos os anos desde os anos 90. Ver a explicação e a
    // regra em lib/app/versoesDoCarro.ts.
    //
    // O que muda além do número: versão cuja conferência falhou ou não coube
    // no prazo NÃO é mais descartada em silêncio. Códigos são "2022-1";
    // "32000-..." é zero-km e vale para o ano corrente.
    if (year && matches.length <= TETO_PARA_FILTRAR_POR_ANO) {
      const prazo = Date.now() + ORCAMENTO_DE_ANO_MS;
      const anosDe = async (m: { codigo: number }): Promise<string[] | null> => {
        if (Date.now() > prazo) return null;
        try {
          const anos = await fj<{ codigo: string }[]>(
            `${FIPE}/${type}/marcas/${brand.codigo}/modelos/${m.codigo}/anos`
          );
          return anos.map((a) => a.codigo);
        } catch {
          return null;
        }
      };

      const checked: (typeof matches)[number][] = [];
      for (let i = 0; i < matches.length; i += LOTE_DE_ANO) {
        const lote = matches.slice(i, i + LOTE_DE_ANO);
        const anos = await Promise.all(lote.map(anosDe));
        lote.forEach((m, k) => {
          if (versaoServeParaOAno(anos[k], year)) checked.push(m);
        });
      }
      if (checked.length > 0) matches = checked;
    }

    return NextResponse.json(
      { versions: matches.map((m) => m.nome).slice(0, MAX_VERSOES) },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch {
    return NextResponse.json({ versions: [] });
  }
}
