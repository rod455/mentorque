"use client";

// A migalha do último passo, para saber o que o app estava fazendo quando
// desapareceu.
//
// O PROBLEMA QUE ISTO RESOLVE. Em 02/09/2026 um usuário relatou que o app
// FECHA ao responder o quiz no Android. O coletor de erros (lib/app/erros.ts)
// não tinha nada: ele enxerga exceção de JavaScript e promessa rejeitada, e
// nenhuma das duas fecha um app. Quando o processo do app (ou o renderizador
// da WebView) morre, o JavaScript morre junto e não sobra quem relate.
//
// A saída é escrever ANTES. A cada passo que vale a pena, gravamos no aparelho
// "estou aqui, agora". Se a próxima coisa que acontecer for uma abertura do
// app com essa migalha ainda quente, então a sessão anterior não terminou:
// ela foi interrompida. E a migalha diz em cima de qual passo.
//
// A trava contra falso positivo é o `pausado`: quando a pessoa manda o app
// para segundo plano, marcamos a migalha como fria. Aparelho apertado de
// memória mata app em segundo plano o tempo todo, e isso é normal do Android,
// não é o defeito que estamos caçando. O que interessa é morrer EM USO.

const CHAVE = "mq-ultimo-passo";

/**
 * De quanto tempo para trás a migalha ainda acusa fechamento.
 *
 * Três minutos. Acima disso a chance de ser outra coisa (aparelho desligado,
 * app dormindo até o sistema recolher) já é maior que a de ser o defeito, e um
 * relato errado é pior que nenhum: ele enche a tabela de ruído com cara de
 * dado e faz o QA caçar fantasma.
 */
const JANELA_MS = 3 * 60 * 1000;

type Migalha = { nome: string; t: number; pausado: boolean };

function ler(): Migalha | null {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return null;
    const m = JSON.parse(cru) as Partial<Migalha>;
    if (typeof m?.nome !== "string" || typeof m?.t !== "number") return null;
    return { nome: m.nome, t: m.t, pausado: m.pausado === true };
  } catch {
    return null;
  }
}

function gravar(m: Migalha): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(m));
  } catch {
    /* sem armazenamento: fica sem migalha, e é só isso que se perde */
  }
}

/** Registra em que passo o app está agora. Barato de propósito: uma escrita. */
export function passo(nome: string): void {
  if (typeof window === "undefined") return;
  gravar({ nome, t: Date.now(), pausado: false });
}

/** O app foi para segundo plano: a migalha esfria e para de acusar. */
export function esfriaMigalha(): void {
  const m = ler();
  if (m) gravar({ ...m, pausado: true });
}

/**
 * A sessão anterior morreu em uso? Devolve o passo em que ela estava.
 *
 * Consome a migalha: chamar duas vezes na mesma abertura devolve null na
 * segunda, senão o mesmo fechamento viraria dois relatos.
 */
export function fechamentoAnterior(): { nome: string; segundos: number } | null {
  if (typeof window === "undefined") return null;
  const m = ler();
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* segue */
  }
  if (!m || m.pausado) return null;
  const ha = Date.now() - m.t;
  if (ha < 0 || ha > JANELA_MS) return null;
  return { nome: m.nome, segundos: Math.round(ha / 1000) };
}

/** Liga o ouvinte que esfria a migalha quando o app sai da frente. */
export function vigiarPausa(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") esfriaMigalha();
  });
}
