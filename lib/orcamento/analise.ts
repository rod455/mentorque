// A análise de orçamento por foto: a parte pura.
//
// APROVADO PELO DONO EM 13/09/2026, depois de ler os dois projetos de R$ 10
// milhões (docs/agentes/propostas/plataforma-10m.md): "entenda o orçamento da
// oficina" é a dor que a nossa ficha promete na primeira linha e que o app não
// entregava. A pessoa tira foto do orçamento; o modelo extrai as linhas,
// explica para que serve cada item, e o app compara com a faixa da região
// quando houver referência. Nunca "está sendo enganado"; sempre "entenda e
// pergunte", como os dois projetos mandam.
//
// Este arquivo não fala com rede nem com tela: é o molde do pedido ao modelo,
// a leitura da resposta (que chega como texto e pode vir suja), a comparação
// com as faixas e a regra do limite do gratuito. `npm run conferir:orcamento`
// abre isto no node e planta defeito.
//
// Limite decidido pelo dono em 13/09/2026: DUAS análises por mês no gratuito,
// sem limite no Premium. Cada análise é uma chamada com imagem à API, paga
// por uso; o limite é o freio de custo.

import { FAIXAS_NACIONAIS, faixaDaRegiao, posicaoNaFaixa, type FaixaDaRegiao, type PosicaoNaFaixa } from "../app/faixaDePreco.ts";

export const LIMITE_GRATIS_POR_MES = 2;

export function podeAnalisar(feitasNoMes: number, premium: boolean): boolean {
  if (premium) return true;
  return feitasNoMes < LIMITE_GRATIS_POR_MES;
}

/** "2026-09": o mês em que a análise conta para o limite. */
export function mesDe(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type TipoDeItem = "peca" | "servico" | "mao_de_obra" | "outro";

export type ItemDoOrcamento = {
  descricao: string;
  tipo: TipoDeItem;
  quantidade?: number;
  valor?: number;
  /** Para que serve, em uma ou duas frases para quem não é mecânico. */
  explicacao: string;
  /** Só quando o item pede pergunta antes de aprovar; nunca acusa. */
  atencao?: string;
  /** Chave de FAIXAS_NACIONAIS quando o item é um serviço com referência. */
  servico?: string;
  /** Preenchido pela comparação, não pelo modelo. */
  faixa?: FaixaDaRegiao;
  posicao?: PosicaoNaFaixa;
};

export type Analise = {
  oficina: string | null;
  total: number | null;
  itens: ItemDoOrcamento[];
  /** Duas ou três frases: o que o orçamento faz, em português de gente. */
  resumo: string;
  /** Três a seis perguntas concretas para fazer na oficina. */
  perguntas: string[];
  /** Só quando há item de segurança (freio, direção, pneu careca). */
  alerta: string | null;
  /** O modelo não conseguiu ler um orçamento na imagem. */
  ilegivel: boolean;
};

const TIPOS: TipoDeItem[] = ["peca", "servico", "mao_de_obra", "outro"];
const MAX_ITENS = 30;
const MAX_PERGUNTAS = 6;

const texto = (v: unknown, n: number): string => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, n) : "");
const numero = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")) : NaN;
  return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : undefined;
};

/**
 * Tira o JSON de dentro do texto do modelo. Ele pode vir limpo, entre cercas
 * de código, ou com uma frase antes. O que vale é do primeiro "{" ao último
 * "}". Devolve null quando não há objeto.
 */
export function extrairJson(bruto: string): unknown {
  if (typeof bruto !== "string") return null;
  const a = bruto.indexOf("{");
  const b = bruto.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(bruto.slice(a, b + 1));
  } catch {
    return null;
  }
}

/** Valida e poda o que o modelo devolveu. null quando não dá para usar. */
export function normalizarAnalise(bruto: unknown): Analise | null {
  if (!bruto || typeof bruto !== "object") return null;
  const o = bruto as Record<string, unknown>;
  const ilegivel = o.ilegivel === true;
  const itensBrutos = Array.isArray(o.itens) ? o.itens.slice(0, MAX_ITENS) : [];
  const itens: ItemDoOrcamento[] = [];
  for (const it of itensBrutos) {
    if (!it || typeof it !== "object") continue;
    const r = it as Record<string, unknown>;
    const descricao = texto(r.descricao, 120);
    if (!descricao) continue;
    const tipo = TIPOS.includes(r.tipo as TipoDeItem) ? (r.tipo as TipoDeItem) : "outro";
    const servico = typeof r.servico === "string" && FAIXAS_NACIONAIS[r.servico] ? r.servico : undefined;
    const atencao = texto(r.atencao, 240);
    itens.push({
      descricao,
      tipo,
      quantidade: numero(r.quantidade),
      valor: numero(r.valor),
      explicacao: texto(r.explicacao, 300),
      ...(atencao ? { atencao } : {}),
      ...(servico ? { servico } : {}),
    });
  }
  const perguntas = (Array.isArray(o.perguntas) ? o.perguntas : []).map((p) => texto(p, 200)).filter(Boolean).slice(0, MAX_PERGUNTAS);
  const resumo = texto(o.resumo, 600);
  if (!ilegivel && itens.length === 0 && !resumo) return null;
  const alerta = texto(o.alerta, 300);
  return {
    oficina: texto(o.oficina, 80) || null,
    total: numero(o.total) ?? null,
    itens,
    resumo,
    perguntas,
    alerta: alerta || null,
    ilegivel,
  };
}

/**
 * Põe a faixa da região em cada item que tem serviço com referência e valor.
 * A comparação é nossa, não do modelo: o modelo não conhece as faixas e não
 * deve inventar "está caro".
 */
