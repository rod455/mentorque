// Server-side FIPE client with provider fallback. The app only talks to our
// /api/fipe proxy; here we try BrasilAPI first and fall back to Parallelum
// (both are community proxies of veiculos.fipe.org.br, and tend to fail at
// different times). Results are cached daily — the FIPE table is monthly.
//
// To keep the brand→model→price chain consistent across providers, the
// `valor` we hand back is prefixed with the provider ("b:" / "p:") and carries
// whatever codes that provider needs for the next step.

const BRASIL = "https://brasilapi.com.br/api/fipe";
const PARALLEL = "https://parallelum.com.br/fipe/api/v1";
const REVALIDATE = 60 * 60 * 24; // 1 day

export type VehicleKind = "carros" | "motos" | "caminhoes";
export type Brand = { nome: string; valor: string };
export type Model = { modelo: string; valor: string };
export type PriceEntry = { value: number; year: number; fuel: string; label: string; codigoFipe: string };
export type MatchResult = { value: number; codigoFipe: string; label: string };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE },
    headers: { accept: "application/json", "user-agent": "mentorque/1.0 (+https://mentorque.app)" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${url} :: ${body.slice(0, 120)}`);
  }
  return (await res.json()) as T;
}

export function parseBRL(v: string | number | undefined): number {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const digits = v.replace(/[^\d,]/g, "").replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(digits) || 0);
}

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ---- Provider-specific raw shapes -----------------------------------------
type BrasilBrand = { nome: string; valor: string };
type BrasilModel = { modelo: string; valor: string };
type BrasilPrice = { valor: string; anoModelo?: number | string; combustivel?: string; codigoFipe?: string };
type ParBrand = { nome: string; codigo: string };
type ParModelsResp = { modelos: { nome: string; codigo: string }[]; anos: { nome: string; codigo: string }[] };
type ParAno = { nome: string; codigo: string };
type ParPrice = { Valor: string; AnoModelo?: number | string; Combustivel?: string; CodigoFipe?: string };

const split = (enc: string) => {
  const idx = enc.indexOf(":");
  return [enc.slice(0, idx), enc.slice(idx + 1)] as [string, string];
};

// ---- Brands ---------------------------------------------------------------
export async function getBrands(kind: VehicleKind): Promise<Brand[]> {
  try {
    const b = await getJson<BrasilBrand[]>(`${BRASIL}/marcas/v1/${kind}`);
    return b.map((x) => ({ nome: x.nome, valor: `b:${x.valor}` }));
  } catch {
    const p = await getJson<ParBrand[]>(`${PARALLEL}/${kind}/marcas`);
    return p.map((x) => ({ nome: x.nome, valor: `p:${x.codigo}` }));
  }
}

// ---- Models ---------------------------------------------------------------
export async function getModels(kind: VehicleKind, brandEnc: string): Promise<Model[]> {
  const [prov, code] = split(brandEnc);
  if (prov === "b") {
    const m = await getJson<BrasilModel[]>(`${BRASIL}/veiculos/v1/${kind}/${code}`);
    return m.map((x) => ({ modelo: x.modelo, valor: `b:${x.valor}` }));
  }
  const r = await getJson<ParModelsResp>(`${PARALLEL}/${kind}/marcas/${code}/modelos`);
  return r.modelos.map((x) => ({ modelo: x.nome, valor: `p:${code}:${x.codigo}` }));
}

// ---- Prices (all years for a model) ---------------------------------------
export async function getPrices(kind: VehicleKind, modelEnc: string): Promise<PriceEntry[]> {
  const [prov, rest] = split(modelEnc);
  if (prov === "b") {
    const raw = await getJson<BrasilPrice[]>(`${BRASIL}/preco/v1/${rest}`);
    return raw.map((p) => priceEntry(p.valor, p.anoModelo, p.combustivel, p.codigoFipe));
  }
  const [brandCode, modelCode] = rest.split(":");
  const anos = await getJson<ParAno[]>(`${PARALLEL}/${kind}/marcas/${brandCode}/modelos/${modelCode}/anos`);
  const pick = anos.slice(0, 14); // cap upstream calls
  const entries = await Promise.all(
    pick.map(async (an) => {
      try {
        const pr = await getJson<ParPrice>(`${PARALLEL}/${kind}/marcas/${brandCode}/modelos/${modelCode}/anos/${an.codigo}`);
        return priceEntry(pr.Valor, pr.AnoModelo, pr.Combustivel, pr.CodigoFipe);
      } catch {
        return null;
      }
    })
  );
  return entries.filter((e): e is PriceEntry => !!e).sort((a, b) => b.year - a.year);
}

function priceEntry(valor: string, ano: number | string | undefined, fuel: string | undefined, code: string | undefined): PriceEntry {
  const yearNum = typeof ano === "string" ? parseInt(ano, 10) : ano ?? 0;
  const y = Number.isFinite(yearNum) ? (yearNum as number) : 0;
  const f = fuel ?? "";
  return { value: parseBRL(valor), year: y, fuel: f, label: `${y || "—"}${f ? ` · ${f}` : ""}`, codigoFipe: code ?? "" };
}

// ---- Best-effort match for a free-text vehicle (current car) --------------
export async function matchPrice(kind: VehicleKind, brandName: string, modelName: string, year: number): Promise<MatchResult | null> {
  try {
    return await matchBrasil(kind, brandName, modelName, year);
  } catch {
    try {
      return await matchParallel(kind, brandName, modelName, year);
    } catch {
      return null;
    }
  }
}

async function matchBrasil(kind: VehicleKind, brandName: string, modelName: string, year: number): Promise<MatchResult | null> {
  const brands = await getJson<BrasilBrand[]>(`${BRASIL}/marcas/v1/${kind}`);
  const brand = pickByName(brands.map((b) => ({ name: b.nome, code: b.valor })), brandName);
  if (!brand) return null;
  const models = await getJson<BrasilModel[]>(`${BRASIL}/veiculos/v1/${kind}/${brand.code}`);
  const model = pickModel(models.map((m) => ({ name: m.modelo, code: m.valor })), modelName);
  if (!model) return null;
  const prices = (await getJson<BrasilPrice[]>(`${BRASIL}/preco/v1/${model.code}`)).map((p) => priceEntry(p.valor, p.anoModelo, p.combustivel, p.codigoFipe));
  return choosePrice(prices, year, brand.name, model.name);
}

async function matchParallel(kind: VehicleKind, brandName: string, modelName: string, year: number): Promise<MatchResult | null> {
  const brands = await getJson<ParBrand[]>(`${PARALLEL}/${kind}/marcas`);
  const brand = pickByName(brands.map((b) => ({ name: b.nome, code: b.codigo })), brandName);
  if (!brand) return null;
  const r = await getJson<ParModelsResp>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos`);
  const model = pickModel(r.modelos.map((m) => ({ name: m.nome, code: m.codigo })), modelName);
  if (!model) return null;
  const anos = await getJson<ParAno[]>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos/${model.code}/anos`);
  const ano = anos.find((a) => a.nome.startsWith(String(year))) ?? anos[0];
  if (!ano) return null;
  const pr = await getJson<ParPrice>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos/${model.code}/anos/${ano.codigo}`);
  return { value: parseBRL(pr.Valor), codigoFipe: pr.CodigoFipe ?? "", label: `${brand.name} ${model.name} ${pr.AnoModelo ?? year}` };
}

function pickByName(list: { name: string; code: string }[], target: string) {
  const n = normalize(target);
  return list.find((x) => normalize(x.name) === n) ?? list.find((x) => normalize(x.name).includes(n));
}
function pickModel(list: { name: string; code: string }[], target: string) {
  const n = normalize(target);
  return list.filter((x) => normalize(x.name).includes(n)).sort((a, b) => a.name.length - b.name.length)[0];
}
function choosePrice(prices: PriceEntry[], year: number, brandName: string, modelName: string): MatchResult | null {
  if (prices.length === 0) return null;
  const exact = prices.find((p) => p.year === year);
  const chosen = exact ?? prices.slice().sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))[0];
  return { value: chosen.value, codigoFipe: chosen.codigoFipe, label: `${brandName} ${modelName} ${chosen.year}` };
}
