import { NextResponse } from "next/server";
import {
  fipeBrands,
  fipeModels,
  fipePriceRaw,
  matchPrice,
  toPriceEntries,
  type VehicleKind,
} from "@/lib/app/fipe";

export const runtime = "nodejs";

const KINDS: VehicleKind[] = ["carros", "motos", "caminhoes"];
const kindOf = (v: string | null): VehicleKind => (KINDS.includes(v as VehicleKind) ? (v as VehicleKind) : "carros");

// CDN-cacheable: the FIPE table is monthly, so a day of edge cache is plenty.
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

function ok(data: unknown) {
  return NextResponse.json(data, { headers: { "cache-control": CACHE } });
}

// Proxy to BrasilAPI FIPE. Actions:
//   ?action=brands&type=carros
//   ?action=models&type=carros&brand=<codigoMarca>
//   ?action=price&code=<codigoFipe>
//   ?action=match&type=carros&brand=Volkswagen&model=Gol&year=2024
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "brands") {
      return ok(await fipeBrands(kindOf(searchParams.get("type"))));
    }
    if (action === "models") {
      const brand = searchParams.get("brand");
      if (!brand) return NextResponse.json({ error: "missing_brand" }, { status: 400 });
      return ok(await fipeModels(kindOf(searchParams.get("type")), brand));
    }
    if (action === "price") {
      const code = searchParams.get("code");
      if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
      return ok(toPriceEntries(await fipePriceRaw(code)));
    }
    if (action === "match") {
      const brand = searchParams.get("brand") ?? "";
      const model = searchParams.get("model") ?? "";
      const year = parseInt(searchParams.get("year") ?? "0", 10);
      const res = await matchPrice(kindOf(searchParams.get("type")), brand, model, year);
      if (!res) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return ok(res);
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (e) {
    // BrasilAPI down / shape changed — the client falls back to the estimate.
    return NextResponse.json({ error: "fipe_unavailable" }, { status: 502 });
  }
}
