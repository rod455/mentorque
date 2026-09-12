// A decisão da jornada: para ESTA pessoa, HOJE, qual e-mail cabe, ou nenhum.
//
// Aprovada pelo dono em 12/09/2026 (docs/agentes/propostas/jornada-de-recorrencia.md).
// Pura de propósito: recebe o retrato de uma pessoa e a data, devolve uma
// escolha. Não sabe o que é Resend, Supabase nem push. É o pedaço que
// `npm run conferir:jornada` exercita caso a caso, porque cada regra aqui
// erra em silêncio: ninguém reclama do e-mail que não chegou, e quem recebe
// dois no mesmo dia não avisa, sai.
//
// AS PRIORIDADES, na ordem em que são testadas, e o porquê de cada corte:
//
//   0. Quem saiu não recebe nada, nunca. Antes de qualquer regra.
//   1. Quem mexeu no app hoje não recebe nada hoje. Lembrete para quem está
//      usando é ruído, e ruído ensina a ignorar o remetente.
//   2. Um e-mail a cada três dias, no máximo. Cadência, gatilho e sazonal
//      disputam a mesma vaga; não se somam.
//   3. Gatilho ganha de cadência, cadência ganha de sazonal. O gatilho fala
//      do carro DESSA pessoa neste ponto (revisão vencida, km parado); a
//      cadência fala do que o app faz; o sazonal fala do calendário. Quanto
//      mais pessoal, mais na frente.
//
// A CADÊNCIA SÓ EXISTE NA JANELA DELA. O e-mail do dia 2 sai entre o dia 2 e
// o dia 5 depois de a conta nascer; passou, passou. Sem isso, ligar a jornada
// hoje mandaria cinco e-mails atrasados para as 27 contas antigas, em rajada,
// que é o jeito mais rápido de virar spam. As contas antigas entram pelos
// gatilhos e pelo "sumiu", que é o que faz sentido para elas.
//
// O que cada gatilho lê já é regra do app, não regra nova: `computeUpcoming`
// (saúde), `planoDosItens` (calendário), `FAIXAS_NACIONAIS` (preço). O
// e-mail e o aviso local no aparelho falam do mesmo item pela mesma régua.

import type { ServiceRecord, Vehicle } from "../app/types";
import { diasEntre } from "../app/datas.ts";
import { computeUpcoming, REVISION_RULES } from "../app/health.ts";
import { planoDosItens } from "../app/planoDeRevisao.ts";
import { FAIXAS_NACIONAIS } from "../app/faixaDePreco.ts";

export type Envio = { chave: string; dia: string };

export type PessoaDaJornada = {
  userId: string;
  email: string;
  nome: string | null;
  /** Dia em que a conta nasceu, yyyy-mm-dd. */
  contaCriadaEm: string;
  /** Carros ativos (sem `soldAt`). */
  veiculos: Vehicle[];
  /** Id do carro em uso no app, quando há mais de um. */
  carroPrincipalId?: string | null;
  servicos: ServiceRecord[];
  /** Total de respostas do quiz (o `quiz.respostas` do estado). */
  quizRespostas: number;
  /** Último dia em que o estado mudou ou o quiz foi respondido, yyyy-mm-dd. */
  ultimaAtividade: string | null;
  /** Há manual do carro principal na Biela. */
  temManual: boolean;
  uf: string | null;
  cidade: string | null;
  /** Pediu para sair. */
  saiu: boolean;
  /** O que já recebeu (chave e dia). */
  envios: Envio[];
};

export type Familia = "cadencia" | "gatilho" | "sazonal";

export type Escolha = {
  chave: string;
  familia: Familia;
  /** Uma frase para o ensaio e para o diário: por que ESTE hoje. */
  motivo: string;
  /** O carro de que o e-mail fala, quando há. */
  carro: Vehicle | null;
  /** Item do calendário (oil, brakes...) nos gatilhos de revisão. */
  item?: string;
  /** O serviço registrado, no gatilho de preço. */
  servico?: ServiceRecord;
};

// ---- as réguas, num lugar só ------------------------------------------------

/** Mínimo de dias entre dois e-mails para a mesma pessoa. */
export const ESPACO_MINIMO_DIAS = 3;
/** A cadência só sai até este número de dias depois do marco. */
export const JANELA_DA_CADENCIA = 3;
/** Os marcos da cadência, em dias depois de a conta nascer. */
export const MARCOS_DA_CADENCIA: { chave: string; dia: number }[] = [
  { chave: "d0", dia: 0 },
  { chave: "d2", dia: 2 },
  { chave: "d5", dia: 5 },
  { chave: "d9", dia: 9 },
  { chave: "d14", dia: 14 },
];
/** Revisão vencida: de novo só depois de tantos dias, por item. */
export const VENCIDA_A_CADA_DIAS = 30;
/** Revisão chegando: janela à frente (dias e km) e repetição por item. */
export const CHEGANDO_DIAS = 30;
export const CHEGANDO_KM = 1000;
export const CHEGANDO_A_CADA_DIAS = 60;
/** Serviço com valor registrado há até tantos dias vira comparação. */
export const PRECO_ATE_DIAS = 10;
/** Km sem atualização há tantos dias. */
export const KM_PARADO_DIAS = 45;
/** Sumiu do app: os dois marcos e a repetição. */
export const SUMIU_1 = 14;
export const SUMIU_2 = 30;
/** As épocas do ano, com a janela de dias em que o e-mail pode sair. */
export const SAZONAIS: { chave: string; mes: number; de: number; ate: number }[] = [
  { chave: "ferias-12", mes: 12, de: 1, ate: 10 },
  { chave: "ferias-07", mes: 7, de: 1, ate: 10 },
  { chave: "chuva", mes: 10, de: 1, ate: 15 },
  { chave: "ipva", mes: 1, de: 5, ate: 20 },
];

