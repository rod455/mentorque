"use client";

import { agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { planoDosItens, type PlanoDeItem } from "./planoDeRevisao";
import { diaLocal } from "./datas";
import type { ServiceRecord, Vehicle } from "./types";

// Os avisos dos serviços que a pessoa pôs no calendário.
//
// A DATA NÃO É ESCOLHIDA PELA PESSOA, é calculada (decisão do dono, 30/08).
// Faz sentido: ela pôs "troca de óleo" no calendário justamente porque não
// sabe quando é. Pedir a data de volta seria devolver a pergunta.
//
// Hora do dia: 9h, a mesma do quiz. Aviso de manutenção às 3h da manhã é
// aviso que a pessoa desliga.
const HORA = 9;

// A faixa de ids destes avisos, longe dos fixos do AVISO (1 e 2).
//
// O id precisa ser ESTÁVEL para o mesmo item: reagendar com o mesmo id
// substitui, e é isso que impede a pessoa de acumular sete avisos iguais
// depois de sete aberturas do app. Como o par (carro, serviço) é texto, o id
// sai de um hash. Colisão é possível e o estrago dela é pequeno e conhecido:
// dois itens dividiriam um id e só o último agendado avisaria. Com sete regras
// e uma garagem pequena, a chance é remota; se um dia a garagem crescer, isto
// aqui vira uma tabela de verdade.
const FAIXA_INICIO = 1000;
const FAIXA_TAMANHO = 8000;
const GUARDADOS = "mq-avisos-revisao";

export function idDoAviso(veiculoId: string, chave: string): number {
  const texto = `${veiculoId}:${chave}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return FAIXA_INICIO + (h % FAIXA_TAMANHO);
}

/**
 * QUANDO avisar de um item, ou null se não cabe aviso.
 *
 * Separada do resto para poder ser conferida sozinha. Devolve null para item
 * sem data prevista (o que só tem km não tem dia no calendário) e para data
 * que já passou: avisar no passado não agenda nada, e avisar "hoje" sobre algo
 * vencido há oito meses é ruído.
 */
export function quandoAvisarRevisao(plano: PlanoDeItem, agora = new Date()): Date | null {
  if (!plano.dataPrevista) return null;
  if (plano.dataPrevista < diaLocal(agora)) return null;
  const alvo = new Date(plano.dataPrevista + "T00:00:00");
  alvo.setHours(HORA, 0, 0, 0);
  if (alvo.getTime() <= agora.getTime()) return null;
  return alvo;
}

function guardados(): number[] {
  try {
    const bruto = window.localStorage.getItem(GUARDADOS);
    const lista = bruto ? (JSON.parse(bruto) as unknown) : null;
    return Array.isArray(lista) ? lista.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

/**
 * Põe os avisos de revisão em dia com o calendário atual.
 *
 * CANCELA TUDO ANTES DE REAGENDAR, e é o que faz o botão de remover funcionar
 * de verdade: sem isso, tirar um item da lista deixaria o aviso dele agendado
 * no sistema, e a pessoa receberia um lembrete de algo que ela já apagou. O
 * conjunto agendado fica guardado no aparelho justamente para ser cancelável
 * na abertura seguinte.
 *
 * Nunca pede permissão: isso é do toque no Perfil. Aqui, sem permissão, sai
 * em silêncio.
 */
export async function sincronizarLembretesDeRevisao(o: {
  quer: boolean;
  veiculo: Vehicle | null;
  servicos: ServiceRecord[];
  lembretes: string[];
  textos: { titulo: string; corpo: string; nomes: Record<string, string>; carro: string };
  agora?: Date;
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;

  const anteriores = guardados();
  if (anteriores.length) {
    for (const id of anteriores) await cancelar(id);
    try { window.localStorage.removeItem(GUARDADOS); } catch { /* segue */ }
  }

  if (!o.quer || !o.veiculo) return;
  if (!(await permissaoConcedida())) return;

  const v = o.veiculo;
  const chaves = o.lembretes
    .filter((id) => id.startsWith(`${v.id}:`))
    .map((id) => id.slice(v.id.length + 1));
  if (!chaves.length) return;

  const agora = o.agora ?? new Date();
  const planos = planoDosItens(v, o.servicos, chaves, agora);
  const agendados: number[] = [];

  for (const plano of planos) {
    const quando = quandoAvisarRevisao(plano, agora);
    if (!quando) continue;
    const id = idDoAviso(v.id, plano.key);
    const nome = o.textos.nomes[plano.key] ?? plano.key;
    const ok = await agendar({
      id,
      titulo: o.textos.titulo.replace("{item}", nome).replace("{carro}", o.textos.carro),
      corpo: o.textos.corpo,
      quando,
    });
    if (ok) agendados.push(id);
  }

  if (agendados.length) {
    try { window.localStorage.setItem(GUARDADOS, JSON.stringify(agendados)); } catch { /* vale só esta sessão */ }
  }
}
