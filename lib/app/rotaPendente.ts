// Para onde o toque num aviso quer levar a pessoa.
//
// O DEFEITO QUE ISTO CONSERTA, relatado pelo dono em 03/09/2026: o aviso das
// 9h chega dizendo "responda a pergunta do dia", a pessoa toca, e o app abre
// no Início. Ela tem de achar o chip do quiz no topo e tocar de novo. O aviso
// cumpriu a parte difícil (trouxe a pessoa de volta) e desperdiçou o resultado
// no último passo.
//
// A causa era simples e completa: NÃO HAVIA OUVINTE NENHUM de toque em aviso,
// nem no local nem no push. O sistema abria o app, e abrir o app é tudo o que
// acontecia. Os avisos também não carregavam destino: eram título e corpo, e
// nada mais.
//
// POR QUE ISTO NÃO VAI PARA O ARMAZENAMENTO, ao contrário da venda pendente
// (lib/app/vendaPendente.ts). Lá o estado precisava atravessar um recarregamento
// de página inteiro, porque o login social sai do nosso domínio e volta. Aqui
// não atravessa nada: o evento de toque só pode chegar DEPOIS de o nosso
// próprio ouvinte existir, e o ouvinte vive neste mesmo JavaScript. Memória
// basta, e memória é melhor: rota guardada em disco viraria uma abertura
// sequestrada dias depois, quando a pessoa abrisse o app por vontade própria e
// fosse jogada num quiz por causa de um aviso que ela tocou na semana passada.
//
// A parte que precisa de cuidado é o app FECHADO. O toque acontece antes de
// existir JavaScript, e o Capacitor guarda esses dois eventos
// (`localNotificationActionPerformed` e `pushNotificationActionPerformed`) com
// `retainUntilConsumed`: eles ficam retidos até alguém assinar, e só então são
// entregues. É por isso que registrar o ouvinte tarde não perde o toque, e é
// por isso que este arquivo guarda a rota em vez de só avisar quem estiver
// ouvindo: quando o aviso chega, a tela pode ainda não estar montada.

export type RotaDeAviso = "quiz";

// Lista fechada, e é a fronteira de confiança deste arquivo. O que chega aqui
// vem de fora do app: do payload de um push, que é escrito no servidor e viaja
// pelo Google e pela Apple. Nome que não estiver nesta lista é ignorado, então
// nenhum payload consegue empurrar o app para uma tela que a gente não
// escolheu de propósito.
const CONHECIDAS: readonly string[] = ["quiz"];

let pendente: RotaDeAviso | null = null;
const ouvintes = new Set<() => void>();

/** O nome é uma rota que a gente aceita? Puro, para poder ser conferido. */
export function nomeDeRota(v: unknown): RotaDeAviso | null {
  return typeof v === "string" && CONHECIDAS.includes(v) ? (v as RotaDeAviso) : null;
}

/**
 * Anota a rota que o aviso pediu e acorda quem estiver esperando.
 *
 * Nome desconhecido (ou aviso sem destino, que é o caso de todo aviso agendado
 * por uma versão anterior a esta) não é erro: é uma abertura normal do app.
 */
export function anotaRota(v: unknown): void {
  const r = nomeDeRota(v);
  if (!r) return;
  pendente = r;
  // Cópia da lista antes de percorrer: um ouvinte que se desinscreve durante o
  // próprio aviso mudaria o conjunto no meio do laço.
  for (const o of [...ouvintes]) {
    try {
      o();
    } catch {
      /* um ouvinte com problema não pode calar os outros */
    }
  }
}

/** A rota pedida, se houver uma esperando. */
export function rotaPendente(): RotaDeAviso | null {
  return pendente;
}

/**
 * Esquece a rota. Chamada ANTES de navegar, nunca depois: é o que garante que
 * um toque leva a uma navegação, e não a uma tela que se reabre sozinha toda
 * vez que o roteador remonta.
 */
export function esqueceRota(): void {
  pendente = null;
}

/**
 * Avisa quando uma rota for anotada. Devolve a função de cancelar.
 *
 * Quem assina deve consumir a rota na hora de assinar TAMBÉM, e não só quando
 * o aviso chegar: no app aberto pelo toque, a anotação acontece antes de a
 * tela existir, e um assinante que só escuta o futuro nunca saberia dela.
 */
export function aoAnotarRota(cb: () => void): () => void {
  ouvintes.add(cb);
  return () => {
    ouvintes.delete(cb);
  };
}
