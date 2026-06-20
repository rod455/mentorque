import { NextResponse } from "next/server";
import { getBrands, getModels, getPrices, matchPrice, type VehicleKind } from "@/lib/app/fipe";

export const runtime = "nodejs";

const KINDS: VehicleKind[] = ["carros", "motos", "caminhoes"];
const kindOf = (v: string | null): VehicleKind => (KINDS.includes(v as VehicleKind) ? (v as VehicleKind) : "carros");

// CDN-cacheable: the FIPE table is monthly, so a day of edge cache is plenty.
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";
const ok = (data: unknown) => NextResponse.json(data, { headers: { "cache-control": CACHE } });

// Proxy to FIPE (BrasilAPI → Parallelum fallback). Actions:
//   ?action=brands&type=carros
//   ?action=models&type=carros&brand=<enc>
//   ?action=price&type=carros&code=<enc>
//   ?action=match&type=carros&brand=Volkswagen&model=Gol&year=2024
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const kind = kindOf(searchParams.get("type"));

  try {
    if (action === "brands") return ok(await getBrands(kind));
    if (action === "models") {
      const brand = searchParams.get("brand");
      if (!brand) return NextResponse.json({ error: "missing_brand" }, { status: 400 });
      return ok(await getModels(kind, brand));
    }
    if (action === "price") {
      const code = searchParams.get("code");
      if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
      return ok(await getPrices(kind, code));
    }
    if (action === "match") {
      const res = await matchPrice(kind, searchParams.get("brand") ?? "", searchParams.get("model") ?? "", parseInt(searchParams.get("year") ?? "0", 10));
      if (!res) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return ok(res);
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: "fipe_unavailable", detail: e instanceof Error ? e.message : String(e) },
      { status: 502, headers: { "cache-control": "no-store" } }
    );
  }
}
