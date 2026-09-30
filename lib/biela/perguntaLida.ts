// O que a pessoa perguntou ao Biela, em duas etiquetas: de onde veio e sobre o quê.
//
// POR QUE ISTO EXISTE (29/09/2026). O dono: "vamos começar a usar as
// perguntas, relevante para conseguirmos entender melhor nossos usuários".
// Ele está certo e a casa estava cega: `biela_perguntas` CONTAVA as perguntas
// e não guardava nada sobre elas. Em 12 dias foram 46 perguntas de verdade, e
// tudo que dava para dizer era "46".
//
// O QUE ESTA RÉGUA GUARDA, E O QUE ELA NÃO GUARDA. Ela deriva duas etiquetas
// e só elas: a ORIGEM (a pessoa digitou, ou tocou num atalho que nós
// escrevemos) e o TEMA (freios, elétrica, arrefecimento...). O texto da
// pergunta NÃO é gravado por aqui. A política de privacidade promete hoje que
// o texto só fica guardado quando a pessoa toca em 👍 ou 👎, e mudar essa
// promessa é decisão do dono, não efeito colateral de uma melhoria de medição.
//
// A ARMADILHA QUE ESTA SEPARAÇÃO EVITA, e é a mesma da semana inteira. Das 24
// perguntas que a casa tem em texto, OITO são a frase "Que barulho pode ser
// esse ao frear?", que é o PRIMEIRO dos quatro atalhos da tela do Biela.
// Contadas junto com as digitadas, elas fariam "freios" parecer o assunto que
// mais aflige o motorista, quando o que o número mede é a ordem dos botões que
// nós mesmos pusemos na tela. Número que mede a própria instrumentação já
// custou caro aqui duas vezes este mês (o alarme de erros e a lição do canal
// do YouTube). Por isso a origem vem SEMPRE junto do tema, e quem ler tem de
// separar antes de concluir qualquer coisa.
//
// Pura de propósito, sem dependência nenhuma: `npm run conferir:perguntas`
// abre isto no node e planta defeito.

/** De onde a pergunta veio. */
export type OrigemDaPergunta =
  /** Tocou num dos atalhos prontos da tela do Biela. Não são palavras dela. */
  | "sugerida"
  /** Veio da tela de sintoma ou da busca, no molde "Meu carro está com: X". */
  | "sintoma"
  /** Escreveu do zero. É a única origem que mede o que a pessoa queria dizer. */
  | "livre"
  /** Resposta curta dentro de uma conversa ("Ok", "e se for o outro?"). */
  | "continuacao";

/** Sobre o que era a pergunta. */
export type TemaDaPergunta =
  | "freios"
  | "ar_condicionado"
  | "pneus"
  | "eletrica"
  | "arrefecimento"
  | "partida"
  | "cambio"
  | "direcao"
  | "suspensao"
  | "combustivel"
  | "limpeza"
  | "motor"
  | "orcamento"
  | "manutencao"
  | "outro";

/** Abaixo disto, e sem nenhum tema, a frase é continuação de conversa. */
export const CURTA_DEMAIS = 25;

// OS ATALHOS DA TELA, COPIADOS DE `lib/app/content.ts`.
//
// A conferência cobra que a lista de lá esteja coberta por esta, e não o
// contrário: lição de 07/09/2026, quando a `conferir:login` aprovou um motivo
// INVENTADO porque conferia a lista do script contra o código. Lista escrita à
// mão só pega falta, nunca sobra, então aqui ela é o mínimo exigido e a fonte
// da verdade continua sendo o `content.ts`.
export const ATALHOS_DA_TELA = [
  "que barulho pode ser esse ao frear?",
  "quando devo trocar a correia?",
  "esse orcamento esta caro?",
  "como faco a revisao em dia?",
  "what could this braking noise be?",
  "when should i change the belt?",
  "is this quote expensive?",
  "how do i keep service up to date?",
];