// ---- ajudantes --------------------------------------------------------------

export function carroPrincipal(p: Pick<PessoaDaJornada, "veiculos" | "carroPrincipalId">): Vehicle | null {
  const ativos = p.veiculos.filter((v) => !v.soldAt);
  if (!ativos.length) return null;
  return ativos.find((v) => v.id === p.carroPrincipalId) ?? ativos[0];
}

/** Dia em que a chave foi enviada pela última vez, ou null. */
function ultimoEnvio(p: PessoaDaJornada, chave: string): string | null {
  let ultimo: string | null = null;
  for (const e of p.envios) if (e.chave === chave && (!ultimo || e.dia > ultimo)) ultimo = e.dia;
  return ultimo;
}

function jaRecebeu(p: PessoaDaJornada, chave: string): boolean {
  return ultimoEnvio(p, chave) !== null;
}

/** Recebeu esta chave há menos de `dias` dias? */
function recebeuHaMenosDe(p: PessoaDaJornada, chave: string, dias: number, hoje: string): boolean {
  const u = ultimoEnvio(p, chave);
  return u !== null && diasEntre(u, hoje) < dias;
}

function servicosDoCarro(p: PessoaDaJornada, carro: Vehicle): ServiceRecord[] {
  return p.servicos.filter((s) => s.vehicleId === carro.id);
}

// ---- a decisão --------------------------------------------------------------

/**
 * Qual e-mail cabe hoje, ou null.
 *
 * `hoje` em yyyy-mm-dd no fuso da pessoa (Brasília, no cron); `agora` é o
 * mesmo instante como Date, para as regras do app que recebem Date.
 */
export function escolherEmail(p: PessoaDaJornada, hoje: string, agora = new Date(`${hoje}T12:00:00`)): Escolha | null {
  if (p.saiu) return null;
  if (p.ultimaAtividade === hoje) return null;

  // Um a cada três dias, contando qualquer família.
  let ultimoDia: string | null = null;
  for (const e of p.envios) if (!ultimoDia || e.dia > ultimoDia) ultimoDia = e.dia;
  if (ultimoDia && diasEntre(ultimoDia, hoje) < ESPACO_MINIMO_DIAS) return null;

  return gatilho(p, hoje, agora) ?? cadencia(p, hoje) ?? sazonal(p, hoje);
}

