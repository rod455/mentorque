"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { quandoAvisarCarroParado } from "./carroParado";
import type { EstadoQuiz } from "./quiz/sequencia";
import type { ServiceRecord, Vehicle } from "./types";

// O aviso de "cadastrou o carro e sumiu".
//
// POR QUE EXISTE (10/09/2026). É onde a coorte morre: das pessoas que criam
// conta, 1 em 8 volta na primeira semana e 1 em 5 faz a primeira ação de
// valor em 7 dias (retrato de 10/09, coortes de 31/08 e 07/09; amostra
// pequena, mas as duas apontam para o mesmo lugar). Quem cadastra o carro e
// não registra nada nem responde o quiz nos dois dias seguintes não tem
// nenhum motivo para voltar: nada do app fala com ela.
//
// UM AVISO, dois dias depois do cadastro, às 9h, e só se até lá a pessoa não
// tiver feito nada com o carro. Um, e não uma série: aviso local não persegue
// ninguém, e a essa altura quem não voltou já respondeu. O mesmo desenho do
// lembrete do quiz. A regra pura (quando avisa, quando não) está em
// carroParado.ts, conferida por `npm run conferir:aviso`.
//
// O que conta como "fez alguma coisa": registrou um serviço neste carro, ou
// respondeu o quiz alguma vez. Atualizar o km não conta de propósito: o km
// entra no próprio cadastro.

/**
 * Põe o aviso em dia com o estado atual: agenda, reagenda ou cancela.
 *
 * Reagendado a cada abertura e a cada mudança de serviço ou quiz, com id
 * fixo: o mesmo id substitui, então nunca há dois. Sem permissão não agenda
 * e não pede; quem convida é o ConviteDeAviso, logo depois do cadastro.
 */
export async function sincronizarLembreteCarroParado(o: {
  quer: boolean;
  veiculo: Vehicle | null;
  servicosDoCarro: readonly ServiceRecord[];
  quiz: EstadoQuiz | undefined;
  textos: { titulo: string; corpo: string };
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;
  if (!o.quer) {
    await cancelar(AVISO.carroParado);
    return;
  }
  if (!(await permissaoConcedida())) return;
  const quando = quandoAvisarCarroParado(o);
  if (!quando) {
    await cancelar(AVISO.carroParado);
    return;
  }
  await agendar({ id: AVISO.carroParado, titulo: o.textos.titulo, corpo: o.textos.corpo, quando });
}