/** Minúsculas, sem acento, sem espaço sobrando. Toda comparação passa por aqui. */
export function normaliza(texto: string | null | undefined): string {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// O MOLDE DA TELA DE SINTOMA, montado em `components/app/screens/Symptoms.tsx`
// e em `Search.tsx`: "Meu {Carro} está com: {o que a pessoa marcou ou digitou}.
// O que pode ser e o que devo fazer?".
//
// O tema tem de sair do MIOLO, não do molde: "Meu Fusion está com: ..." traz o
// nome do carro junto, e nome de carro casando com palavra de tema é o tipo de
// engano que só aparece depois de virar decisão.
const MOLDE = /^meu .*?esta com:\s*(.*?)(?:\.\s*o que pode ser.*)?$/;

/** O que a PESSOA escreveu, sem o molde que a tela pôs em volta. */
export function textoDaPessoa(texto: string | null | undefined): string {
  const n = normaliza(texto);
  const m = n.match(MOLDE);
  return m ? (m[1] ?? "").trim() : n;
}

// AS PALAVRAS DE CADA TEMA, NA ORDEM EM QUE SÃO TESTADAS.
//
// A ordem é a regra, e ela é específica antes de genérica. Três casos reais
// que a ordem resolve, todos tirados das perguntas que já estão no banco:
//
//   "Posso lavar o motor do carro"  -> limpeza, e não motor;
//   "meu marcador de combustivel e a temperatura nao esta funcionando"
//                                   -> eletrica (é o painel), e não
//                                      arrefecimento nem combustivel;
//   "Quando devo trocar a correia?" -> motor (a peça), e não manutencao.
//
// `luz` sozinha ficou DE FORA de elétrica de propósito: a luz que mais aparece
// nesta casa é a da injeção, que é motor.
const TEMAS: [TemaDaPergunta, string[]][] = [
  ["freios", ["freio", "frear", "pastilha", "lona de freio", "disco de freio", "brake"]],
  ["ar_condicionado", ["ar condicionado", "ar-condicionado", "climatiz", "nao gela", "conditioning"]],
  ["pneus", ["pneu", "calibr", "estepe", "banda de rodagem", "tire"]],
  // `marcad` em vez de `marcador`: a primeira pergunta real sobre painel que
  // chegou aqui foi "meu marcado de combustivel e a temperatura nao esta
  // funcionando". Com a palavra inteira, a régua lia "temperatura" e mandava
  // para arrefecimento, que é o sistema errado e a conclusão errada. Quem
  // escreve para o Biela está com o carro na rua, não revisando o texto.
  ["eletrica", ["marcad", "ponteiro", "painel", "vidro eletrico", "vidros", "vidro", "farol", "lanterna", "bateria", "alternador", "fusivel", "chicote", "descarreg", "nao sobe e nem desce"]],
  ["arrefecimento", ["arrefec", "radiador", "temperatura", "superaquec", "esquentando", "fervendo", "ventoinha", "liquido de arrefecimento", "coolant"]],
  ["partida", ["nao pega", "nao da partida", "nao liga", "da partida mas", "motor de arranque", "wont start", "won't start"]],
  ["cambio", ["cambio", "marcha", "embreagem", "automatico", "engata", "cvt"]],
  ["direcao", ["volante", "direcao", "alinhamento", "balanceamento", "steering"]],
  ["suspensao", ["amortecedor", "suspensao", "mola", "bucha", "bieleta", "batente", "flutua", "mergulha"]],
  ["combustivel", ["gasolina", "etanol", "alcool", "combustivel", "consumo", "tanque", "abastec", "km/l", "aditivada", "fuel"]],
  ["limpeza", ["lavar", "lavagem", "lavo", "cera", "polimento", "limpar"]],
  ["motor", ["motor", "oleo", "correia", "vela de ignicao", "velas", "fumaca", "falhando", "perde forca", "perda de forca", "injecao", "turbo", "carburador", "barulho no motor"]],
  ["orcamento", ["orcamento", "esta caro", "preco", "quanto custa", "cobrar", "valor da"]],
  ["manutencao", ["revisao", "quando devo trocar", "troca de", "quilometragem", "manutencao", "garantia", "quando trocar"]],
];

/** O tema da pergunta, pelas palavras da PESSOA. */
export function temaDaPergunta(texto: string | null | undefined): TemaDaPergunta {
  const t = textoDaPessoa(texto);
  if (!t) return "outro";
  for (const [tema, palavras] of TEMAS) {
    if (palavras.some((p) => t.includes(p))) return tema;
  }
  return "outro";
}

/** De onde a pergunta veio. */
export function origemDaPergunta(texto: string | null | undefined): OrigemDaPergunta {
  const n = normaliza(texto);
  if (!n) return "continuacao";
  if (ATALHOS_DA_TELA.includes(n)) return "sugerida";
  if (MOLDE.test(n)) return "sintoma";
  // Frase curta e sem assunto reconhecível é turno de conversa, não pergunta
  // nova: "Ok", "Tipo o que?". Contada como pergunta, ela infla o denominador
  // e dilui todos os temas.
  if (n.length < CURTA_DEMAIS && temaDaPergunta(n) === "outro") return "continuacao";
  return "livre";
}

export type PerguntaLida = { origem: OrigemDaPergunta; tema: TemaDaPergunta };

/** As duas etiquetas de uma pergunta. Nunca o texto dela. */
export function lerPergunta(texto: string | null | undefined): PerguntaLida {
  return { origem: origemDaPergunta(texto), tema: temaDaPergunta(texto) };
}

/**
 * O quadro de temas, JÁ SEPARADO por origem.
 *
 * Devolve junto o que dá e o que não dá para ler: `daPessoa` são as perguntas
 * em que as palavras são dela (livre e sintoma), e é a única fatia que mede
 * demanda. `deAtalho` mede a nossa tela. Somar as duas e chamar de "o que o
 * motorista pergunta" é medir a própria instrumentação.
 */
export function quadroDeTemas(perguntas: { origem?: string | null; tema?: string | null }[]): {
  daPessoa: { tema: string; total: number }[];
  deAtalho: { tema: string; total: number }[];
  porOrigem: Record<string, number>;
  total: number;
} {
  const daPessoa: Record<string, number> = {};
  const deAtalho: Record<string, number> = {};
  const porOrigem: Record<string, number> = {};
  let total = 0;
  for (const p of perguntas ?? []) {
    const origem = String(p.origem ?? "desconhecida");
    const tema = String(p.tema ?? "outro");
    porOrigem[origem] = (porOrigem[origem] ?? 0) + 1;
    total += 1;
    if (origem === "livre" || origem === "sintoma") daPessoa[tema] = (daPessoa[tema] ?? 0) + 1;
    else if (origem === "sugerida") deAtalho[tema] = (deAtalho[tema] ?? 0) + 1;
  }
  const ordena = (r: Record<string, number>) =>
    Object.entries(r)
      .map(([tema, total]) => ({ tema, total }))
      .sort((a, b) => b.total - a.total || a.tema.localeCompare(b.tema));
  return { daPessoa: ordena(daPessoa), deAtalho: ordena(deAtalho), porOrigem, total };
}

/** O dia em que a etiqueta passou a ser gravada. Antes disto só havia contagem. */
export const ETIQUETA_DESDE = "2026-09-29";

/** Quantas perguntas com palavras da pessoa bastam para ler um tema. */
export const MINIMO_PARA_LER_TEMA = 20;

/**
 * A frase pronta do retrato sobre o que perguntam ao Biela.
 *
 * Mesma regra das coortes e do alarme de erros: quem publica o número publica
 * junto o que o torna legível, porque contar com quem lê para lembrar da
 * ressalva falhou cinco vezes em cinco dias nesta casa
 * (docs/dados/auditoria-das-medidas.md).
 */
export function linhaDePerguntas(
  quadro: ReturnType<typeof quadroDeTemas>,
  hoje: string,
): { texto: string; legivel: boolean; motivo: string } {
  const daPessoa = quadro.daPessoa.reduce((s, t) => s + t.total, 0);
  const atalho = quadro.deAtalho.reduce((s, t) => s + t.total, 0);
  const topo = quadro.daPessoa
    .slice(0, 5)
    .map((t) => `${t.tema} ${t.total}`)
    .join(", ");

  if (quadro.total === 0) {
    return {
      texto: `Perguntas ao Biela: nenhuma etiquetada ainda (a etiqueta comecou em ${ETIQUETA_DESDE})`,
      legivel: false,
      motivo: `a gravacao de origem e tema comecou em ${ETIQUETA_DESDE}`,
    };
  }

  const base = `Perguntas ao Biela: ${quadro.total} em 30 dias, ${daPessoa} com palavras da pessoa e ${atalho} de atalho da tela (atalho NAO e demanda, e a ordem dos nossos botoes). Temas do que a pessoa escreveu: ${topo || "nenhum"}`;

  if (daPessoa < MINIMO_PARA_LER_TEMA) {
    return {
      texto: `${base}. AINDA NAO DA PARA LER O RANKING (sao ${daPessoa} perguntas com palavras da pessoa, abaixo do minimo de ${MINIMO_PARA_LER_TEMA}; hoje e ${hoje}, PISO)`,
      legivel: false,
      motivo: `so ${daPessoa} perguntas com palavras da pessoa (minimo ${MINIMO_PARA_LER_TEMA})`,
    };
  }
  return { texto: base, legivel: true, motivo: "" };
}
