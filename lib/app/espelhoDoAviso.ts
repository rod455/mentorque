// O interruptor de avisos, quando ele deve seguir o aparelho e quando não.
//
// Isto é uma regra de três linhas que mora fora da tela por um motivo: ela
// errou. A primeira versão vivia dentro do Profile.tsx e forçava o interruptor
// a seguir o sistema NOS DOIS SENTIDOS. Com a permissão concedida, desligar
// virou impossível: o toque desligava, o efeito rodava de novo, via o sistema
// dizendo "concedida" e religava na cara da pessoa. Regra que erra assim é
// regra que precisa ser exercitada de verdade, e não conferida por leitura de
// texto (ver scripts/verifica-aviso.ts).
//
// A ASSIMETRIA É O CORAÇÃO DISTO:
//
//   SEM permissão, ligado é MENTIRA. Não é preferência, é um estado que o
//   aparelho não deixa existir: `sincronizarLembreteQuiz` sai fora sem
//   permissão, então nada é agendado. Interruptor ligado, nenhum aviso, e nada
//   na tela dizendo isso. Foi o relato do dono em 07/09/2026.
//
//   COM permissão, desligado é ESCOLHA. "Tenho permissão e não quero os
//   lembretes" é uma frase legítima, e o app não tem nada que discutir com
//   ela.
//
// Sobram dois casos em que ligar sozinho é o certo, e os dois são a pessoa
// pedindo: a PRIMEIRA olhada, onde a discordância é resto de estado velho e
// não decisão de ninguém, e a permissão que MUDOU no aparelho desde a última
// olhada, que só acontece se ela foi aos ajustes e ligou lá.

export type OlhadaNoSistema = {
  /** O sistema concede avisos AGORA? */
  concedida: boolean;
  /** O interruptor do app, como está guardado na sessão. */
  ligadoNoApp: boolean;
  /**
   * O que o sistema respondeu na olhada ANTERIOR desta tela, ou null se esta é
   * a primeira. É só isto que separa "a pessoa acabou de desligar aqui" de "a
   * pessoa acabou de ligar nos ajustes": nos dois o sistema diz "concedida" e
   * o app diz "desligado", e sem memória os dois são o mesmo retrato.
   */
  sistemaAntes: boolean | null;
};

export type Veredito = {
  /** A linha mostra "bloqueado" e o toque nela vira caminho para os ajustes. */
  bloqueado: boolean;
  /** Novo valor do interruptor, ou null para não mexer no que a pessoa escolheu. */
  ligar: boolean | null;
};

export function espelhaOAparelho({ concedida, ligadoNoApp, sistemaAntes }: OlhadaNoSistema): Veredito {
  if (!concedida) {
    // Bloqueado sempre, e desligado sempre que estiver ligado. Repetir o
    // `setNotifications(false)` a cada olhada seria gravar sessão à toa.
    return { bloqueado: true, ligar: ligadoNoApp ? false : null };
  }

  const primeiraOlhada = sistemaAntes === null;
  const mudouNoAparelho = !primeiraOlhada && concedida !== sistemaAntes;
  const elaPediu = primeiraOlhada || mudouNoAparelho;

  return { bloqueado: false, ligar: elaPediu && !ligadoNoApp ? true : null };
}
