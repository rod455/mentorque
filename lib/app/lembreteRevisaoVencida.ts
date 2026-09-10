"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { computeUpcoming } from "./health";
import { proximoAvisoDeVencida } from "./revisaoVencida";
import type { ServiceRecord, Vehicle } from "./types";

// O aviso de revisão vencida.
//
// Diferente do lembrete do calendário (lembreteRevisao.ts), que só existe
// para o que a pessoa PÔS lá e avisa no dia previsto, este olha o que a
// saúde do carro já diz que passou do prazo (computeUpcoming, status
// "overdue") e avisa às 9h de amanhã, um item por vez, sem repetir o mesmo
// item antes de 30 dias. A regra está em revisaoVencida.ts. Estimativa nunca
// vira "vencida" (health.ts já garante isso), então o aviso só sai com
// registro de verdade ou data de compra atrás dele.
//
// O registro "avisei este item em tal dia" fica no aparelho, e não na
// sessão, de propósito: é sobre este aparelho não repetir, e sair da conta
// zerar isso é aceitável.
const GUARDADOS = "mq-aviso-vencida";

function avisados(): Record<string, string> {
  try {
    const bruto = window.localStorage.getItem(GUARDADOS);
    const o = bruto ? (JSON.parse(bruto) as unknown) : null;
    return o && typeof o === "object" ? (o as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function marcar(chave: string, dia: string): void {
  try {
    window.localStorage.setItem(GUARDADOS, JSON.stringify({ ...avisados(), [chave]: dia }));
  } catch { /* vale só esta sessão */ }
}

export async function sincronizarLembreteRevisaoVencida(o: {
  quer: boolean;
  veiculo: Vehicle | null;
  servicos: ServiceRecord[];
  textos: { titulo: string; corpo: string; nomes: Record<string, string>; carro: string };
  agora?: Date;
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;
  if (!o.quer || !o.veiculo) {
    await cancelar(AVISO.revisaoVencida);
    return;
  }
  if (!(await permissaoConcedida())) return;

  const agora = o.agora ?? new Date();
  const v = o.veiculo;
  const vencidos = computeUpcoming(v, o.servicos, agora)
    .filter((i) => i.status === "overdue")
    .map((i) => `${v.id}:${i.key}`);
  const proximo = proximoAvisoDeVencida({ vencidos, avisados: avisados(), agora });
  if (!proximo) {
    await cancelar(AVISO.revisaoVencida);
    return;
  }
  const regra = proximo.chave.slice(v.id.length + 1);
  const nome = o.textos.nomes[regra] ?? regra;
  const ok = await agendar({
    id: AVISO.revisaoVencida,
    titulo: o.textos.titulo.replace("{item}", nome).replace("{carro}", o.textos.carro),
    corpo: o.textos.corpo,
    quando: proximo.quando,
  });
  // Marca o dia do AGENDAMENTO, não o do disparo: é o que impede o mesmo
  // item de ser reagendado para "amanhã" a cada abertura durante 30 dias.
  if (ok) marcar(proximo.chave, `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`);
}
