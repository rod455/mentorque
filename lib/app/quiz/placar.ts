"use client";

// Conversa do quiz com o servidor: manda a resposta, busca o "X% acertaram".
//
// Tudo aqui é opcional para a experiência. Sem rede, o quiz funciona inteiro:
// a pessoa responde, vê se acertou, lê a explicação e a sequência dela sobe. O
// que falta é só a frase da estatística, e a tela simplesmente não a mostra.
// Nenhuma chamada daqui pode bloquear, atrasar ou quebrar a resposta.
import { apiPost, apiUrl } from "../apiBase";
import { anonId } from "../anon";

export type Placar = {
  respostas: number;
  /** null = ainda é pouca gente para a frase significar algo. */
  percentual: number | null;
};

/** Manda a resposta do dia. Fire-and-forget de propósito. */
export function enviarResposta(o: {
  dia: string;
  perguntaId: string;
  acertou: boolean;
  userId?: string | null;
}): void {
  try {
    if (typeof window === "undefined") return;
    void apiPost("/api/quiz", {
      dia: o.dia,
      perguntaId: o.perguntaId,
      acertou: o.acertou,
      anonId: anonId(),
      userId: o.userId ?? null,
    }).catch(() => undefined);
  } catch {
    /* estatística nunca pode quebrar o quiz */
  }
}

/** Busca o placar do dia. `null` quando não deu (offline, erro, o que for). */
export async function placarDoDia(dia: string, perguntaId: string): Promise<Placar | null> {
  try {
    const url = `${apiUrl("/api/quiz")}?dia=${encodeURIComponent(dia)}&pergunta=${encodeURIComponent(perguntaId)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = (await res.json()) as { respostas?: number; percentual?: number | null };
    if (typeof d?.respostas !== "number") return null;
    return { respostas: d.respostas, percentual: typeof d.percentual === "number" ? d.percentual : null };
  } catch {
    return null;
  }
}
