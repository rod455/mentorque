// O motivo do cancelamento: o link assinado, e como LER o que chegar.
//
// POR QUE A LEITURA MORA JUNTO DA GRAVAÇÃO (02/10/2026). A resposta chega por
// um clique num link dentro de um e-mail, e nem todo clique é de gente. Alguns
// servidores de e-mail corporativos e alguns antivírus ABREM todos os links da
// mensagem para conferir se levam a lugar perigoso. Se cada abertura virar uma
// resposta, a pesquisa passa a medir antivírus, e esta casa já perdeu uma
// semana em setembro por publicar número que media a própria instrumentação
// (o alarme de erros e a lição do canal do YouTube).
//
// A SAÍDA NÃO É CONFIAR NO CLIQUE, É GUARDAR TODOS E LER COM REGRA. Quem clica
// de verdade escolhe UM motivo. Um varredor abre os seis em sequência, em
// menos de um segundo. Então: grava tudo, e na leitura descarta quem respondeu
// mais de um motivo dentro da janela de robô, dizendo quantos foram
// descartados em vez de sumir com eles.
//
// Puro de propósito no que importa: `npm run conferir:saida` abre isto no node
// e planta defeito.

import { createHmac, timingSafeEqual } from "node:crypto";

function segredo(): string | null {
  return process.env.JORNADA_SEGREDO ?? process.env.DADOS_CHAVE ?? null;
}

/**
 * A assinatura de um motivo, por pessoa.
 *
 * O motivo entra no que é assinado. Sem isso, quem recebesse o e-mail poderia
 * trocar `m=preco` por `m=problema` no endereço e responder por si mesmo com
 * outro motivo, o que não é ataque nenhum mas é ruído, e ruído numa pesquisa
 * de seis respostas é tudo.
 */
export function assinaturaDeMotivo(userId: string, motivo: string): string | null {
  const s = segredo();
  if (!s) return null;
  return createHmac("sha256", s).update(`motivo:${userId}:${motivo}`).digest("hex").slice(0, 40);
}

export function motivoConfere(userId: string, motivo: string, assinatura: string): boolean {
  const esperada = assinaturaDeMotivo(userId, motivo);
  if (!esperada || !assinatura || assinatura.length !== esperada.length) return false;
  return timingSafeEqual(Buffer.from(esperada), Buffer.from(assinatura));
}

/** Dois cliques da mesma pessoa dentro disto são varredura, não escolha. */
export const JANELA_DE_ROBO_SEGUNDOS = 30;

export type CliqueDeMotivo = { user_id: string; motivo: string; criado_em: string };
export type RespostaDeSaida = { userId: string; motivo: string; quando: string };

/**
 * As respostas que dá para ler, e quantas foram descartadas.
 *
 * Uma por pessoa, a PRIMEIRA, porque é a escolha; as seguintes do mesmo clique
 * de varredura morrem com ela. Pessoa que clicou em dois motivos com calma (um
 * hoje, outro semana que vem) continua valendo o primeiro: trocar de ideia
 * depois de uma semana é outra coisa, e nenhuma delas é "este é o motivo".
 */
export function respostasLegiveis(cliques: CliqueDeMotivo[]): {
  respostas: RespostaDeSaida[];
  descartados: number;
} {
  const porPessoa = new Map<string, CliqueDeMotivo[]>();
  for (const c of cliques ?? []) {
    if (!c?.user_id || !c?.motivo) continue;
    const lista = porPessoa.get(c.user_id) ?? [];
    lista.push(c);
    porPessoa.set(c.user_id, lista);
  }

  const respostas: RespostaDeSaida[] = [];
  let descartados = 0;
  for (const [userId, lista] of porPessoa) {
    const ordenada = [...lista].sort((a, b) => Date.parse(a.criado_em) - Date.parse(b.criado_em));
    const primeiro = ordenada[0]!;
    const t0 = Date.parse(primeiro.criado_em);
    // Varredura: outro motivo DIFERENTE dentro da janela. Dois cliques no
    // mesmo motivo é a pessoa tocando duas vezes, e isso não é robô.
    const rajada = ordenada.some(
      (c) => c.motivo !== primeiro.motivo && Date.parse(c.criado_em) - t0 <= JANELA_DE_ROBO_SEGUNDOS * 1000,
    );
    if (rajada) {
      descartados += 1;
      continue;
    }
    respostas.push({ userId, motivo: primeiro.motivo, quando: primeiro.criado_em });
  }
  return { respostas, descartados };
}

/** Quantas respostas bastam para o ranking de motivos dizer alguma coisa. */
export const MINIMO_PARA_LER_MOTIVOS = 10;

/**
 * A frase do retrato sobre por que as pessoas cancelam.
 *
 * `enviados` é o denominador, e sem ele "3 disseram que ficou caro" não diz se
 * é 3 de 4 ou 3 de 300. É a mesma regra do alarme de erros: o de cima sozinho
 * não é medida.
 */
export function linhaDeMotivos(
  cliques: CliqueDeMotivo[],
  enviados: number,
): { texto: string; legivel: boolean; motivo: string } {
  const { respostas, descartados } = respostasLegiveis(cliques);
  const porMotivo = new Map<string, number>();
  for (const r of respostas) porMotivo.set(r.motivo, (porMotivo.get(r.motivo) ?? 0) + 1);
  const ranking = [...porMotivo.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([m, n]) => `${m} ${n}`)
    .join(", ");

  const base =
    `Por que cancelaram: ${respostas.length} resposta(s) de ${enviados} e-mail(s) de saida enviados` +
    (descartados ? `, ${descartados} descartada(s) por parecerem varredura de antivirus` : "") +
    (ranking ? `. ${ranking}` : "");

  if (respostas.length < MINIMO_PARA_LER_MOTIVOS) {
    return {
      texto: `${base}. AINDA NAO DA PARA LER O RANKING (sao ${respostas.length}, abaixo do minimo de ${MINIMO_PARA_LER_MOTIVOS}; cada resposta vale muito, e e por isso que nenhuma delas vale como tendencia)`,
      legivel: false,
      motivo: `so ${respostas.length} resposta(s) (minimo ${MINIMO_PARA_LER_MOTIVOS})`,
    };
  }
  return { texto: base, legivel: true, motivo: "" };
}
