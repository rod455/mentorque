// As chapas de fundo das peças de rede social, e onde é permitido escrever.
//
// POR QUE ISTO É CÓDIGO, e não uma tabela na cabeça de quem gera a peça. As
// zonas livres não são estética: fora delas o texto some. Nos stories, o topo e
// o rodapé ficam debaixo da interface do Instagram; nas duas larguras, a Biela
// ocupa um pedaço da chapa e texto passando por cima dela vira ilegível. Um
// número errado aqui produz uma peça que PARECE certa no computador e chega
// cortada no celular de quem lê.
//
// Os números saem do `assets/pecas/LEIA-ME.txt`, que veio com as chapas, e a
// `npm run conferir:pecas` compara os dois: se alguém trocar as chapas por uma
// versão nova sem atualizar as medidas, a conferência reprova.
//
// A OBSERVAÇÃO QUE MAIS IMPORTA, e ela está no LEIA-ME: no feed a coluna de
// texto tem largura DIFERENTE por chapa, porque a Biela não ficou na mesma
// altura nas quatro. Usar a largura da chapa 01 na chapa 03 encosta o texto na
// Biela. Por isso a largura mora em cada chapa, e não numa constante só.

export type Formato = "stories" | "feed";

export type Secao = "desafio" | "dica" | "curiosidade" | "pergunta";

export type Chapa = {
  secao: Secao;
  formato: Formato;
  /** Nome do arquivo dentro de assets/pecas/<formato>/. */
  arquivo: string;
  largura: number;
  altura: number;
  /** A caixa onde o texto pode entrar, em pixels da própria chapa. */
  texto: { x1: number; y1: number; x2: number; y2: number };
  /**
   * A faixa LARGA de cima, onde só o título entra.
   *
   * A Biela não é um retângulo: na chapa da curiosidade ela avança até x 433 na
   * altura do braço estendido, mas em cima da cabeça dela sobram 634px de
   * quadro vazio. `texto` guarda o pior caso da chapa inteira, que é o que o
   * corpo e as opções precisam respeitar porque descem até embaixo. O título
   * fica só no alto, então pode ser mais largo.
   *
   * O ganho não é estético. Com a coluna estreita valendo para tudo, ZERO das
   * 63 perguntas do banco cabiam na curiosidade. Os exemplos que o dono mandou
   * usam exatamente esta divisão: manchete larga em cima, corpo estreito ao
   * lado da Biela.
   *
   * `y2` é onde a faixa larga acaba. Título que passar disso encosta na Biela,
   * e é por isso que a medição de quem cabe reprova título comprido demais.
   */
  titulo: { x2: number; y2: number };
  /**
   * Onde cabe uma figurinha de enquete, quiz ou link. Só nos stories: no feed
   * não existe figurinha, o post é a imagem.
   */
  figurinha?: { x1: number; y1: number; x2: number; y2: number };
};

/** O rótulo humano de cada seção, para a legenda e para o Telegram. */
export const NOME_DA_SECAO: Record<Secao, string> = {
  desafio: "Desafio da semana",
  dica: "Dica da semana",
  curiosidade: "Curiosidade da semana",
  pergunta: "Pergunta da comunidade",
};

/**
 * As cores da marca que as peças usam.
 *
 * "Uma cor de destaque por peça" é regra do LEIA-ME, e a razão é de leitura:
 * duas cores de destaque na mesma imagem fazem o olho não saber para onde ir.
 */
export const CORES = {
  giz: "#F4F1EA",
  ambar: "#F2A623",
  teal: "#0F8A66",
  coral: "#C24D26",
} as const;

/**
 * A chapa do DESAFIO já tem régua coral desenhada, e coral significa alerta no
 * nosso sistema. Peça com régua coral mais destaque coral vira aviso de perigo
 * inteiro, então ali o destaque só pode ser âmbar.
 */
export const DESTAQUE_PERMITIDO: Record<Secao, (keyof typeof CORES)[]> = {
  desafio: ["ambar"],
  dica: ["ambar", "teal"],
  curiosidade: ["ambar", "teal"],
  pergunta: ["ambar", "teal"],
};

