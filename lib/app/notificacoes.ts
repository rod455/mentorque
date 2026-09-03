"use client";

import { anotaRota, type RotaDeAviso } from "./rotaPendente";
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
  addListener: (
    ev: "localNotificationActionPerformed",
    cb: (dado: { notification?: { extra?: Record<string, unknown> | null } }) => void
  ) => Promise<{ remove: () => Promise<void> }>;
};

type NotificacaoAgendada = {
  id: number;
  title: string;
  body: string;
  schedule: { at: Date; allowWhileIdle?: boolean };
  channelId?: string;
  smallIcon?: string;
  /**
   * A carga que volta para o app quando a pessoa TOCA no aviso. É por aqui que
   * o destino viaja: sem ela, o toque só abre o app, e quem tocou em "responda
   * a pergunta do dia" cai na tela inicial. Ver lib/app/rotaPendente.ts.
   */
  extra?: Record<string, string>;
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
/** O ouvinte de toque já está de pé nesta sessão? Ver `ouvirToqueEmAviso`. */
let jaOuvindo = false;

/**
 * Este aparelho já agendou algum aviso alguma vez?
 *
 * POR QUE ISTO EXISTE. `cancelar` era chamado em toda resposta do quiz e em
 * toda abertura do app, inclusive para quem NUNCA ligou os avisos. E cancelar
 * carrega o plugin, que cria canal de notificação e atravessa a ponte nativa,
 * tudo para descobrir que não havia nada agendado. Trabalho nativo inútil no
 * caminho mais quente do app.
 *
 * Isso deixou de ser só desperdício em 02/09/2026, quando chegou o relato de
 * app FECHANDO ao responder o quiz no Android. Não sabemos ainda se a culpa é
 * daqui, mas trabalho nativo que não precisa acontecer não deve acontecer no
 * instante em que a pessoa toca na resposta.
 *
 * `null` quer dizer "não dá para afirmar" (aparelho sem armazenamento, ou
 * quem atualizou de uma versão anterior a esta marca). Nesse caso vale o
 * comportamento antigo: cancela de verdade. Errar para o lado de cancelar um
 * aviso que não existe é barato; errar para o lado de deixar um aviso vivo
 * depois de a pessoa desligar o interruptor é quebrar a promessa dela.
 */
const JA_AGENDOU = "mq-avisos-ja-agendou";

function jaAgendouAlgumaVez(): boolean | null {
  try {
    const v = window.localStorage.getItem(JA_AGENDOU);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}

function marcaQueAgendou(): void {
  try {
    window.localStorage.setItem(JA_AGENDOU, "1");
  } catch {
    /* sem armazenamento: volta ao comportamento antigo, que é o seguro */
  }
}

/**
 * Planta a marca na primeira abertura depois da atualização.
 *
 * Sem isto a marca nunca nasceria "não" e a economia não valeria para
 * instalação nova nenhuma, que é justamente o caso comum. O valor sai do
 * interruptor da pessoa, e é por isso que ele é confiável: quem chega aqui com
 * os avisos DESLIGADOS não tem aviso agendado, porque nenhum caminho do app
 * agenda com o interruptor desligado.
 *
 * A ASSIMETRIA É DE PROPÓSITO, e é o que protege quem atualiza de versão
 * antiga: "ligado" grava sempre e por cima, "desligado" só grava se ainda não
 * houver marca. O motivo é que a sessão é hidratada DEPOIS do primeiro
 * desenho: um retrato tirado cedo demais mostra o interruptor desligado para
 * todo mundo. Com a assimetria, esse retrato cedo grava "não", e a hidratação
 * corrige para "sim" um instante depois. O contrário deixaria alguém com aviso
 * agendado sem quem o cancelasse.
 */
export function semearMarcaDeAgendamento(avisosLigados: boolean): void {
  try {
    if (avisosLigados) {
      window.localStorage.setItem(JA_AGENDOU, "1");
      return;
    }
    if (window.localStorage.getItem(JA_AGENDOU) === null) {
      window.localStorage.setItem(JA_AGENDOU, "0");
    }
  } catch {
    /* sem armazenamento: segue no comportamento antigo */
  }
}

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

/** O sistema negou DE VEZ? (Diferente de "ainda não perguntou".) */
export async function bloqueadaPeloSistema(): Promise<boolean> {
  const c = await carregar();
  if (!c) return false;
  try {
    return (await c.plugin.checkPermissions()).display === "denied";
  } catch {
    return false;
  }
}

/**
 * Abre a tela de avisos do app nos ajustes do APARELHO. Melhor esforço:
 * quando o sistema já negou a permissão, a folha de pedido não aparece nunca
 * mais, e o único caminho que resta é a pessoa liberar nos ajustes. O
 * Capacitor repassa esquemas que não são http para o sistema abrir; se algum
 * aparelho não aceitar, fica o texto do Perfil explicando o caminho.
 */
export function abrirAjustesDeAvisos(): void {
  const p = nativePlatform();
  try {
    if (p === "ios") {
      window.open("app-settings:", "_blank");
    } else if (p === "android") {
      window.open(
        "intent:#Intent;action=android.settings.APP_NOTIFICATION_SETTINGS;S.android.provider.extra.APP_PACKAGE=mentorque.app;end",
        "_blank"
      );
    }
  } catch { /* sem ajuda do sistema: o texto do Perfil aponta o caminho */ }
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
export async function agendar(o: {
  id: number;
  titulo: string;
  corpo: string;
  quando: Date;
  /** Onde este aviso quer abrir o app quando a pessoa tocar nele. */
  rota?: RotaDeAviso;
}): Promise<boolean> {
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
          ...(o.rota ? { extra: { rota: o.rota } } : null),
        },
      ],
    });
    marcaQueAgendou();
    return true;
  } catch {
    return false;
  }
}

/**
 * Ouve o TOQUE num aviso local e anota para onde ele quer levar.
 *
 * Registrar uma vez só por sessão, na abertura do app. Não é preciso correr
 * para chegar antes do toque: o Capacitor retém estes dois eventos até alguém
 * assinar (`retainUntilConsumed`), justamente porque o caso normal é o app
 * estar fechado quando a pessoa toca. O porquê inteiro está em
 * lib/app/rotaPendente.ts.
 */
export async function ouvirToqueEmAviso(): Promise<void> {
  if (jaOuvindo) return;
  const c = await carregar();
  if (!c) return;
  // A trava é gravada DEPOIS de o plugin existir, e não antes: marcar cedo faria
  // uma primeira chamada que falhou por falta de plugin calar todas as
  // seguintes.
  if (jaOuvindo) return;
  jaOuvindo = true;
  try {
    // O ouvinte não é removido nunca, e é de propósito: ele vale enquanto o app
    // existir, e um toque pode chegar a qualquer momento com o app aberto.
    await c.plugin.addListener("localNotificationActionPerformed", (dado) => {
      anotaRota(dado?.notification?.extra?.rota);
    });
  } catch {
    jaOuvindo = false;
  }
}

export async function cancelar(id: number): Promise<void> {
  // Aparelho que nunca agendou nada não tem o que cancelar, e descobrir isso
  // pelo plugin custa uma travessia nativa por resposta de quiz. Ver a nota
  // em `jaAgendouAlgumaVez`.
  if (jaAgendouAlgumaVez() === false) return;
  const c = await carregar();
  if (!c) return;
  try {
    await c.plugin.cancel({ notifications: [{ id }] });
  } catch {
    /* nada agendado com esse id: o plugin ignora */
  }
}
