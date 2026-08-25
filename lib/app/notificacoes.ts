"use client";

import { isNativeApp, nativePlatform } from "./wrapper";

// Notificações locais do app das lojas.
//
// LOCAL, não push. A diferença importa: local é agendada pelo próprio aparelho
// e dispara sozinha mesmo sem internet, sem servidor, sem Firebase e sem chave
// da Apple. Serve para lembrete que o app já sabe a data ("seu teste acaba
// em 2 dias", "o quiz de hoje saiu"). O que ela NÃO faz é você mandar uma
// mensagem hoje para quem não abriu o app: isso é push, é outro plugin e
// depende de projeto no Firebase e de chave APNs.
//
// Por que este arquivo existe em vez de chamar o plugin direto: o app roda em
// três lugares (iPhone, Android e navegador) e o plugin só existe nos dois
// primeiros. Sem um lugar único para perguntar "dá para notificar aqui?", cada
// tela acabaria com o seu próprio try/catch e o navegador quebraria em silêncio.
//
// Histórico que vale registrar: até 25/08/2026 o app TINHA um interruptor de
// "lembrar antes do teste acabar" que não agendava nada. Estado local morto,
// sem plugin por trás. Foi removido por ser promessa falsa, e volta agora com
// o plugin de verdade atrás dele.

type Permissao = "prompt" | "prompt-with-rationale" | "granted" | "denied";

type PluginNotificacoes = {
  checkPermissions: () => Promise<{ display: Permissao }>;
  requestPermissions: () => Promise<{ display: Permissao }>;
  schedule: (o: { notifications: NotificacaoAgendada[] }) => Promise<unknown>;
  cancel: (o: { notifications: { id: number }[] }) => Promise<void>;
  createChannel?: (c: { id: string; name: string; description?: string; importance: 1 | 2 | 3 | 4 | 5 }) => Promise<void>;
};

type NotificacaoAgendada = {
  id: number;
  title: string;
  body: string;
  schedule: { at: Date; allowWhileIdle?: boolean };
  channelId?: string;
  smallIcon?: string;
};

// Identificadores fixos, um por finalidade.
//
// Fixos DE PROPÓSITO: agendar de novo com o mesmo id substitui o agendamento
// anterior em vez de empilhar. É isso que permite reagendar o lembrete toda vez
// que a assinatura muda de estado sem a pessoa receber três avisos iguais.
export const AVISO = {
  fimDoTeste: 1,
  quizDoDia: 2,
} as const;

// Canal do Android. Sem canal declarado, o Android 8+ joga a notificação num
// canal padrão que o usuário não consegue configurar separadamente.
const CANAL = "mentorque-lembretes";

let plugin: PluginNotificacoes | null = null;
let carregando: Promise<PluginNotificacoes | null> | null = null;

/** O aparelho consegue notificar? Falso no navegador. */
export function notificacoesDisponiveis(): boolean {
  return isNativeApp() && nativePlatform() !== null;
}

// Carrega sob demanda para o plugin não entrar no pacote do site.
async function carregar(): Promise<PluginNotificacoes | null> {
  if (plugin) return plugin;
  if (!notificacoesDisponiveis()) return null;
  if (!carregando) {
    carregando = import("@capacitor/local-notifications")
      .then(async (mod) => {
        const p = mod.LocalNotifications as unknown as PluginNotificacoes;
        try {
          // importance 4 = aparece na tela e faz som. Lembrete que não aparece
          // não é lembrete.
          await p.createChannel?.({ id: CANAL, name: "Lembretes", description: "Fim de teste grátis e lembretes do app", importance: 4 });
        } catch {
          /* iOS não tem canal; Android antigo também não */
        }
        plugin = p;
        return p;
      })
      .catch(() => null)
      .finally(() => {
        carregando = null;
      });
  }
  return carregando;
}

/** Já temos permissão? Não pede nada, só consulta. */
export async function permissaoConcedida(): Promise<boolean> {
  const p = await carregar();
  if (!p) return false;
  try {
    return (await p.checkPermissions()).display === "granted";
  } catch {
    return false;
  }
}

/**
 * Pede a permissão do sistema.
 *
 * Chamar SÓ quando a pessoa pediu algo que depende disso (ligou o interruptor,
 * assinou e quer ser avisada). Pedir na abertura do app é o erro clássico: o
 * sistema só deixa perguntar uma vez, e um "não" ali fecha a porta para sempre,
 * inclusive para os avisos que ela realmente ia querer depois.
 */
export async function pedirPermissao(): Promise<boolean> {
  const p = await carregar();
  if (!p) return false;
  try {
    const atual = await p.checkPermissions();
    if (atual.display === "granted") return true;
    // "denied" já foi recusado antes: o sistema não pergunta de novo, e insistir
    // só devolve o mesmo não. Quem quiser reverter faz nos ajustes do aparelho.
    if (atual.display === "denied") return false;
    return (await p.requestPermissions()).display === "granted";
  } catch {
    return false;
  }
}

/**
 * Agenda (ou reagenda) um aviso. Data no passado cancela em vez de agendar,
 * porque o sistema dispararia na hora e a pessoa receberia um aviso atrasado
 * do tipo "seu teste acaba em 2 dias" no dia em que ele já acabou.
 */
export async function agendar(o: { id: number; titulo: string; corpo: string; quando: Date }): Promise<boolean> {
  const p = await carregar();
  if (!p) return false;
  if (!(o.quando instanceof Date) || Number.isNaN(o.quando.getTime()) || o.quando.getTime() <= Date.now()) {
    await cancelar(o.id);
    return false;
  }
  if (!(await permissaoConcedida())) return false;
  try {
    await p.schedule({
      notifications: [
        {
          id: o.id,
          title: o.titulo,
          body: o.corpo,
          // allowWhileIdle: o Android adia alarmes com a tela desligada há
          // horas, e é justamente aí que o lembrete precisa sair.
          schedule: { at: o.quando, allowWhileIdle: true },
          channelId: CANAL,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelar(id: number): Promise<void> {
  const p = await carregar();
  if (!p) return;
  try {
    await p.cancel({ notifications: [{ id }] });
  } catch {
    /* nada agendado com esse id: o plugin ignora */
  }
}
