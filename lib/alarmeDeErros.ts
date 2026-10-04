// Quando os erros do app merecem acordar o dono, e como dizer isso.
//
// POR QUE ISTO EXISTE (28/09/2026). A auditoria das medidas deu a regra em uma
// frase: **alarme é sempre uma razão, nunca uma contagem.** A regra virou
// coluna no banco (`supabase/aparelhos-ativos.sql`), virou campo em
// `/api/dados` e virou linha no retrato. E o Vigia, que é O ÚNICO que manda
// e-mail para o dono às 7h30, continuou disparando em `erros7d.total >= 20`.
//
// Hoje o retrato traz 23 relatos. Amanhã de manhã o alarme ia sair pela
// terceira vez na semana, com o número que a própria casa acabou de provar que
// não mede nada. É o mesmo defeito da semana toda, agora em cima do conserto
// dele: **conserto que não muda quem consome não é conserto.** Por isso a
// DECISÃO de avisar mora aqui, junto da regra, e não no nó do n8n: o nó só
// imprime o que esta função decidiu.
//
// E tem uma segunda coisa que a contagem escondia. Dos 16 aparelhos com
// "erro" em 7 dias, SETE eram gente fechando a tela de login do Google. Isso
// não é defeito, é a pessoa desistindo, e desistência entrando na conta de
// defeito é o alarme medindo a própria instrumentação. Separado: 9 aparelhos
// com defeito de verdade, 2,8% dos ativos.
//
// Puro de propósito, sem nenhuma dependência de rede ou de banco:
// `npm run conferir:alarme` abre isto no node e planta defeito.
import { type LinhaDoRetrato, maisDias } from "./retratoLegivel.ts";

/** O que o relato é, de verdade. */
export type ClasseDeErro =
  /** O app falhou. É o que merece conserto e, em volume, alarme. */
  | "defeito"
  /** A pessoa desistiu (fechou o login, cancelou o seletor). Não é falha. */
  | "desistencia"
  /** O mundo em volta falhou (sem rede). O app não tinha o que fazer. */
  | "ambiente";

// A JANELA, E A DATA EM QUE O NUMERADOR PASSOU A EXISTIR.
//
// A coluna `anon_id` de `app_erros` só começou a ser preenchida em 19/09/2026.
// Antes disso todo relato era anônimo, e "aparelhos com erro" dava ZERO, não
// por não haver erro, mas por não haver quem contar. Como a janela é de 7
// dias, a razão só passa a ser inteira quando a janela toda cai depois dessa
// data: 26/09.
//
// Isto não é detalhe. Lida sem a ressalva, a série sobe de 0,7% (22/09) para
// 2,8% (28/09) e parece uma piora de quatro vezes; boa parte da subida é a
// janela ENCHENDO de linhas que sabem dizer de que aparelho vieram. É a mesma
// armadilha das coortes, no mesmo mês, num instrumento diferente.
export const JANELA_DE_ERROS_DIAS = 7;
export const APARELHO_NO_ERRO_DESDE = "2026-09-19";
export const RAZAO_LEGIVEL_DESDE = maisDias(APARELHO_NO_ERRO_DESDE, JANELA_DE_ERROS_DIAS);

// O TETO, e ele é provisório, o que está escrito aqui de propósito.
//
// Em 28/09 havia três dias com a janela madura: 1,7%, 2,3% e 2,8% de aparelhos
// com defeito. Três pontos não são uma linha de base, e quem calibrar um
// alarme em cima de três pontos está escolhendo entre gritar todo dia ou
// nunca. 10% é o lugar onde não há dúvida: um em cada dez aparelhos batendo em
// defeito na semana é incidente em qualquer leitura.
//
// COMO RECALIBRAR, quando houver uma semana inteira de pontos maduros (a
// partir de 03/10/2026): pegar a série diária de `aparelhos com defeito /
// ativos`, tirar a mediana e pôr o teto uns 3 pontos acima dela. O mesmo
// método está em supabase/anomalias-da-operacao.sql, que calibra a anomalia da
// "ação que costuma ser a última" contra a base de cada plataforma.
export const TETO_DE_APARELHOS_COM_DEFEITO = 0.1;

/** Piso de aparelhos ativos para a razão significar algo. */
export const MINIMO_DE_ATIVOS = 30;

// AS FRASES QUE SEPARAM DESISTÊNCIA DE DEFEITO.
//
// Casadas em minúsculas e em pedaço de texto, não em igualdade: a mensagem do
// Google vem com o motivo entre parênteses e o pacote no fim, e foi por isso
// que a 2.3 passou a mandar o detalhe (docs/lojas/novidades-2.3.md). A regra
// tem de sobreviver a esse detalhe mudando.
const DESISTENCIA = [
  "cancelled by user",
  "canceled by user",
  "cancelled by the user",
  "user cancelled",
  "user canceled",
  "cancelado pelo usu",
];
const AMBIENTE = ["sem rede", "network error", "sem conexao", "sem conexão", "offline"];

