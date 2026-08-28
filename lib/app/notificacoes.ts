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

// O plugin viaja SEMPRE dentro de uma caixa, nunca solto.
//
// Motivo, e é a armadilha que deixava o lembrete inteiro morto até 28/08/2026:
// o objeto que o Capacitor devolve responde a QUALQUER propriedade com uma
// chamada nativa, inclusive `then`. Para o JavaScript, objeto com `then` é
// promessa. Então devolver o plugin de dentro de uma função `async` faz o
// próprio motor chamar `plugin.then(resolver, rejeitar)` para "esperar" essa
// promessa que não existe. O aparelho responde que não conhece o método, a
// rejeição sai por fora do nosso encadeamento (vira linha em app_erros) e,
// pior, NINGUÉM chama `resolver` nem `rejeitar`: a promessa da carga fica
// pendente para sempre.
//
// O estrago disso é silencioso, que é o que o torna difícil de achar: quem
// espera por ela nunca recebe resposta nem erro. O interruptor do Perfil não
// reagia ao toque, o convite depois do quiz nunca aparecia (a pergunta "cabe
// um convite agora?" ficava sem resposta) e nenhum aviso era agendado. A prova
// estava em app_erros: 5 erros em 7 dias, iOS e Android, todos `.then()`.
//
// A caixa resolve porque um objeto comum não parece promessa: o motor devolve
// a caixa inteira sem tocar em nada dentro dela.
type Caixa = { plugin: PluginNotificacoes };

let caixa: Caixa | null = null;
let carregando: Promise<Caixa | null> | null = null;

/** O aparelho consegue notificar? Falso no navegador. */
export function notificacoesDisponiveis(): boolean {
  return isNativeApp() && nativePlatform() !== null;
}

// Carrega sob demanda para o plugin não entrar no pacote do site.
async function carregar(): Promise<Caixa | null> {
  if (caixa) return caixa;
  if (!notificacoesDisponiveis()) return null;
  if (!carregando) {
    carregando = (async () => {
      try {
        const mod = await import("@capacitor/local-notifications");
        const p = mod.LocalNotifications as unknown as PluginNotificacoes;
        if (nativePlatform() === "android") {
          try {
            // importance 4 = aparece na tela e faz som. Lembrete que não aparece
            // não é lembrete. Só no Android: canal é conceito de lá, e no iOS a
            // chamada volta como "não implementado".
            await p.createChannel?.({ id: CANAL, name: "Lembretes", description: "Fim de teste grátis e lembretes do app", importance: 4 });
          } catch {
            /* Android antigo não tem canal */
          }
        }
        caixa = { plugin: p };
        return caixa;
      } catch {
        return null;
      } finally {
        carregando = null;
      }
    })();
  }
  return carregando;
}

/** Já temos permissão? Não pede nada, só consulta. */
export async function permissaoConcedida(): Promise<boolean> {
  const c = await carregar();
  if (!c) return false;
  try {
    return (await c.plugin.checkPermissions()).display === "granted";
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
  const c = await carregar();
  if (!c) return false;
  try {
    const atual = await c.plugin.checkPermissions();
    if (atual.display === "granted") return true;
    // "denied" já foi recusado antes: o sistema não pergunta de novo, e insistir
    // só devolve o mesmo não. Quem quiser reverter faz nos ajustes do aparelho.
    if (atual.display === "denied") return false;
    return (await c.plugin.requestPermissions()).display === "granted";
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
  const c = await carregar();
  if (!c) return false;
  if (!(o.quando instanceof Date) || Number.isNaN(o.quando.getTime()) || o.quando.getTime() <= Date.now()) {
    await cancelar(o.id);
    return false;
  }
  if (!(await permissaoConcedida())) return false;
  try {
    await c.plugin.schedule({
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
  const c = await carregar();
  if (!c) return;
  try {
    await c.plugin.cancel({ notifications: [{ id }] });
  } catch {
    /* nada agendado com esse id: o plugin ignora */
  }
}