export function compararComFaixas(a: Analise, uf?: string | null, cidade?: string | null): Analise {
  return {
    ...a,
    itens: a.itens.map((it) => {
      if (!it.servico || it.valor == null || it.valor <= 0) return it;
      const faixa = faixaDaRegiao(it.servico, uf, cidade);
      if (!faixa) return it;
      return { ...it, faixa, posicao: posicaoNaFaixa(it.valor, faixa) };
    }),
  };
}

/** Soma dos itens com valor, para conferir contra o total lido. */
export function somaDosItens(a: Analise): number {
  return Math.round(a.itens.reduce((acc, it) => acc + (it.valor ?? 0) * (it.quantidade && it.quantidade > 0 ? 1 : 1), 0) * 100) / 100;
}

/** O serviço principal do orçamento (o item de maior valor com referência), para pré-preencher o histórico. */
export function servicoPrincipal(a: Analise): string | undefined {
  const comRef = a.itens.filter((it) => it.servico);
  if (!comRef.length) return undefined;
  return comRef.sort((x, y) => (y.valor ?? 0) - (x.valor ?? 0))[0].servico;
}

/** As notas que vão para o histórico quando a pessoa salva a análise. */
export function notasParaHistorico(a: Analise): string {
  const linhas = a.itens.slice(0, 12).map((it) => `${it.descricao}${it.valor != null ? `: R$ ${it.valor.toLocaleString("pt-BR")}` : ""}`);
  return [a.resumo, ...linhas].filter(Boolean).join("\n").slice(0, 1500);
}

export type CarroDaAnalise = { make?: string | null; model?: string | null; year?: number | null; km?: number | null; engine?: string | null } | null;

/** O pedido ao modelo. JSON só, com o molde fechado. */
export function promptDaAnalise(locale: string, carro: CarroDaAnalise): string {
  const pt = locale !== "en";
  const chaves = Object.keys(FAIXAS_NACIONAIS).join(", ");
  const carroTxt = carro?.make
    ? `${carro.make} ${carro.model ?? ""} ${carro.year ?? ""}${carro.engine ? `, ${carro.engine}` : ""}${carro.km != null ? `, ${carro.km} km` : ""}`.replace(/\s+/g, " ").trim()
    : "";
  if (pt) {
    return [
      "Você é o Biela, mecânico do app Mentorque. A pessoa mandou a FOTO de um orçamento de oficina. Leia a imagem e devolva SOMENTE um JSON, sem texto antes ou depois, sem cerca de código, neste formato:",
      '{"ilegivel": false, "oficina": "nome ou null", "total": 1234.5, "itens": [{"descricao": "como está escrito", "tipo": "peca|servico|mao_de_obra|outro", "quantidade": 1, "valor": 100.0, "explicacao": "para que serve, em uma ou duas frases para quem não é mecânico", "atencao": "só se houver algo para perguntar antes de aprovar", "servico": "uma destas chaves quando o item for este serviço: ' + chaves + '"}], "resumo": "duas ou três frases dizendo o que o orçamento faz no carro", "perguntas": ["três a seis perguntas concretas para fazer na oficina"], "alerta": "só quando há item de segurança (freio, direção, pneu, suspensão solta); senão null"}',
      "Regras:",
      "- Copie descrições e valores como estão na foto. Valor em reais, número. Sem inventar linha que não está lá.",
      "- NUNCA diga que a oficina está enganando, cobrando caro ou empurrando serviço. Você não conhece os preços da região; quem compara é o app. O seu papel é explicar e dar perguntas.",
      "- \"atencao\" só quando cabe uma pergunta: item repetido, peça que costuma vir em par e veio uma, serviço que depende de outro que não está na lista, marca da peça não dita.",
      "- \"servico\" só quando o item É aquele serviço (troca de óleo e filtro = oil; pastilhas ou discos = brakes; bateria = battery; revisão = revision; amortecedor, bandeja, bucha = suspension; pneu = tires; correia dentada = timing; filtro de ar = airfilter; fluido de freio = brakefluid). Fora disso, omita.",
      "- Se a imagem não for um orçamento legível, devolva {\"ilegivel\": true, \"itens\": [], \"perguntas\": [], \"resumo\": \"\", \"alerta\": null, \"oficina\": null, \"total\": null}.",
      "- Português do Brasil, sem travessão (o traço longo), sem jargão sem explicar.",
      carroTxt ? `Carro da pessoa: ${carroTxt}. Use quando mudar a explicação (por exemplo, o que é normal para esse km).` : "",
    ].filter(Boolean).join("\n");
  }
  return [
    "You are Biela, the mechanic in the Mentorque app. The person sent a PHOTO of a repair shop quote. Read the image and return ONLY a JSON object, no text before or after, no code fence, in this shape:",
    '{"ilegivel": false, "oficina": "shop name or null", "total": 1234.5, "itens": [{"descricao": "as written", "tipo": "peca|servico|mao_de_obra|outro", "quantidade": 1, "valor": 100.0, "explicacao": "what it is for, one or two plain sentences", "atencao": "only if there is something to ask before approving", "servico": "one of these keys when the line is that service: ' + chaves + '"}], "resumo": "two or three sentences saying what the quote does to the car", "perguntas": ["three to six concrete questions to ask the shop"], "alerta": "only when a safety item is involved; else null"}',
    "Rules: copy lines and amounts as they are; never say the shop is overcharging or cheating (the app compares prices, not you); \"atencao\" only when a question is warranted; \"servico\" only when the line IS that service; if the image is not a readable quote return {\"ilegivel\": true, \"itens\": [], \"perguntas\": [], \"resumo\": \"\", \"alerta\": null, \"oficina\": null, \"total\": null}.",
    carroTxt ? `The person's car: ${carroTxt}.` : "",
  ].filter(Boolean).join("\n");
}