/**
 * A classe de um relato, pela mensagem.
 *
 * Desistência é testada ANTES de ambiente e de defeito porque é a mais
 * específica: "Google Sign-In cancelled by user" também casaria com regra
 * frouxa de falha de login.
 */
export function classeDoErro(mensagem: string | null | undefined, tipo?: string | null): ClasseDeErro {
  // Desde a 3.0 (04/10/2026) a origem já diz o tipo: a desistência de login
  // chega como `tipo = "desistencia"`. A frase continua valendo para as
  // linhas antigas, gravadas como "erro".
  if (tipo === "desistencia") return "desistencia";
  const m = String(mensagem ?? "").toLowerCase();
  if (DESISTENCIA.some((f) => m.includes(f))) return "desistencia";
  if (AMBIENTE.some((f) => m.includes(f))) return "ambiente";
  return "defeito";
}

export type ContagemDeErros = {
  /** Relatos e aparelhos distintos, por classe. */
  porClasse: Record<ClasseDeErro, { relatos: number; aparelhos: number }>;
  /** Total de relatos, todas as classes. É o número que o retrato já mostrava. */
  relatos: number;
  /** Aparelhos distintos com QUALQUER relato. */
  aparelhos: number;
};

/** Conta os relatos por classe, sem duplicar aparelho dentro da classe. */
export function contaDeErros(
  relatos: { mensagem?: string | null; anon_id?: string | null; tipo?: string | null }[],
): ContagemDeErros {
  const vazio = () => ({ relatos: 0, aparelhos: new Set<string>() });
  const acc: Record<ClasseDeErro, { relatos: number; aparelhos: Set<string> }> = {
    defeito: vazio(),
    desistencia: vazio(),
    ambiente: vazio(),
  };
  const todos = new Set<string>();
  let total = 0;
  for (const r of relatos ?? []) {
    const c = classeDoErro(r.mensagem, r.tipo);
    acc[c].relatos += 1;
    total += 1;
    const ap = String(r.anon_id ?? "");
    if (ap) {
      acc[c].aparelhos.add(ap);
      todos.add(ap);
    }
  }
  return {
    porClasse: {
      defeito: { relatos: acc.defeito.relatos, aparelhos: acc.defeito.aparelhos.size },
      desistencia: { relatos: acc.desistencia.relatos, aparelhos: acc.desistencia.aparelhos.size },
      ambiente: { relatos: acc.ambiente.relatos, aparelhos: acc.ambiente.aparelhos.size },
    },
    relatos: total,
    aparelhos: todos.size,
  };
}

/** Soma os aparelhos ativos de todas as plataformas. */
export function totalDeAtivos(ativos: Record<string, number> | null | undefined): number {
  return Object.values(ativos ?? {}).reduce((a, b) => a + Number(b || 0), 0);
}

/**
 * A linha de ERROS do retrato, com o denominador e a ressalva dentro.
 *
 * `hoje` entra como texto (yyyy-mm-dd) para a função ser pura: régua que lê o
 * relógio por dentro não pode ser conferida.
 */
export function linhaDeErros(
  c: ContagemDeErros,
  ativos: Record<string, number> | null | undefined,
  hoje: string,
): LinhaDoRetrato {
  const total = totalDeAtivos(ativos);
  const def = c.porClasse.defeito;
  const partes = [
    `${c.relatos} relatos no app em ${JANELA_DE_ERROS_DIAS} dias`,
    `${def.relatos} de defeito em ${def.aparelhos} aparelho(s)`,
    `${c.porClasse.desistencia.relatos} de desistencia (a pessoa fechou o login, NAO e falha)`,
    `${c.porClasse.ambiente.relatos} de ambiente (sem rede)`,
  ];

  if (total < MINIMO_DE_ATIVOS) {
    return {
      texto: `Erros no app: ${partes.join("; ")}. SEM DENOMINADOR: so ${total} aparelhos ativos na janela, abaixo do minimo de ${MINIMO_DE_ATIVOS} para a razao dizer algo`,
      legivel: false,
      motivo: `aparelhos ativos insuficientes (${total} < ${MINIMO_DE_ATIVOS})`,
    };
  }

  const pct = (100 * def.aparelhos) / total;
  const razao = `${def.aparelhos} de ${total} aparelhos ativos com defeito (${pct.toFixed(1)}%)`;
  const detalhe = ` [ativos: ${Object.entries(ativos ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([p, n]) => `${p} ${n}`)
    .join(", ")}]`;

  if (hoje < RAZAO_LEGIVEL_DESDE) {
    return {
      texto: `Erros no app: ${partes.join("; ")}. A RAZAO AINDA NAO DA PARA LER (o aparelho so entra no relato desde ${APARELHO_NO_ERRO_DESDE}, e a janela de ${JANELA_DE_ERROS_DIAS} dias fecha em ${RAZAO_LEGIVEL_DESDE}; hoje sao ${razao}, PISO)${detalhe}`,
      legivel: false,
      motivo: `a janela ainda contem dias sem aparelho no relato; a razao fica inteira em ${RAZAO_LEGIVEL_DESDE}`,
    };
  }

  return {
    texto: `Erros no app: ${partes.join("; ")}. ${razao}${detalhe}`,
    legivel: true,
    motivo: "",
  };
}

