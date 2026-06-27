// Server-side helpers around NHTSA's free, key-less, official APIs:
//   - Recalls       (api.nhtsa.gov/recalls)
//   - Complaints    (api.nhtsa.gov/complaints)
//   - Safety Ratings(api.nhtsa.gov/SafetyRatings)
//
// NHTSA covers the US market, so non-US models (most BR-only nameplates) return
// empty — callers must handle the empty/"no match" case gracefully. Every call
// is defensive: on any network/shape error it throws and the route answers 502.

const BASE = "https://api.nhtsa.gov";
const TIMEOUT_MS = 8000;

// Normalized shapes returned to the client.
export type RecallItem = {
  campaign: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  date: string;
};
export type ComplaintsSummary = {
  count: number;
  components: { name: string; count: number }[];
};
export type SafetyRating = {
  description: string;
  overall: string | null;
  frontCrash: string | null;
  sideCrash: string | null;
  rollover: string | null;
};

async function getJson(url: string): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json", "user-agent": "Mentorque/1.0 (+https://mentorque-ten.vercel.app)" },
    });
    if (!res.ok) throw new Error(`nhtsa ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// NHTSA responses are inconsistent about `results` vs `Results` casing.
const rows = (data: any): any[] => (Array.isArray(data?.results) ? data.results : Array.isArray(data?.Results) ? data.Results : []);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));

const q = (make: string, model: string, year: number) =>
  `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;

export async function getRecalls(make: string, model: string, year: number): Promise<RecallItem[]> {
  const data = await getJson(`${BASE}/recalls/recallsByVehicle?${q(make, model, year)}`);
  return rows(data)
    .map((r) => ({
      campaign: str(r.NHTSACampaignNumber),
      component: str(r.Component),
      summary: str(r.Summary),
      consequence: str(r.Consequence),
      remedy: str(r.Remedy),
      date: str(r.ReportReceivedDate),
    }))
    .filter((r) => r.summary || r.component);
}

export async function getComplaints(make: string, model: string, year: number): Promise<ComplaintsSummary> {
  const data = await getJson(`${BASE}/complaints/complaintsByVehicle?${q(make, model, year)}`);
  const list = rows(data);
  const tally = new Map<string, number>();
  for (const c of list) {
    // Each complaint lists one or more components, comma/“;”-separated.
    const comps = str(c.components || c.Component)
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
    for (const name of comps.length ? comps : ["—"]) tally.set(name, (tally.get(name) ?? 0) + 1);
  }
  const components = [...tally.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return { count: typeof data?.count === "number" ? data.count : list.length, components };
}

export async function getSafety(make: string, model: string, year: number): Promise<SafetyRating | null> {
  // Step 1: resolve the model-year/make/model to one or more VehicleIds.
  const idx = await getJson(`${BASE}/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`);
  const first = rows(idx)[0];
  const vehicleId = first?.VehicleId;
  if (!vehicleId) return null;
  // Step 2: pull the ratings for the first variant.
  const detail = await getJson(`${BASE}/SafetyRatings/VehicleId/${vehicleId}`);
  const r = rows(detail)[0];
  if (!r) return null;
  const norm = (v: unknown): string | null => {
    const s = str(v);
    return !s || s.toLowerCase().includes("not rated") || s === "0" ? null : s;
  };
  return {
    description: str(r.VehicleDescription || first.VehicleDescription),
    overall: norm(r.OverallRating),
    frontCrash: norm(r.OverallFrontCrashRating),
    sideCrash: norm(r.OverallSideCrashRating),
    rollover: norm(r.RolloverRating),
  };
}
