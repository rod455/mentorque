import { NextResponse } from "next/server";
import { retrieveManualContext, type CarCtx as Car } from "@/lib/rag";

export const runtime = "nodejs";
// Teto de duracao: funcao pendurada segura memoria provisionada (e cota).
export const maxDuration = 30;

type Turno = { role?: string; content?: string };
type ServicoResumido = { o?: string; em?: string; km?: number };
type Contexto = {
  servicos?: ServicoResumido[];
  obd2?: string[];
  sintoma?: { nome?: string; observou?: string[] };
};
type Body = {
  question?: string;
  locale?: string;
  car?: Car | null;
  historico?: Turno[];
  /** O que já foi feito no carro, o código lido e o sintoma em investigação. */
  contexto?: Contexto | null;
};

// Tetos do contexto do carro, revalidados AQUI.
//
// O app já poda em lib/app/contextoDoCarro.ts, e isso não basta: esta é a borda
// pública, e o que chega nela é o que alguém quis mandar. Sem revalidar, um
// corpo forjado vira um prompt gigante pago por nós, que é a mesma razão pela
// qual `historicoLimpo` existe logo abaixo.
const MAX_SERVICOS = 6;
const MAX_TEXTO = 120;
const CODIGO_OBD2 = /^[PBCU][0-9A-F]{4}$/i;

const texto = (v: unknown, n = MAX_TEXTO) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** O contexto do carro, limpo e com teto. Devolve "" quando não sobrar nada. */
function contextoLimpo(bruto: Contexto | null | undefined, pt: boolean): string {
  if (!bruto || typeof bruto !== "object") return "";
  const linhas: string[] = [];

  const servicos = Array.isArray(bruto.servicos) ? bruto.servicos.slice(0, MAX_SERVICOS) : [];
  const feitos = servicos
    .map((s) => {
      const o = texto(s?.o);
      if (!o) return "";
      const em = /^\d{4}-\d{2}-\d{2}$/.test(String(s?.em)) ? String(s?.em) : "";
      const km = Number.isFinite(s?.km) ? `${s?.km} km` : "";
      return `- ${o}${em ? ` em ${em}` : ""}${km ? `, com ${km}` : ""}`;
    })
    .filter(Boolean);
  if (feitos.length) {
    linhas.push(
      pt
        ? `Serviços já feitos neste carro (mais novo primeiro):\n${feitos.join("\n")}\nUSE ISTO: não recomende o que acabou de ser feito, e cite a data quando ela mudar a resposta.`
        : `Work already done on this car (newest first):\n${feitos.join("\n")}\nUSE THIS: don't recommend what was just done, and cite the date when it changes the answer.`
    );
  }

  const codigos = (Array.isArray(bruto.obd2) ? bruto.obd2 : [])
    .filter((c) => typeof c === "string" && CODIGO_OBD2.test(c))
    .slice(0, 3)
    .map((c) => c.toUpperCase());
  if (codigos.length) {
    linhas.push(
      pt
        ? `Código de erro lido pelo scanner: ${codigos.join(", ")}. É o dado mais duro que existe aqui: trate como ponto de partida do diagnóstico.`
        : `Trouble code read by the scanner: ${codigos.join(", ")}. It's the hardest datum available here: treat it as the starting point.`
    );
  }

  const nome = texto(bruto.sintoma?.nome, 60);
  if (nome) {
    const observou = (Array.isArray(bruto.sintoma?.observou) ? bruto.sintoma?.observou : [])
      .map((t) => texto(t))
      .filter(Boolean)
      .slice(0, 4);
    linhas.push(
      pt
        ? `A pessoa chegou investigando: ${nome}.${observou.length ? ` Observou: ${observou.join("; ")}.` : ""}`
        : `The person came in investigating: ${nome}.${observou.length ? ` Observed: ${observou.join("; ")}.` : ""}`
    );
  }

  return linhas.length ? `\n\n${linhas.join("\n\n")}` : "";
}

// Memória curta da conversa.
//
// O aplicativo já manda recortado (lib/app/bielaChat.ts), mas isto aqui é a
// borda pública: revalida a alternância que a API da Anthropic exige (user →
// assistant, começando em user) e corta o tamanho, para uma requisição forjada
// não virar um prompt gigante pago por nós.
const MAX_TURNOS = 3;