export type Alarme = {
  /** Se o Vigia deve mandar e-mail por causa de erro. */
  deveAvisar: boolean;
  /** A frase do e-mail, quando deve avisar. Vazia quando não deve. */
  texto: string;
  /** Por que NÃO avisou. Vazio quando avisou. É o que impede alarme fantasma. */
  silencio: string;
};

/**
 * A decisão de acordar o dono.
 *
 * Mora aqui, e não no nó do n8n, pela lição da semana: a régua que fica só na
 * fonte não chega a quem lê. O nó imprime `texto` e pronto.
 *
 * `piorDefeito` é o erro mais comum JÁ CLASSIFICADO como defeito, para o
 * e-mail dizer o quê, não só o quanto. `ultimo` (yyyy-mm-dd) é o que responde
 * "ainda está acontecendo?", regra de 19/09: alarme que repete sobre coisa já
 * consertada ensina o dono a ignorar o Vigia.
 */
export function alarmeDeErros(
  c: ContagemDeErros,
  ativos: Record<string, number> | null | undefined,
  hoje: string,
  piorDefeito?: { mensagem: string; total: number; aparelhos?: number; ultimo?: string } | null,
): Alarme {
  const total = totalDeAtivos(ativos);
  const def = c.porClasse.defeito;

  if (total < MINIMO_DE_ATIVOS) {
    return { deveAvisar: false, texto: "", silencio: `so ${total} aparelhos ativos: razao sem sentido` };
  }
  if (hoje < RAZAO_LEGIVEL_DESDE) {
    return {
      deveAvisar: false,
      texto: "",
      silencio: `a razao de aparelhos com defeito fica inteira em ${RAZAO_LEGIVEL_DESDE}`,
    };
  }
  if (def.aparelhos === 0) {
    return { deveAvisar: false, texto: "", silencio: "nenhum aparelho com defeito na janela" };
  }

  const fracao = def.aparelhos / total;
  if (fracao < TETO_DE_APARELHOS_COM_DEFEITO) {
    return {
      deveAvisar: false,
      texto: "",
      silencio: `${def.aparelhos} de ${total} aparelhos com defeito (${(100 * fracao).toFixed(1)}%), abaixo do teto de ${(100 * TETO_DE_APARELHOS_COM_DEFEITO).toFixed(0)}%`,
    };
  }

  // AINDA ESTÁ ACONTECENDO? (regra de 19/09/2026.)
  //
  // Se o pior defeito parou há mais de um dia, a razão estourou por causa de
  // ocorrência velha dentro da janela, e isso não é um incidente de hoje: o
  // alarme diz isso na cara, em vez de mandar o dono caçar um defeito que a
  // última versão já consertou.
  const paradoHa = piorDefeito?.ultimo ? diasEntre(piorDefeito.ultimo, hoje) : null;
  const antiguidade = paradoHa != null && paradoHa > 1 ? ` (ATENCAO: a ultima ocorrencia do pior defeito foi em ${piorDefeito?.ultimo}, ${paradoHa} dias atras: pode ser ocorrencia velha ainda dentro da janela de ${JANELA_DE_ERROS_DIAS} dias)` : "";
  const qual = piorDefeito
    ? ` Pior defeito: ${piorDefeito.total}x em ${piorDefeito.aparelhos ?? "?"} aparelho(s), "${piorDefeito.mensagem}".`
    : "";

  return {
    deveAvisar: true,
    texto: `Defeito atingindo ${def.aparelhos} de ${total} aparelhos ativos em ${JANELA_DE_ERROS_DIAS} dias (${(100 * fracao).toFixed(1)}%, teto ${(100 * TETO_DE_APARELHOS_COM_DEFEITO).toFixed(0)}%).${qual}${antiguidade}`,
    silencio: "",
  };
}

/** Dias entre duas datas ISO, sem fuso no meio. */
export function diasEntre(de: string, ate: string): number {
  const p = (iso: string) => {
    const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
    return Date.UTC(a, (m ?? 1) - 1, d ?? 1);
  };
  return Math.round((p(ate) - p(de)) / 86400000);
}
