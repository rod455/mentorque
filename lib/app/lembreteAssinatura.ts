"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";

// Lembrete de que o teste grátis está acabando.
//
// O medo que ele responde é concreto e é o que mais aparece em avaliação de
// uma estrela em app de assinatura: "esqueci de cancelar e me cobraram". Quem
// tem esse medo ou não assina, ou assina e cancela no primeiro dia para não
// esquecer. Avisar antes é o que permite a pessoa usar o teste inteiro em paz.
//
// Por isso o lembrete é uma promessa de honestidade, não de marketing. O texto
// diz que a cobrança vem e onde cancelar. Um aviso escrito para segurar a
// pessoa ("não perca seu acesso!") faz o oposto: transforma o único momento em
// que ela confia no app numa tentativa de retenção, e ela cancela ali mesmo.

// Quantos dias antes do fim. Dois é o intervalo que dá tempo de decidir sem
// esquecer de novo: um dia antes vira urgência, uma semana antes some da
// memória.
const DIAS_ANTES = 2;

// Hora do dia em que o aviso sai (horário do aparelho). Meio da tarde: cedo
// demais some entre os avisos da manhã, tarde demais chega quando a pessoa não
// vai parar para resolver.
const HORA = 15;

/**
 * Calcula QUANDO avisar, ou null se não cabe aviso.
 *
 * Exportada separada da parte que fala com o sistema para poder ser conferida
 * sozinha: é uma regra de data, e regra de data errada aqui significa avisar
 * depois da cobrança, que é pior do que não avisar.
 */
export function quandoAvisar(fimISO: string | null, agora = new Date()): Date | null {
  if (!fimISO) return null;
  const fim = new Date(fimISO);
  if (Number.isNaN(fim.getTime())) return null;

  const quando = new Date(fim);
  quando.setDate(quando.getDate() - DIAS_ANTES);
  quando.setHours(HORA, 0, 0, 0);

  // Já passou da hora de avisar (assinou faltando menos de 2 dias, ou o app só
  // soube depois): não agenda. Aviso atrasado sobre prazo é ruído.
  if (quando.getTime() <= agora.getTime()) return null;
  // Nem faz sentido avisar depois do fim.
  if (quando.getTime() >= fim.getTime()) return null;
  return quando;
}

type Estado = {
  /** A pessoa ligou o lembrete nas preferências. */
  querLembrete: boolean;
  /** Tem assinatura ativa (ou em teste) hoje. */
  assinante: boolean;
  /** Fim do período atual, ISO. Durante o teste, é o fim do teste. */
  fimDoPeriodo: string | null;
  /** Já pediu para cancelar: não vai ser cobrada, então não há o que avisar. */
  cancelando: boolean;
  textos: { titulo: string; corpo: string };
};

/**
 * Põe o agendamento em dia com o estado atual. Idempotente de propósito: pode
 * ser chamada em toda mudança de assinatura, porque agendar com o mesmo id
 * substitui o anterior em vez de empilhar avisos.
 */
export async function sincronizarLembrete(e: Estado): Promise<void> {
  if (!notificacoesDisponiveis()) return;

  // Qualquer um destes derruba o aviso: sem interesse, sem assinatura, ou já
  // cancelada (aí não existe cobrança para avisar).
  if (!e.querLembrete || !e.assinante || e.cancelando) {
    await cancelar(AVISO.fimDoTeste);
    return;
  }

  const quando = quandoAvisar(e.fimDoPeriodo);
  if (!quando) {
    await cancelar(AVISO.fimDoTeste);
    return;
  }

  // Sem permissão não adianta agendar, e também não é hora de pedir: pedir
  // permissão fora de um toque da pessoa é o caminho mais curto para o "não".
  if (!(await permissaoConcedida())) return;

  await agendar({ id: AVISO.fimDoTeste, titulo: e.textos.titulo, corpo: e.textos.corpo, quando });
}
