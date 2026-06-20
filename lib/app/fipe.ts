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
export type MatchResult = { value: number; codigoFipe: string; label: string; year: number };

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

// Scan up to 12 model variants in parallel and prefer one that actually lists
// the asked year (e.g. Gol 2018 -> a Gol variant that has 2018), shortest name
// first; otherwise fall back to the closest year found.
async function matchBrasil(kind: VehicleKind, brandName: string, modelName: string, year: number): Promise<MatchResult | null> {
  const brands = await getJson<BrasilBrand[]>(`${BRASIL}/marcas/v1/${kind}`);
  const brand = pickByName(brands.map((b) => ({ name: b.nome, code: b.valor })), brandName);
  if (!brand) return null;
  const models = await getJson<BrasilModel[]>(`${BRASIL}/veiculos/v1/${kind}/${brand.code}`);
  const cands = modelCandidates(models.map((m) => ({ name: m.modelo, code: m.valor })), modelName);
  if (cands.length === 0) return null;

  const withPrices = await Promise.all(
    cands.map(async (m) => {
      try {
        const ps = (await getJson<BrasilPrice[]>(`${BRASIL}/preco/v1/${m.code}`)).map((p) => priceEntry(p.valor, p.anoModelo, p.combustivel, p.codigoFipe));
        return { m, ps };
      } catch {
        return { m, ps: [] as PriceEntry[] };
      }
    })
  );
  // Among variants that actually list the exact year, prefer the most "base"
  // trim (shortest name).
  const exacts = withPrices
    .map(({ m, ps }) => ({ m, p: ps.find((p) => p.year === year) }))
    .filter((x): x is { m: { name: string; code: string }; p: PriceEntry } => !!x.p)
    .sort((a, b) => a.m.name.length - b.m.name.length);
  if (exacts[0]) {
    const { m, p } = exacts[0];
    return { value: p.value, codigoFipe: p.codigoFipe, label: `${brand.name} ${m.name} ${p.year}`, year: p.year };
  }
  let best: { res: MatchResult; diff: number } | null = null;
  for (const { m, ps } of withPrices)
    for (const p of ps) {
      const d = Math.abs(p.year - year);
      if (!best || d < best.diff) best = { res: { value: p.value, codigoFipe: p.codigoFipe, label: `${brand.name} ${m.name} ${p.year}`, year: p.year }, diff: d };
    }
  return best?.res ?? null;
}

async function matchParallel(kind: VehicleKind, brandName: string, modelName: string, year: number): Promise<MatchResult | null> {
  const brands = await getJson<ParBrand[]>(`${PARALLEL}/${kind}/marcas`);
  const brand = pickByName(brands.map((b) => ({ name: b.nome, code: b.codigo })), brandName);
  if (!brand) return null;
  const r = await getJson<ParModelsResp>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos`);
  const cands = modelCandidates(r.modelos.map((m) => ({ name: m.nome, code: m.codigo })), modelName);
  if (cands.length === 0) return null;

  const withAnos = await Promise.all(
    cands.map(async (m) => {
      try {
        return { m, anos: await getJson<ParAno[]>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos/${m.code}/anos`) };
      } catch {
        return { m, anos: [] as ParAno[] };
      }
    })
  );

  // Among variants that list the exact year, prefer the most "base" trim.
  let chosen: { m: { name: string; code: string }; ano: ParAno } | null = null;
  const exacts = withAnos
    .map(({ m, anos }) => ({ m, ano: anos.find((a) => parseInt(a.nome, 10) === year) }))
    .filter((x): x is { m: { name: string; code: string }; ano: ParAno } => !!x.ano)
    .sort((a, b) => a.m.name.length - b.m.name.length);
  if (exacts[0]) chosen = exacts[0];
  if (!chosen) {
    let diff = Infinity;
    for (const { m, anos } of withAnos)
      for (const a of anos) {
        const y = parseInt(a.nome, 10);
        if (!Number.isFinite(y)) continue;
        if (Math.abs(y - year) < diff) {
          diff = Math.abs(y - year);
          chosen = { m, ano: a };
        }
      }
  }
  if (!chosen) return null;
  const pr = await getJson<ParPrice>(`${PARALLEL}/${kind}/marcas/${brand.code}/modelos/${chosen.m.code}/anos/${chosen.ano.codigo}`);
  const yr = parseInt(chosen.ano.nome, 10) || year;
  return { value: parseBRL(pr.Valor), codigoFipe: pr.CodigoFipe ?? "", label: `${brand.name} ${chosen.m.name} ${pr.AnoModelo ?? yr}`, year: yr };
}

function pickByName(list: { name: string; code: string }[], target: string) {
  const n = normalize(target);
  return list.find((x) => normalize(x.name) === n) ?? list.find((x) => normalize(x.name).includes(n));
}
// Models containing the searched name, shortest (most base) first, capped to
// keep upstream calls bounded.
function modelCandidates(list: { name: string; code: string }[], target: string) {
  const n = normalize(target);
  return list.filter((x) => normalize(x.name).includes(n)).sort((a, b) => a.name.length - b.name.length).slice(0, 24);
}