function gatilho(p: PessoaDaJornada, hoje: string, agora: Date): Escolha | null {
  const carro = carroPrincipal(p);
  const chaves = REVISION_RULES.map((r) => r.key);

  if (carro) {
    const servicos = servicosDoCarro(p, carro);

    // Revisão vencida: só o que é FATO, com um serviço DAQUELE tipo registrado.
    // A saúde do app também vence pelo tempo desde a compra, e na tela isso
    // faz sentido; num e-mail que diz "pelo último registro" seria inventar
    // um atraso de 30 meses para quem só informou quando comprou o carro. A
    // compra sem registro cai no "chegando" e no "parado", que pedem o
    // registro em vez de cobrar. Uma vez por item a cada 30 dias, a mesma
    // régua do aviso local.
    const tiposRegistrados = new Set(servicos.map((s) => s.type));
    const vencidos = computeUpcoming(carro, servicos, agora).filter((i) => i.status === "overdue" && !i.estimado && tiposRegistrados.has(i.key));
    for (const v of vencidos) {
      const chave = `vencida:${v.key}`;
      if (!recebeuHaMenosDe(p, chave, VENCIDA_A_CADA_DIAS, hoje)) {
        return { chave, familia: "gatilho", motivo: `${v.key} vencido no ${nomeDoCarro(carro)}`, carro, item: v.key };
      }
    }

    // Revisão chegando: data prevista dentro de 30 dias, ou km previsto a
    // menos de 1.000 km, sem ser estimativa e sem já ter vencido.
    for (const plano of planoDosItens(carro, servicos, chaves, agora)) {
      if (plano.vencido) continue;
      const porData = plano.dataPrevista !== null && diasEntre(hoje, plano.dataPrevista) >= 0 && diasEntre(hoje, plano.dataPrevista) <= CHEGANDO_DIAS;
      const porKm = plano.kmRestantes !== null && !plano.kmEstimado && plano.kmRestantes >= 0 && plano.kmRestantes <= CHEGANDO_KM;
      if (!porData && !porKm) continue;
      const chave = `chegando:${plano.key}`;
      if (recebeuHaMenosDe(p, chave, CHEGANDO_A_CADA_DIAS, hoje)) continue;
      return { chave, familia: "gatilho", motivo: `${plano.key} vence em breve no ${nomeDoCarro(carro)}`, carro, item: plano.key };
    }

    // Serviço com valor, registrado há pouco, de um tipo que tem faixa: a
    // comparação com a região. Uma vez por serviço.
    const recente = [...servicos]
      .filter((s) => typeof s.total === "number" && s.total > 0 && FAIXAS_NACIONAIS[s.type] && diasEntre(s.date, hoje) >= 0 && diasEntre(s.date, hoje) <= PRECO_ATE_DIAS)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (recente && !jaRecebeu(p, `preco:${recente.id}`)) {
      return { chave: `preco:${recente.id}`, familia: "gatilho", motivo: `pagou R$ ${recente.total} em ${recente.type}`, carro, servico: recente };
    }

    // Cadastrou o carro e sumiu: zero serviço, zero quiz. Dia 2 e dia 7 depois
    // do cadastro (o aviso local cobre o dia 2 no aparelho; aqui é o e-mail).
    if (carro.createdAt && servicos.length === 0 && p.quizRespostas === 0) {
      const desde = diasEntre(carro.createdAt.slice(0, 10), hoje);
      if (desde >= 7 && desde <= 13 && !jaRecebeu(p, "parado-7")) {
        return { chave: "parado-7", familia: "gatilho", motivo: `${nomeDoCarro(carro)} cadastrado há ${desde} dias sem nada`, carro };
      }
      if (desde >= 2 && desde <= 6 && !jaRecebeu(p, "parado-2")) {
        return { chave: "parado-2", familia: "gatilho", motivo: `${nomeDoCarro(carro)} cadastrado há ${desde} dias sem nada`, carro };
      }
    }

    // Km parado: o calendário por km depende dele.
    if (typeof carro.odometerKm === "number" && carro.odometerKm > 0 && carro.kmUpdatedAt) {
      const desde = diasEntre(carro.kmUpdatedAt.slice(0, 10), hoje);
      if (desde >= KM_PARADO_DIAS && !recebeuHaMenosDe(p, "km", KM_PARADO_DIAS, hoje)) {
        return { chave: "km", familia: "gatilho", motivo: `km do ${nomeDoCarro(carro)} parado há ${desde} dias`, carro };
      }
    }
  }

  // Sumiu do app: para todo mundo, com ou sem carro.
  if (p.ultimaAtividade) {
    const desde = diasEntre(p.ultimaAtividade, hoje);
    if (desde >= SUMIU_2 && !recebeuHaMenosDe(p, "sumiu-30", 60, hoje)) {
      return { chave: "sumiu-30", familia: "gatilho", motivo: `sem atividade há ${desde} dias`, carro };
    }
    if (desde >= SUMIU_1 && desde < SUMIU_2 && !recebeuHaMenosDe(p, "sumiu-14", 30, hoje)) {
      return { chave: "sumiu-14", familia: "gatilho", motivo: `sem atividade há ${desde} dias`, carro };
    }
  }

  return null;
}

function cadencia(p: PessoaDaJornada, hoje: string): Escolha | null {
  const dias = diasEntre(p.contaCriadaEm, hoje);
  if (dias < 0) return null;
  const carro = carroPrincipal(p);
  for (const m of MARCOS_DA_CADENCIA) {
    // O "sua conta está pronta" só faz sentido no dia ou no seguinte; três
    // dias depois já é notícia velha. Os outros marcos têm a janela cheia.
    const janela = m.chave === "d0" ? 1 : JANELA_DA_CADENCIA;
    if (dias < m.dia || dias > m.dia + janela) continue;
    if (jaRecebeu(p, m.chave)) continue;
    // O do dia 5 pede o primeiro serviço; quem já registrou não precisa.
    if (m.chave === "d5" && p.servicos.length > 0) continue;
    return { chave: m.chave, familia: "cadencia", motivo: `conta com ${dias} dias, ${carro ? "com" : "sem"} carro`, carro };
  }
  return null;
}

function sazonal(p: PessoaDaJornada, hoje: string): Escolha | null {
  const carro = carroPrincipal(p);
  if (!carro) return null;
  const [ano, mes, dia] = hoje.split("-").map(Number);
  for (const s of SAZONAIS) {
    if (mes !== s.mes || dia < s.de || dia > s.ate) continue;
    const chave = `sazonal:${s.chave}-${ano}`;
    if (jaRecebeu(p, chave)) continue;
    return { chave, familia: "sazonal", motivo: `época: ${s.chave}`, carro };
  }
  return null;
}

/** "Gol 2016", ou o apelido que a pessoa deu. */
export function nomeDoCarro(v: Vehicle): string {
  return v.nickname?.trim() || `${v.make} ${v.model} ${v.year}`.replace(/\s+/g, " ").trim();
}