function historicoLimpo(bruto: Turno[] | undefined): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(bruto)) return [];
  const pares: { role: "user" | "assistant"; content: string }[][] = [];
  for (let i = 0; i + 1 < bruto.length; i += 2) {
    const p = bruto[i];
    const r = bruto[i + 1];
    if (p?.role !== "user" || r?.role !== "assistant") break; // fora de ordem: descarta daqui em diante
    const pergunta = typeof p.content === "string" ? p.content.trim().slice(0, 500) : "";
    const resposta = typeof r.content === "string" ? r.content.trim().slice(0, 1500) : "";
    if (!pergunta || !resposta) break;
    pares.push([
      { role: "user", content: pergunta },
      { role: "assistant", content: resposta },
    ]);
  }
  return pares.slice(-MAX_TURNOS).flat();
}

// System prompt: Biela's persona + safety rails. Car context is injected below.
function systemPrompt(locale: string, car: Car | null, contexto?: Contexto | null): string {
  const pt = locale === "pt";
  const persona = pt
    ? `Você é o Biela, mecânico automotivo do app Mentorque — experiente e direto, respondendo em português do Brasil.

RESPONDA A PERGUNTA, e só ela. Comece pela resposta, não pelo contexto. Sem introdução, sem "ótima pergunta", sem resumo no fim.

TAMANHO: curto. Duas a cinco frases na maioria dos casos. Só passe disso quando pedirem um passo a passo — e aí use uma lista curta, não parágrafos.

TEORIA SÓ SE PERGUNTAREM. Não explique o mecanismo por trás a menos que a pergunta seja "por que". Quem pergunta de quanto em quanto tempo troca o óleo quer o intervalo, não uma aula de lubrificação.

PERGUNTA VAGA: responda o caso mais provável e feche com UMA linha dizendo o que mudaria o diagnóstico. Não liste cinco hipóteses, e não devolva a pergunta.

PRECISÃO: números concretos quando tiver certeza ou quando vierem do manual fornecido. NUNCA invente número — sem certeza, mande conferir o manual do modelo.

SEGURANÇA: freio, direção, airbag e suspensão pedem inspeção presencial. Diga isso em uma frase, sem sermão.`
    : `You are Biela, an automotive mechanic in the Mentorque app — experienced and direct, answering in English.

ANSWER THE QUESTION, and only it. Lead with the answer, not the context. No preamble, no "great question", no closing summary.

LENGTH: short. Two to five sentences in most cases. Go longer only when asked for step-by-step — and then use a short list, not paragraphs.

THEORY ONLY IF ASKED. Don't explain the underlying mechanism unless the question is "why". Someone asking how often to change the oil wants the interval, not a lecture on lubrication.

VAGUE QUESTION: answer the most likely case and close with ONE line on what would change the diagnosis. Don't list five hypotheses, and don't bounce the question back.

PRECISION: concrete numbers when you're sure or when they come from the provided manual. NEVER invent a number — if unsure, say to check the model's manual.

SAFETY: brakes, steering, airbags and suspension warrant an in-person inspection. Say it in one sentence, no lecture.`;
  // Motor e versão entram quando existem. Sem eles a Biela devolvia "depende da
  // versão que você comprou" para gente que já tinha preenchido a versão — o
  // dado estava no cadastro e nunca saía de lá.
  const detalhe = [car?.engine, car?.version].filter(Boolean).join(" ");
  const ctx = car
    ? (pt ? `\n\nCarro do usuário: ${car.make ?? "?"} ${car.model ?? ""} ${car.year ?? ""}${detalhe ? `, ${detalhe}` : ""}${car.km != null ? `, ${car.km} km` : ""}. Personalize a resposta para esse carro quando fizer diferença.${detalhe ? " A motorização e a versão estão informadas acima: NÃO pergunte qual é, nem responda \'depende da versão\'." : ""}`
          : `\n\nUser's car: ${car.make ?? "?"} ${car.model ?? ""} ${car.year ?? ""}${detalhe ? `, ${detalhe}` : ""}${car.km != null ? `, ${car.km} km` : ""}. Tailor the answer to this car when it matters.${detalhe ? " The engine and trim are given above: do NOT ask which one it is, and don't answer \'it depends on the trim\'." : ""}`)
    : "";
  return persona + ctx + contextoLimpo(contexto, pt);
}

