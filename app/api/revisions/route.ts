import { NextResponse } from "next/server";
import { retrieveManualContext, type CarCtx } from "@/lib/rag";

export const runtime = "nodejs";

type Svc = { type: string; date: string; km: number; parts?: { name: string }[] };
type Body = { car?: (CarCtx & { engine?: string; purchaseDate?: string }) | null; services?: Svc[]; locale?: string };

// The plan shape returned to the client.
type PlanItem = { item: string; status: "overdue" | "soon" | "ok" | "unknown"; when: string; note?: string; source: "manual" | "general"; serviceType?: string };

function historyText(services: Svc[], pt: boolean): string {
  if (!services.length) return pt ? "Nenhum serviço registrado ainda." : "No services logged yet.";
  return services
    .slice(0, 30)
    .map((s) => `- ${s.type} @ ${s.km} km (${s.date})${s.parts?.length ? ` — ${s.parts.map((p) => p.name).join(", ")}` : ""}`)
    .join("\n");
}

const SCHEMA_HINT = `Return ONLY valid JSON, no markdown, in this exact shape:
{"summary": string, "items": [{"item": string, "status": "overdue"|"soon"|"ok"|"unknown", "when": string, "note": string, "source": "manual"|"general", "serviceType": string}]}
- "item": the maintenance item (e.g. "Troca de óleo").
- "status": overdue = past due, soon = within ~2000 km or ~3 months, ok = fine, unknown = not enough data.
- "when": short human phrase for when it's due (e.g. "em ~3.000 km", "vencida há 2 meses", "faltam ~8 meses").
- "note": one short practical tip or why (optional).
- "source": "manual" if grounded in the manual excerpts, else "general".
- "serviceType": one of oil, brakes, revision, suspension, tires, battery, timing, airfilter, brakefluid, other (best match).
Order items worst-first (overdue, then soon, then ok). Max 8 items.`;

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const locale = body.locale === "en" ? "en" : "pt";
  const pt = locale === "pt";
  const car = body.car ?? null;
  const services = body.services ?? [];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No AI configured → tell the client to render its deterministic plan.
  if (!apiKey || !car) return NextResponse.json({ ok: true, mode: "basic" });

  try {
    const manual = await retrieveManualContext(
      pt ? "plano de manutenção revisão intervalos troca de óleo filtros correia freios km meses" : "maintenance schedule service intervals oil filter timing belt brakes km months",
      car, 8
    );

    const carLine = `${car.make ?? "?"} ${car.model ?? ""} ${car.year ?? ""}${car.engine ? " " + car.engine : ""}`.trim();
    const owned = car.purchaseDate ? (pt ? `Comprado em ${car.purchaseDate}.` : `Bought on ${car.purchaseDate}.`) : "";
    const kmLine = car.km != null ? `${car.km} km` : (pt ? "km não informado" : "mileage unknown");

    const system = pt
      ? `Você é o Biela, mecânico do app Mentorque. Monte um plano de próximas revisões PERSONALIZADO cruzando: o manual do carro (quando houver), o histórico de serviços do dono, o km atual e o tempo desde a compra. Priorize o que está vencido ou próximo. Use os intervalos do manual como fonte primária; se não houver, use recomendações gerais confiáveis e marque source="general". Nunca invente números específicos que não estejam no manual. ${SCHEMA_HINT}`
      : `You are Biela, mechanic of the Mentorque app. Build a PERSONALIZED upcoming-service plan combining: the car manual (when available), the owner's service history, current mileage and time since purchase. Prioritize what's overdue or due soon. Use the manual's intervals as the primary source; otherwise use reliable general recommendations and mark source="general". Never invent specific numbers not in the manual. ${SCHEMA_HINT}`;

    const userMsg = [
      `${pt ? "Carro" : "Car"}: ${carLine}`,
      `${pt ? "Km atual" : "Current mileage"}: ${kmLine}`,
      owned,
      "",
      `${pt ? "Histórico de serviços" : "Service history"}:`,
      historyText(services, pt),
      "",
      manual ? `${pt ? "Trechos do manual" : "Manual excerpts"}:\n${manual}` : (pt ? "(Manual não disponível para este modelo.)" : "(No manual available for this model.)"),
    ].filter((l) => l !== undefined).join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.BIELA_MODEL ?? "claude-sonnet-5",
        max_tokens: 1500,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic_${res.status}`);
    const data = await res.json();
    let txt: string = Array.isArray(data.content) ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("") : "";
    txt = txt.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    const plan = JSON.parse(txt) as { summary?: string; items?: PlanItem[] };
    if (!Array.isArray(plan.items)) throw new Error("bad_plan_shape");
    return NextResponse.json({ ok: true, mode: "ai", grounded: !!manual, plan: { summary: plan.summary ?? "", items: plan.items.slice(0, 8) } });
  } catch (err) {
    console.warn("[revisions] AI plan failed, falling back:", err);
    return NextResponse.json({ ok: true, mode: "basic" });
  }
}
