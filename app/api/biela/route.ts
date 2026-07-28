import { NextResponse } from "next/server";
import { retrieveManualContext, type CarCtx as Car } from "@/lib/rag";

export const runtime = "nodejs";

type Body = { question?: string; locale?: string; car?: Car | null };

// System prompt: Biela's persona + safety rails. Car context is injected below.
function systemPrompt(locale: string, car: Car | null): string {
  const pt = locale === "pt";
  const persona = pt
    ? `Você é o Biela, mecânico automotivo do app Mentorque — experiente, técnico e didático, respondendo em português do Brasil.
PROFUNDIDADE: vá fundo quando a pergunta pedir. Explique o MECANISMO (por que acontece), os MODOS DE FALHA mais comuns e o raciocínio de DIAGNÓSTICO (o que checar, em que ordem, como isolar a causa). Relacione sistemas quando fizer sentido (ex.: consumo alto ligado a sonda lambda, filtro, pressão de pneu).
PRECISÃO: traga especificações concretas (intervalos, torques, folgas, capacidades, códigos) quando tiver certeza ou quando vierem do manual fornecido. NUNCA invente números — se não souber, diga para conferir o manual do modelo.
ESTILO: denso e preciso, não prolixo — profundidade sem encher linguiça. Use o tamanho que a pergunta exigir. Adapte a linguagem ao dono leigo, mas sem empobrecer o conteúdo técnico. Use listas curtas quando ajudar.
SEGURANÇA: em itens de segurança (freio, direção, airbag, suspensão), recomende inspeção presencial.`
    : `You are Biela, an automotive mechanic in the Mentorque app — experienced, technical and didactic, answering in English.
DEPTH: go deep when the question calls for it. Explain the MECHANISM (why it happens), the common FAILURE MODES and the DIAGNOSTIC reasoning (what to check, in what order, how to isolate the cause). Connect systems when relevant (e.g. high consumption tied to the O2 sensor, filter, tire pressure).
PRECISION: give concrete specs (intervals, torques, clearances, capacities, codes) when you're sure or when they come from the provided manual. NEVER invent numbers — if unsure, say to check the model's manual.
STYLE: dense and precise, not wordy — depth without padding. Use the length the question needs. Adapt the language to a lay owner without dumbing down the technical content. Use short lists when they help.
SAFETY: for safety items (brakes, steering, airbags, suspension), recommend an in-person inspection.`;
  const ctx = car
    ? (pt ? `\n\nCarro do usuário: ${car.make ?? "?"} ${car.model ?? ""} ${car.year ?? ""}${car.km != null ? `, ${car.km} km` : ""}. Personalize a resposta para esse carro quando fizer diferença.`
          : `\n\nUser's car: ${car.make ?? "?"} ${car.model ?? ""} ${car.year ?? ""}${car.km != null ? `, ${car.km} km` : ""}. Tailor the answer to this car when it matters.`)
    : "";
  return persona + ctx;
}

function basicAnswer(locale: string, car: Car | null): string {
  const name = car?.make ? `${car.make} ${car.model ?? ""}`.trim() : locale === "pt" ? "seu carro" : "your car";
  return locale === "pt"
    ? `Ótima pergunta! Sobre o ${name}: o caminho seguro é partir dos sintomas exatos (que barulho, quando acontece, alguma luz no painel) e do manual do fabricante para os intervalos certos. Se envolver freio, direção ou suspensão, não arrisque — vale uma inspeção presencial. Me dá mais detalhes que eu ajudo a afunilar o diagnóstico. 🐻`
    : `Great question! About ${name}: the safe path is to start from the exact symptoms (what noise, when it happens, any dashboard light) and the maker's manual for the right intervals. If it involves brakes, steering or suspension, don't risk it — an in-person inspection is worth it. Give me more detail and I'll help narrow the diagnosis. 🐻`;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const locale = body.locale === "en" ? "en" : "pt";
  const car = body.car ?? null;
  if (!question) return NextResponse.json({ ok: false, error: "empty_question" }, { status: 422 });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No AI key configured yet → answer in "basic" mode so the chat still works.
  // TODO (RAG): before calling Claude, retrieve the relevant manual passages for
  // car.make/model from Supabase (pgvector over the uploaded manuals) and inject
  // them into the system prompt so intervals/torques are model-accurate.
  if (!apiKey) {
    return NextResponse.json({ ok: true, mode: "basic", answer: basicAnswer(locale, car) });
  }

  try {
    // Ground the answer in the model's manual when the RAG is configured.
    const manual = await retrieveManualContext(question, car, 8);
    let system = systemPrompt(locale, car);
    if (manual) {
      system += (locale === "pt"
        ? `\n\nTrechos do manual do carro (use como fonte primária; se não cobrir a dúvida, diga o que é geral):\n${manual}`
        : `\n\nManual excerpts for this car (use as the primary source; if they don't cover it, say what's general):\n${manual}`);
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.BIELA_MODEL ?? "claude-sonnet-5",
        max_tokens: 900, // a cap, not a fixed cost — dense answers stay short, deep ones can breathe
        system,
        messages: [{ role: "user", content: question }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic_${res.status}`);
    const data = await res.json();
    const answer = Array.isArray(data.content)
      ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim()
      : "";
    return NextResponse.json({ ok: true, mode: "ai", answer: answer || basicAnswer(locale, car) });
  } catch (err) {
    console.warn("[biela] AI call failed, falling back:", err);
    return NextResponse.json({ ok: true, mode: "basic", answer: basicAnswer(locale, car) });
  }
}
