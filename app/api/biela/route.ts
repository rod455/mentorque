import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Car = { make?: string; model?: string; year?: number; km?: number | null };
type Body = { question?: string; locale?: string; car?: Car | null };

// System prompt: Biela's persona + safety rails. Car context is injected below.
function systemPrompt(locale: string, car: Car | null): string {
  const pt = locale === "pt";
  const persona = pt
    ? `Você é o Biela, um urso mecânico simpático e didático do app Mentorque. Você entende muito de manutenção automotiva e explica de forma simples, prática e honesta, em português do Brasil. Seja direto e útil; dê valores e intervalos aproximados quando fizer sentido. NUNCA invente torques ou intervalos exatos que você não tem certeza — nesses casos, oriente a conferir o manual do modelo. Em itens de segurança (freio, direção, airbag, suspensão), sempre recomende inspeção presencial. Respostas curtas (até ~5 frases), tom de amigo mecânico.`
    : `You are Biela, a friendly, didactic mechanic bear from the Mentorque app. You know car maintenance deeply and explain it simply, practically and honestly, in English. Be direct and useful; give ballpark figures and intervals when helpful. NEVER invent exact torques or intervals you're unsure of — in those cases tell the user to check their model's manual. For safety items (brakes, steering, airbags, suspension) always recommend an in-person inspection. Keep answers short (~5 sentences), like a mechanic friend.`;
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.BIELA_MODEL ?? "claude-sonnet-5",
        max_tokens: 600,
        system: systemPrompt(locale, car),
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
