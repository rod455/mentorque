"use client";

// De onde a pessoa veio, guardado no aparelho assim que ela chega.
//
// O DEFEITO QUE ISTO CONSERTA, medido em 03/09/2026: a captura de UTM morava
// dentro do componente `Rastreio`, que só é montado na `/landing`. Ou seja,
// clique pago que caísse na home ou direto em `/app` perdia a campanha na
// hora, sem deixar rastro. A campanha "Mentorque Lançamento" gastou R$ 44,16
// em 23 cliques de busca e não produziu UM evento de funil etiquetado.
//
// Aqui a captura sobe para o layout raiz, então vale em QUALQUER página do
// site, inclusive a do próprio app. É a diferença entre saber e não saber de
// onde veio quem pagou.
//
// O `gclid` entrou junto, e ele é de outra natureza: enquanto a UTM serve para
// a NOSSA leitura, o `gclid` é o identificador do clique DO GOOGLE, e é ele
// que permite devolver a conversão para lá quando a venda acontecer. Sem esse
// número o Google nunca fica sabendo que aquele clique virou assinatura, e o
// lance automático continua otimizando para o que ele consegue ver, que hoje é
// um toque em botão de download.

const CHAVE = "mq-utm";

/**
 * O que vale a pena guardar da barra de endereço.
 *
 * Lista fechada de propósito: guardar a query inteira seria guardar o que a
 * pessoa digitou em campos de busca e qualquer coisa que um terceiro pendure
 * no link. Aqui só entram os campos de campanha e os identificadores de
 * clique dos anunciantes.
 */
const CAMPOS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  /** Id do clique do Google Ads. É a chave da conversão offline. */
  "gclid",
  /** O equivalente da Meta, para o dia em que houver campanha lá. */
  "fbclid",
  /** Variante de headline da LP, para leitura de teste A/B. */
  "v",
] as const;

export type Campanha = Record<string, string>;

/**
 * Lê a campanha da barra de endereço. Pura para poder ser conferida sozinha.
 *
 * Devolve `null` quando não há nada de campanha ali, e esse `null` é o que
 * protege a primeira visita: chegada sem etiqueta NÃO pode apagar a etiqueta
 * que já estava guardada. Quem clica no anúncio, sai e volta digitando o
 * endereço continua sendo daquela campanha.
 */
export function leDaUrl(busca: string): Campanha | null {
  const q = new URLSearchParams(busca);
  const c: Campanha = {};
  for (const k of CAMPOS) {
    const v = q.get(k);
    if (v) c[k] = v.slice(0, 120);
  }
  return Object.keys(c).length ? c : null;
}

/** A campanha guardada neste aparelho, se houver. */
export function campanhaGuardada(): Campanha | null {
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return null;
    const c = JSON.parse(cru) as Campanha;
    return c && typeof c === "object" && Object.keys(c).length ? c : null;
  } catch {
    return null;
  }
}

/** O id do clique do Google, se esta pessoa veio de um anúncio de lá. */
export function gclidGuardado(): string | null {
  const c = campanhaGuardada();
  const g = c?.gclid;
  return typeof g === "string" && g ? g : null;
}

/**
 * Guarda a campanha desta chegada, se ela trouxer alguma.
 *
 * A ÚLTIMA CAMPANHA GANHA, e é uma escolha: quem clica num anúncio de busca
 * hoje e num de remarketing amanhã é creditado ao segundo. É a convenção mais
 * comum e a mais fácil de explicar; o que ela perde é o crédito do primeiro
 * toque, que a gente não tem como reconstruir de qualquer jeito.
 */
export function capturaCampanha(busca: string): Campanha | null {
  const nova = leDaUrl(busca);
  if (!nova) return campanhaGuardada();
  const completa: Campanha = { ...nova, em: new Date().toISOString() };
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(completa));
  } catch {
    /* sem armazenamento: a campanha vale só nesta página, e é o que dá */
  }
  return completa;
}