function basicAnswer(locale: string, car: Car | null): string {
  const name = car?.make ? `${car.make} ${car.model ?? ""}`.trim() : locale === "pt" ? "seu carro" : "your car";
  return locale === "pt"
    ? `Sobre o ${name}: me diga o sintoma exato (que barulho, quando acontece, alguma luz no painel) que eu afunilo o diagnóstico. Para intervalos, o manual do fabricante manda. Freio, direção e suspensão pedem inspeção presencial. 🐻`
    : `About ${name}: tell me the exact symptom (what noise, when it happens, any dashboard light) and I'll narrow the diagnosis. For intervals, the maker's manual rules. Brakes, steering and suspension warrant an in-person inspection. 🐻`;
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
  const historico = historicoLimpo(body.historico);
  if (!question) return NextResponse.json({ ok: false, error: "empty_question" }, { status: 422 });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No AI key configured yet → answer in "basic" mode so the chat still works.
  // TODO (RAG): before calling Claude, retrieve the relevant manual passages for
  // car.make/model from Supabase (pgvector over the uploaded manuals) and inject
  // them into the system prompt so intervals/torques are model-accurate.
  if (!apiKey) {
    // Registrado de propósito: sem esta linha, "modo básico por falta de chave"
    // e "modo básico porque a chamada falhou" ficam idênticos no aparelho, e os
    // registros da Vercel ficam mudos — o único jeito de distinguir era abrir o
    // app e ler a resposta. Agora aparece na Vercel, em segundos.
    console.warn("[biela] ANTHROPIC_API_KEY ausente no ambiente — respondendo em modo básico");
    return NextResponse.json({ ok: true, mode: "basic", answer: basicAnswer(locale, car) });
  }

  try {
    // Ground the answer in the model's manual when the RAG is configured.
    //
    // Cinco trechos, não oito: o manual é a maior parte da entrada e é
    // reenviado a cada pergunta, e num prompt de resposta curta os últimos
    // trechos eram contexto que o modelo ignorava. O que sobrou paga a memória
    // dos três turnos abaixo — a conta por pergunta fica onde estava.
    const manual = await retrieveManualContext(question, car, 5);
    let system = systemPrompt(locale, car, body.contexto);
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
        // Teto, não alvo. Quem dita o tamanho é o prompt (2 a 5 frases); isto
        // aqui só impede o texto gigante quando ele resolve desobedecer.
        //
        // Baixou de 900 para 600 junto com o prompt. Não desce mais: teto curto
        // demais corta a resposta no meio da frase, e uma resposta cortada é
        // pior que uma comprida.
        max_tokens: 600,
        system,
        // Os últimos turnos entram antes da pergunta: sem isso, "e o nitro?"
        // depois de uma resposta sobre óleo chegava sem nada atrás.
        messages: [...historico, { role: "user", content: question }],
      }),
    });
    // O corpo do erro é lido e registrado de propósito.
    //
    // Todas as causas possíveis aqui desembocam na MESMA tela para o motorista
    // ("modo básico"), e o status sozinho não separa as principais: 400 vale
    // tanto para saldo esgotado quanto para requisição torta. A Anthropic diz
    // qual é em texto claro ("Your credit balance is too low…", "model not
    // found"), então guardar essa frase transforma o diagnóstico numa consulta
    // aos registros, em vez de um chute por eliminação. A chave não aparece —
    // ela vai só no cabeçalho, que não é registrado.
    if (!res.ok) {
      const detalhe = await res.text().catch(() => "");
      throw new Error(`anthropic_${res.status}: ${detalhe.slice(0, 500)}`);
    }
    const data = await res.json();
    const answer = Array.isArray(data.content)
      ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim()
      : "";
    // `usedManual` vai junto para o registro do voto: quando alguém marca a
    // resposta como ruim, saber se ela veio do manual do carro ou de
    // conhecimento geral é a primeira coisa a olhar.
    return NextResponse.json({ ok: true, mode: "ai", answer: answer || basicAnswer(locale, car), usedManual: !!manual });
  } catch (err) {
    console.warn("[biela] AI call failed, falling back:", err);
    return NextResponse.json({ ok: true, mode: "basic", answer: basicAnswer(locale, car) });
  }
}
