// O que cada peça da semana diz, tirado do que o app já tem escrito.
//
// A DECISÃO DO DONO (06/09/2026), quando escolheu entre três caminhos: o
// conteúdo sai do que JÁ EXISTE no app, e não de um modelo escrevendo toda
// semana. O motivo é o risco: o LEIA-ME das chapas proíbe número inventado, e
// o banco do quiz já passou por revisão com regra própria (sem número
// inventado, sem certeza mecânica absoluta, mito primeiro). Texto revisado uma
// vez vale mais que texto novo toda semana.
//
// O preço aceito: quando o banco der a volta, repete. Com 60 perguntas e uma
// peça por semana de cada seção, a primeira repetição está a mais de um ano.
//
// A ROTAÇÃO É DETERMINÍSTICA, pela semana do ano. Duas chamadas na mesma
// semana devolvem a mesma peça, o que importa para poder regerar depois de uma
// correção sem a peça mudar por baixo. E semanas seguidas nunca caem na mesma
// pergunta, porque o passo é o índice da seção somado à semana.
// Caminho relativo, e não o alias `@/`: este módulo é lido também pelos
// scripts, que rodam fora do Next e não resolvem o alias. As importações de
// TIPO podem usar o alias, porque o `--experimental-strip-types` as apaga
// antes de o Node tentar resolver; as de VALOR, não.
import { perguntasDoQuiz } from "../app/quiz/perguntas.ts";
import type { Formato, Secao } from "./chapas";
// O VEREDITO DE QUEM CABE, medido uma vez e versionado.
//
// Ele é gerado por `npm run pecas -- --medir`, que desenha cada candidato num
// Chromium de verdade e anota quem coube. Existe porque passaram a existir dois
// renderizadores: o script local, em Chromium, e o `next/og` da rota, que é o
// que o n8n chama. Na primeira chamada real a rota desenhou uma peça que o
// script tinha recusado, e saiu título por cima das opções.
//
// Dois desenhistas com réguas diferentes é dívida. A régua passou a ser uma só,
// e a rota não mede nada: ela obedece a este arquivo.
import { CABEM } from "./cabem.ts";

export type PecaDeConteudo = {
  secao: Secao;
  /**
   * A pergunta entre aspas, em branco e caixa mista, ANTES do título.
   *
   * Só a "pergunta da comunidade" usa. É o formato que o dono mandou de
   * exemplo: primeiro o que a pessoa perguntou, depois a resposta em destaque,
   * depois o porquê. Sem isso a peça saía com uma pergunta solta em caixa alta
   * e nenhuma resposta, que é o contrário do que a seção promete.
   */
  citacao?: string;
  titulo: string;
  corpo?: string;
  opcoes?: string[];
  destaque?: "ambar" | "teal";
  /** De onde o texto saiu, para o dono conferir a procedência na aprovação. */
  fonte: string;
  /**
   * Se o título cabe na faixa larga do topo da chapa.
   *
   * Não é escolha de quem escreve: é veredito da medição, que vem do
   * `cabem.ts`. Título que não termina antes do corte da faixa larga desceria
   * por cima da Biela, e nesse caso ele volta para a coluna estreita.
   */
  largo?: boolean;
};

/** A semana do ano, contada de forma estável (segunda-feira como início). */
export function semanaDoAno(d = new Date()): number {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dia = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dia);
  const inicio = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - inicio.getTime()) / 86400000 + 1) / 7);
}

/**
 * Os candidatos de cada seção, em ordem de preferência.
 *
 * POR QUE UMA LISTA, e não uma peça só. Nem toda pergunta do banco CABE na
 * chapa: o desenho tem zona livre fixa e a regra do LEIA-ME é encurtar o texto,
 * nunca diminuir a fonte. Como a decisão foi não reescrever o que já está
 * revisado, sobra a outra saída: escolher, entre as que existem, a primeira que
 * couber. Quem mede é o gerador, que desenha de verdade; aqui só se ordena.
 *
 * A primeira tentativa de gerar as quatro peças da semana caiu exatamente
 * nisso: "O carro não pegou e a bateria estava fraca. Trocar a bateria sempre
 * resolve?" com três opções ocupa 910px numa zona de 790px.
 */
export function candidatosDaSemana(quando = new Date()): PecaDeConteudo[][] {
  const banco = perguntasDoQuiz("pt");
  const semana = semanaDoAno(quando);
  // Cada seção começa num ponto diferente do banco e anda dali para a frente,
  // então duas seções da mesma semana nunca caem na mesma pergunta.
  const daSecao = (passo: number) =>
    Array.from({ length: banco.length }, (_, i) => banco[(semana * 4 + passo + i * 4) % banco.length]);

  const monta = (secao: Secao, q: (typeof banco)[number]): PecaDeConteudo => {
    if (secao === "desafio") return { secao, titulo: q.pergunta, opcoes: q.opcoes, destaque: "ambar", fonte: `quiz:${q.id}` };
    if (secao === "dica") return { secao, titulo: q.opcoes[q.correta], corpo: q.porque, destaque: "teal", fonte: `quiz:${q.id}` };
    if (secao === "curiosidade") return { secao, titulo: q.pergunta, corpo: q.porque, destaque: "ambar", fonte: `quiz:${q.id}` };
    // A pergunta da comunidade tem três partes, como no exemplo do dono: o que
    // foi perguntado, a resposta em destaque, e o porquê embaixo.
    return { secao, citacao: q.pergunta, titulo: q.opcoes[q.correta], corpo: q.porque, destaque: "ambar", fonte: `quiz:${q.id}` };
  };

  const secoes: Secao[] = ["desafio", "dica", "curiosidade", "pergunta"];
  return secoes.map((secao, i) => daSecao(i).map((q) => monta(secao, q)));
}

/**
 * Os candidatos que CABEM na chapa, para uma seção e um formato.
 *
 * Quem desenha sem navegador (a rota /api/pecas) precisa desta lista: sem ela
 * ele aceita texto que não cabe e entrega peça ilegível, que foi exatamente o
 * que aconteceu na primeira chamada.
 */
export function candidatosQueCabem(secao: Secao, formato: Formato, quando = new Date()): PecaDeConteudo[] {
  const permitidos = CABEM[`${secao}:${formato}`] ?? [];
  const lista = candidatosDaSemana(quando).find((l) => l[0].secao === secao) ?? [];
  return lista.flatMap((p) => {
    const veredito = permitidos.find((v) => v.fonte === p.fonte);
    return veredito ? [{ ...p, largo: veredito.largo }] : [];
  });
}

/** A primeira opção de cada seção, sem medir se cabe. Para quem só quer ver. */
export function pecasDaSemana(quando = new Date()): PecaDeConteudo[] {
  return candidatosDaSemana(quando).map((lista) => lista[0]);
}

