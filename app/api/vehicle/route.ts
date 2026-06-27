import { NextResponse } from "next/server";
import { getComplaints, getRecalls, getSafety } from "@/lib/app/nhtsa";

export const runtime = "nodejs";

// NHTSA data changes slowly (recalls/ratings are not real-time): a day of edge
// cache with a week of stale-while-revalidate keeps it fresh enough and cheap.
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";
const ok = (data: unknown) => NextResponse.json(data, { headers: { "cache-control": CACHE } });

// Proxy to the NHTSA suite. Actions:
//   ?action=recalls&make=Honda&model=Civic&year=2020
//   ?action=complaints&make=Honda&model=Civic&year=2020
//   ?action=safety&make=Honda&model=Civic&year=2020
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const make = searchParams.get("make") ?? "";
  const model = searchParams.get("model") ?? "";
  const year = parseInt(searchParams.get("year") ?? "0", 10);

  if (!make || !model || !year) return NextResponse.json({ error: "missing_params" }, { status: 400 });

  try {
    if (action === "recalls") return ok(await getRecalls(make, model, year));
    if (action === "complaints") return ok(await getComplaints(make, model, year));
    if (action === "safety") return ok(await getSafety(make, model, year));
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch {
    // NHTSA down / shape changed — the client treats this as "no data".
    return NextResponse.json({ error: "nhtsa_unavailable" }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
