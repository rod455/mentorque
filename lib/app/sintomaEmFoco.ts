"use client";

// O sintoma que a pessoa estava investigando quando abriu a Biela.
//
// POR QUE ISTO EXISTE, se o sintoma JÁ ia junto. A tela do sintoma monta uma
// frase rica ("Meu Golf está com: barulho ao frear. O pedal treme sim; vem de
// um lado só não.") e usa como primeira mensagem. Funciona, e só na PRIMEIRA
// pergunta: a memória que a Biela recebe são três pares de conversa, então na
// quarta pergunta o recorte já comeu a anamnese e ela volta a responder no
// escuro, justamente quando a conversa está ficando específica.
//
// Aqui o sintoma vira CONTEXTO, que acompanha toda pergunta enquanto durar a
// sessão, em vez de mensagem, que envelhece e cai fora do recorte.
//
// Memória, como os códigos OBD2 (lib/app/obd2Consultados.ts) e pelo mesmo
// motivo: o que a pessoa investigava semana passada não deve colorir a pergunta
// de hoje.

const MAX_OBSERVACOES = 4;
const MAX_TEXTO = 120;

export type SintomaEmFoco = { nome: string; observou?: string[] };

let foco: SintomaEmFoco | null = null;

/**
 * Registra o sintoma em investigação e o que a pessoa respondeu na anamnese.
 *
 * Chamar ao ABRIR a Biela a partir de um sintoma. Nome vazio limpa: voltar para
 * uma conversa solta não deve arrastar o sintoma anterior.
 */
export function anotaSintoma(nome: string, observou?: string[]): void {
  const n = (nome ?? "").trim().slice(0, 60);
  if (!n) { foco = null; return; }
  const obs = (observou ?? [])
    .map((t) => (t ?? "").trim().slice(0, MAX_TEXTO))
    .filter(Boolean)
    .slice(0, MAX_OBSERVACOES);
  foco = { nome: n, ...(obs.length ? { observou: obs } : null) };
}

/** O sintoma desta sessão, ou `null`. */
export function sintomaEmFoco(): SintomaEmFoco | null {
  return foco;
}

/** Esquece. Existe para as conferências não vazarem estado entre casos. */
export function esqueceSintoma(): void {
  foco = null;
}
