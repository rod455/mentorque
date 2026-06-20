// Server-side BrasilAPI FIPE client. The app never calls BrasilAPI directly —
// it goes through our /api/fipe proxy, which caches results (the FIPE table
// changes monthly, so a daily revalidate is safe) and normalizes the shapes.
// Docs: https://brasilapi.com.br/docs#tag/FIPE

const BASE = "https://brasilapi.com.br/api/fipe";
const REVALIDATE = 60 * 60 * 24; // 1 day

export type VehicleKind = "carros" | "motos" | "caminhoes";
export type FipeBrand = { nome: string; valor: string };
export type FipeModel = { modelo: string; valor: string };
export type FipePriceRaw = {
  valor: string; // "R$ 45.000,00"
  marca?: string;
  modelo?: string;
  anoModelo?: number | string;
  combustivel?: string;
  codigoFipe?: string;
  mesReferencia?: string;
};
export type PriceEntry = { value: number; year: number; fuel: string; label: string; codigoFipe: string };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE },
    headers: {
      accept: "application/json",
      "user-agent": "mentorque/1.0 (+https://mentorque.app)",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`fipe ${res.status} ${path} :: ${body.slice(0, 160)}`);
  }
  return (await res.json()) as T;
}

export const fipeBrands = (kind: VehicleKind) => get<FipeBrand[]>(`/marcas/v1/${kind}`);
export const fipeModels = (kind: VehicleKind, brandCode: string) =>
  get<FipeModel[]>(`/veiculos/v1/${kind}/${brandCode}`);
export const fipePriceRaw = (codigoFipe: string) => get<FipePriceRaw[]>(`/preco/v1/${codigoFipe}`);

// "R$ 45.000,00" -> 45000
export function parseBRL(v: string | number | undefined): number {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const digits = v.replace(/[^\d,]/g, "").replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(digits) || 0);
}

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function toPriceEntries(raw: FipePriceRaw[]): PriceEntry[] {
  return raw.map((p) => {
    const year = typeof p.anoModelo === "string" ? parseInt(p.anoModelo, 10) : p.anoModelo ?? 0;
    const fuel = p.combustivel ?? "";
    const y = Number.isFinite(year) ? (year as number) : 0;
    return {
      value: parseBRL(p.valor),
      year: y,
      fuel,
      label: `${y || "—"}${fuel ? ` · ${fuel}` : ""}`,
      codigoFipe: p.codigoFipe ?? "",
    };
  });
}

// Best-effort price for a free-text vehicle (the current car came from
// onboarding). Returns null when we can't confidently resolve it — the caller
// then falls back to the local estimate.
export async function matchPrice(
  kind: VehicleKind,
  brandName: string,
  modelName: string,
  year: number
): Promise<{ value: number; codigoFipe: string; label: string } | null> {
  const brands = await fipeBrands(kind);
  const nB = normalize(brandName);
  const brand = brands.find((b) => normalize(b.nome) === nB) ?? brands.find((b) => normalize(b.nome).includes(nB));
  if (!brand) return null;

  const models = await fipeModels(kind, brand.valor);
  const nM = normalize(modelName);
  // Prefer the shortest model name that contains the searched name (the base
  // trim), e.g. "Gol" over "Gol Highline 1.6".
  const candidates = models
    .filter((m) => normalize(m.modelo).includes(nM))
    .sort((a, b) => a.modelo.length - b.modelo.length);
  const model = candidates[0];
  if (!model) return null;

  const prices = toPriceEntries(await fipePriceRaw(model.valor));
  if (prices.length === 0) return null;
  const exact = prices.find((p) => p.year === year);
  const chosen = exact ?? prices.sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))[0];
  return { value: chosen.value, codigoFipe: chosen.codigoFipe, label: `${brand.nome} ${model.modelo} ${chosen.year}` };
}
