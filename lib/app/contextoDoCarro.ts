"use client";

// O que a Biela sabe sobre o carro ALÉM de marca, modelo e ano.
//
// POR QUE ISTO EXISTE. A Biela sempre soube QUAL é o carro e nunca soube o que
// já foi feito nele. Então ela respondia "pode ser bateria" para quem trocou a
// bateria há três meses, e o app tinha essa informação guardada na tela ao
// lado. Três ativos estavam dormindo: o histórico de serviços, o código OBD2
// que a pessoa acabou de consultar e as observações do sintoma.
//
// A regra que orienta o recorte: **entra o que MUDA a resposta.** Serviço
// recente muda (não se recomenda o que acabou de ser feito). Código de erro
// muda (ele é o dado mais duro que existe sobre o carro). Nota de serviço de
// dois anos atrás não muda quase nada e custa token em toda pergunta.
//
// TETO É PARTE DO DESENHO, não zelo. Isto vira corpo de uma requisição pública,
// e a rota confere de novo do lado de lá; aqui a gente corta na origem para a
// conta não crescer com o histórico de quem usa o app há um ano.

import type { ServiceRecord, Vehicle } from "./types";

/** Quantos serviços recentes acompanham a pergunta. */
const MAX_SERVICOS = 6;
/** De quanto tempo para trás um serviço ainda muda a resposta. */
const MESES_DE_HISTORICO = 18;
/** Tamanho máximo de cada texto livre que a pessoa digitou. */
const MAX_TEXTO = 120;

export type ServicoResumido = {
  /** O que foi feito, já em texto legível. */
  o: string;
  /** Data ISO. */
  em: string;
  /** Km do carro na hora. */
  km?: number;
};

export type ContextoDoCarro = {
  servicos?: ServicoResumido[];
  /** Códigos de erro que a pessoa consultou nesta sessão, mais novo primeiro. */
  obd2?: string[];
  /** O sintoma que a pessoa estava investigando, e o que ela observou. */
  sintoma?: { nome: string; observou?: string[] };
};

const corta = (s: string, n = MAX_TEXTO) => s.trim().slice(0, n);

/**
 * Os serviços que valem ser contados à Biela.
 *
 * Mais novo primeiro, com teto de quantidade E de idade. As duas travas são
 * necessárias: quem cuida bem do carro tem muitos serviços recentes, e quem tem
 * o app há tempo tem poucos serviços mas antigos.
 */
export function servicosParaIA(servicos: ServiceRecord[], veiculo: Vehicle | null): ServicoResumido[] {
  if (!veiculo) return [];
  const limite = new Date();
  limite.setMonth(limite.getMonth() - MESES_DE_HISTORICO);
  const corteISO = limite.toISOString().slice(0, 10);

  return servicos
    .filter((r) => r.vehicleId === veiculo.id && typeof r.date === "string" && r.date >= corteISO)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, MAX_SERVICOS)
    .map((r) => {
      // As peças entram no texto porque é nelas que mora a resposta: "revisão"
      // não diz nada, "revisão (pastilhas, disco dianteiro)" diz que freio foi
      // mexido. Só o nome; valor é assunto de bolso, não de diagnóstico.
      const pecas = (r.parts ?? [])
        .map((p) => p?.name)
        .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
        .slice(0, 4)
        .join(", ");
      return {
        o: corta(pecas ? `${r.type} (${pecas})` : r.type),
        em: r.date,
        ...(Number.isFinite(r.km) ? { km: r.km } : null),
      };
    });
}

/** Monta o contexto inteiro, já podado. Devolve `null` quando não há nada útil. */
export function contextoDoCarro(o: {
  servicos: ServiceRecord[];
  veiculo: Vehicle | null;
  obd2?: string[];
  sintoma?: { nome: string; observou?: string[] } | null;
}): ContextoDoCarro | null {
  const servicos = servicosParaIA(o.servicos, o.veiculo);
  const obd2 = (o.obd2 ?? []).filter((c) => /^[PBCU][0-9A-F]{4}$/i.test(c)).slice(0, 3);
  const sintoma = o.sintoma
    ? { nome: corta(o.sintoma.nome, 60), ...(o.sintoma.observou?.length ? { observou: o.sintoma.observou.slice(0, 4).map((t) => corta(t)) } : null) }
    : null;

  if (!servicos.length && !obd2.length && !sintoma) return null;
  return {
    ...(servicos.length ? { servicos } : null),
    ...(obd2.length ? { obd2 } : null),
    ...(sintoma ? { sintoma } : null),
  };
}