/**
 * O respiro entre a régua da etiqueta e o começo do texto, no feed.
 *
 * A zona livre do LEIA-ME começa em y 150, colada na régua colorida que a
 * chapa já traz desenhada, e o título encostava nela. A zona continua a mesma;
 * o que muda é onde o texto começa dentro dela. Fica aqui porque os dois
 * desenhistas e a conferência precisam do MESMO número: é ele que diz em que
 * linha a medição da chapa começa a valer.
 */
export const RESPIRO_DO_FEED = 48;

const STORIES_TEXTO = { x1: 70, y1: 300, x2: 1010, y2: 820 };
const STORIES_FIGURINHA = { x1: 100, y1: 850, x2: 980, y2: 1180 };
// No story a chapa é livre de ponta a ponta na altura do texto: a Biela só
// começa depois de y 800, embaixo. Então a faixa do título é a zona inteira.
const STORIES_TITULO = { x2: 1010, y2: 820 };

// A faixa larga do feed acaba em y 500 nas quatro chapas: dali para baixo entra
// o braço, ou a caneca, ou o ombro, dependendo da chapa. Medido em
// lib/pecas/silhueta.ts, e a `conferir:pecas` remede na chapa de verdade.
const CORTE_DO_FEED = 500;

export const CHAPAS: Chapa[] = [
  // ── stories: as quatro chapas têm a mesma zona livre ──────────────────────
  { secao: "desafio", formato: "stories", arquivo: "FUNDO_STORY_01_desafio-da-semana.png", largura: 1080, altura: 1920, texto: STORIES_TEXTO, titulo: STORIES_TITULO, figurinha: STORIES_FIGURINHA },
  { secao: "dica", formato: "stories", arquivo: "FUNDO_STORY_02_dica-da-semana.png", largura: 1080, altura: 1920, texto: STORIES_TEXTO, titulo: STORIES_TITULO, figurinha: STORIES_FIGURINHA },
  { secao: "curiosidade", formato: "stories", arquivo: "FUNDO_STORY_03_curiosidade-da-semana.png", largura: 1080, altura: 1920, texto: STORIES_TEXTO, titulo: STORIES_TITULO, figurinha: STORIES_FIGURINHA },
  { secao: "pergunta", formato: "stories", arquivo: "FUNDO_STORY_04_pergunta-da-comunidade.png", largura: 1080, altura: 1920, texto: STORIES_TEXTO, titulo: STORIES_TITULO, figurinha: STORIES_FIGURINHA },

  // ── feed: a largura da coluna MUDA por chapa, ver o comentário do topo ────
  //
  // `texto` é o pior caso da chapa, e sai do LEIA-ME. `titulo` é a faixa larga
  // de cima, e sai da medição da própria chapa com 30px de folga, a mesma folga
  // que o LEIA-ME já usava na coluna estreita.
  { secao: "desafio", formato: "feed", arquivo: "FUNDO_FEED_01_desafio-da-semana.png", largura: 1080, altura: 1080, texto: { x1: 60, y1: 150, x2: 520, y2: 940 }, titulo: { x2: 590, y2: CORTE_DO_FEED } },
  { secao: "dica", formato: "feed", arquivo: "FUNDO_FEED_02_dica-da-semana.png", largura: 1080, altura: 1080, texto: { x1: 60, y1: 150, x2: 500, y2: 940 }, titulo: { x2: 540, y2: CORTE_DO_FEED } },
  { secao: "curiosidade", formato: "feed", arquivo: "FUNDO_FEED_03_curiosidade-da-semana.png", largura: 1080, altura: 1080, texto: { x1: 60, y1: 150, x2: 405, y2: 940 }, titulo: { x2: 600, y2: CORTE_DO_FEED } },
  { secao: "pergunta", formato: "feed", arquivo: "FUNDO_FEED_04_pergunta-da-comunidade.png", largura: 1080, altura: 1080, texto: { x1: 60, y1: 150, x2: 510, y2: 940 }, titulo: { x2: 530, y2: CORTE_DO_FEED } },
];

export function chapaDe(secao: Secao, formato: Formato): Chapa {
  const c = CHAPAS.find((x) => x.secao === secao && x.formato === formato);
  if (!c) throw new Error(`não existe chapa de ${secao} em ${formato}`);
  return c;
}
