import { NextResponse } from "next/server";
import { retrieveManualContext, type CarCtx } from "@/lib/rag";

export const runtime = "nodejs";

type Body = {
  title?: string;
  steps?: string[];
  need?: string[];
  safety?: string[];
  level?: "iniciante" | "avancado" | "mecanico";
  locale?: string;
  car?: CarCtx | null;
};

const LEVELS = {
  iniciante: {
    pt: "NÍVEL INICIANTE: quem nunca mexeu no carro. Detalhe MUITO cada passo, explique os termos, diga onde fica cada peça, quanto apertar, o que NÃO fazer, e quebre passos grandes em sub-passos numerados. Pode ter mais passos.",
    en: "BEGINNER LEVEL: someone who has never worked on a car. Explain each step in great detail, define terms, say where each part is, how much to tighten, what NOT to do, and break big steps into numbered sub-steps. It can have more steps.",
  },
  avancado: {
    pt: "NÍVEL AVANÇADO: já tem prática. Passos claros e diretos, sem explicar o óbvio.",
    en: "ADVANCED LEVEL: has some practice. Clear, direct steps, no need to explain the obvious.",
  },
  mecanico: {
    pt: "NÍVEL MECÂNICO: profissional. Passos enxutos e técnicos, com torques/especificações quando pertinente, assumindo domínio total.",
    en: "MECHANIC LEVEL: professional. Terse, technical steps with torques/specs when relevant, assuming full mastery.",
  },
} as const;

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const locale = body.locale === "en" ? "en" : "pt";
  const pt = locale === "pt";
  const level = (body.level && LEVELS[body.level]) ? body.level : "avancado";
  const baseSteps = body.steps ?? [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || baseSteps.length === 0) return NextResponse.json({ ok: true, mode: "basic" });

  try {
    const manual = await retrieveManualContext(
      `${body.title ?? ""} ${pt ? "passo a passo procedimento" : "step by step procedure"}`,
      body.car ?? null, 4
    );
    const system = pt
      ? `Você é o Biela, mecânico do app Mentorque. Reescreva o passo a passo de "${body.title}" ajustando a PROFUNDIDADE ao nível pedido. ${LEVELS[level].pt} Mantenha a segurança. Se houver trechos do manual do carro, use-os para números corretos. Responda APENAS um array JSON de strings (os passos), sem texto extra.`
      : `You are Biela, mechanic of the Mentorque app. Rewrite the step-by-step for "${body.title}" adjusting the DEPTH to the requested level. ${LEVELS[level].en} Keep safety in mind. If manual excerpts are given, use them for correct numbers. Reply with ONLY a JSON array of strings (the steps), no extra text.`;

    const userMsg = [
      `${pt ? "Passos atuais" : "Current steps"}:`,
      ...baseSteps.map((s, i) => `${i + 1}. ${s}`),
      body.car ? `\n${pt ? "Carro" : "Car"}: ${body.car.make ?? ""} ${body.car.model ?? ""} ${body.car.year ?? ""}` : "",
      manual ? `\n${pt ? "Trechos do manual" : "Manual excerpts"}:\n${manual}` : "",
    ].join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.BIELA_MODEL ?? "claude-sonnet-5", max_tokens: 1200, system, messages: [{ role: "user", content: userMsg }] }),
    });
    if (!res.ok) throw new Error(`anthropic_${res.status}`);
    const data = await res.json();
    let txt: string = Array.isArray(data.content) ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("") : "";
    txt = txt.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    const steps = JSON.parse(txt);
    if (!Array.isArray(steps) || !steps.every((x) => typeof x === "string")) throw new Error("bad_shape");
    return NextResponse.json({ ok: true, mode: "ai", steps });
  } catch (err) {
    console.warn("[lesson-steps] adapt failed, falling back:", err);
    return NextResponse.json({ ok: true, mode: "basic" });
  }
}
