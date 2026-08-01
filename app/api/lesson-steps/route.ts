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
    pt: "NÍVEL INICIANTE: a pessoa nunca abriu o capô e não sabe os nomes das peças. Seja MUITO descritivo. Para CADA passo: (1) diga ONDE fica a peça e COMO identificá-la — cor, formato, tamanho, 'ao lado de tal coisa', 'embaixo do motor'; (2) quebre ações em sub-passos (a, b, c); (3) diga o tempo/quantidade/aperto quando fizer sentido; (4) avise o que NÃO fazer. Exemplo do tom: 'Abra o capô e localize o bujão de dreno do óleo — é um parafuso grande de cabeça sextavada, embaixo do motor, no ponto mais baixo do cárter.' Gere MAIS passos, bem explicados. NÃO seja genérico como 'drene o óleo'.",
    en: "BEGINNER LEVEL: the person has never opened the hood and doesn't know part names. Be VERY descriptive. For EACH step: (1) say WHERE the part is and HOW to identify it — color, shape, size, 'next to X', 'under the engine'; (2) break actions into sub-steps (a, b, c); (3) give time/amount/torque when it helps; (4) warn what NOT to do. Tone example: 'Open the hood and find the oil drain plug — a large hex-head bolt under the engine, at the lowest point of the oil pan.' Produce MORE steps, well explained. Do NOT be generic like 'drain the oil.'",
  },
  avancado: {
    pt: "NÍVEL AVANÇADO: já tem prática. Passos claros e diretos, sem explicar o óbvio.",
    en: "ADVANCED LEVEL: has some practice. Clear, direct steps, no need to explain the obvious.",
  },
  mecanico: {
    pt: "NÍVEL MECÂNICO: profissional. Passos enxutos e técnicos, com torques/especificações e nomes técnicos, assumindo domínio total. Menos passos, densos.",
    en: "MECHANIC LEVEL: professional. Terse, technical steps with torques/specs and technical names, assuming full mastery. Fewer, denser steps.",
  },
} as const;

// Pull the first JSON array of strings out of the model's reply, tolerating
// stray prose or code fences around it.
function parseSteps(raw: string): string[] | null {
  let t = raw.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    const arr = JSON.parse(t);
    if (Array.isArray(arr)) {
      const steps = arr.map((x) => (typeof x === "string" ? x : x?.step ?? x?.text ?? "")).filter((s) => typeof s === "string" && s.trim());
      return steps.length ? steps : null;
    }
  } catch { /* fall through */ }
  return null;
}

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const locale = body.locale === "en" ? "en" : "pt";
  const pt = locale === "pt";
  const level = (body.level && LEVELS[body.level]) ? body.level : "avancado";
  const baseSteps = body.steps ?? [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || baseSteps.length === 0) return NextResponse.json({ ok: true, mode: "basic", reason: !apiKey ? "no_key" : "no_steps" });

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
      body: JSON.stringify({ model: process.env.BIELA_MODEL ?? "claude-sonnet-5", max_tokens: 1800, system, messages: [{ role: "user", content: userMsg }] }),
    });
    if (!res.ok) throw new Error(`anthropic_${res.status}`);
    const data = await res.json();
    const txt: string = Array.isArray(data.content) ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("") : "";
    const steps = parseSteps(txt);
    if (!steps) throw new Error("bad_shape");
    return NextResponse.json({ ok: true, mode: "ai", steps });
  } catch (err) {
    console.warn("[lesson-steps] adapt failed, falling back:", err);
    return NextResponse.json({ ok: true, mode: "basic", reason: "error", detail: String((err as Error)?.message ?? err) });
  }
}
