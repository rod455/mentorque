"use client";

import { useEffect, useRef, useState } from "react";
import { useNav, type View } from "./nav";
import { useAuth } from "./auth";
import { activeVehicle, servicesFor, usePrototype } from "./store";
import { carName } from "./content";
import { sincronizarLembretesDeRevisao } from "./lembreteRevisao";
import { funil } from "./funil";
import { relatarFechamentoAnterior, vigiarErros } from "./erros";
import { passo, vigiarPausa } from "./ultimoPasso";
import { trackContent } from "./track";
import { ensureConsent, nativeAdMob } from "./admob";
import { adsEnabled } from "@/components/app/AdGate";
import { sincronizarLembrete } from "./lembreteAssinatura";
import { sincronizarLembreteQuiz } from "./lembreteQuiz";
import { semearMarcaDeAgendamento } from "./notificacoes";
import { sincronizarPush } from "./push";
import { iniciarAtribuicao } from "./atribuicao";
import { saidaDoPaywallPermitida } from "./saidaDoPaywall";
import type { Content } from "./content";

// Tudo o que acontece "de fundo" enquanto o app está aberto.
//
// MORAVA DENTRO DO ROTEADOR, e essa era a confusão: o `Router` tinha 258
// linhas, das quais umas 130 não decidiam tela nenhuma — mediam funil,
// agendavam lembrete, pediam consentimento de anúncio, ouviam o botão de
// voltar do Android. Quem ia mexer no roteamento tinha de atravessar tudo
// isso, e quem ia mexer num lembrete tinha de procurar num arquivo chamado
// "Shell".
//
// Cada gancho aqui é uma preocupação com nome. Nenhum devolve nada: são
// efeitos, e o valor deles é o que acontece, não o que retorna.

/**
 * Funil: uma abertura por sessão, e "cadastro" na primeira vez que uma conta
 * NOVA abre o app.
 *
 * POR QUE A JANELA É DE 7 DIAS, e não os 15 minutos de antes: a janela antiga
 * presumia que criar conta e abrir o app são o mesmo instante, e não são.
 * Confirmação de e-mail, a pessoa fechando o app no meio, ou simplesmente
 * voltando à noite já estouravam o prazo. O resultado ficou medido: 9 contas
 * criadas em agosto e ZERO eventos de cadastro. O cliente que assinou de
 * verdade criou a conta às 21:18 e abriu o app às 23:53 — nunca teve chance de
 * ser contado.
 *
 * E o marcador local era gravado MESMO quando o evento não saía, então um
 * aparelho que perdesse a janela uma vez ficava mudo para sempre. Agora só é
 * gravado quando o evento realmente foi mandado.
 *
 * Contagem dobrada não é mais problema do cliente: o índice
 * `funil_eventos_cadastro_unico` garante um cadastro por conta, no banco. É
 * isso que permite a janela ser generosa sem medo.
 */
export function useFunilDeAbertura() {
  const { user } = useAuth();

  useEffect(() => {
    funil("abriu_app", { umaVez: true });
    vigiarErros();
    // A ORDEM AQUI É REGRA, não gosto: primeiro ler a migalha da sessão
    // anterior, só depois deixar esta sessão escrever a dela. Invertido, a
    // abertura apagaria o rastro do fechamento que ela veio justamente contar.
    relatarFechamentoAnterior();
    vigiarPausa();
    passo("abriu o app");
    // Atribuição de instalação (AppsFlyer): só no app das lojas, silenciosa,
    // e aqui porque abrir o app É o evento que ela existe para medir.
    void iniciarAtribuicao();
  }, []);

  useEffect(() => {
    if (!user) return;
    try { if (window.localStorage.getItem("mq-cadastro-ev")) return; } catch { /* segue */ }
    const criado = Date.parse((user as { created_at?: string }).created_at ?? "");
    const DIAS = 7 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(criado) || Date.now() - criado > DIAS) return;
    funil("cadastro", { userId: user.id });
    try { window.localStorage.setItem("mq-cadastro-ev", "1"); } catch { /* ignore */ }
  }, [user]);
}

/**
 * Vindo do onboarding ("Monte seu teste") ou do LINK DE VENDA: leva à compra
 * do plano escolhido, MAS só depois do login.
 *
 * Assinar deslogado amarraria a compra a um usuário anônimo do RevenueCat: o
 * motorista pagaria e o Premium não apareceria na conta dele. Então, sem
 * sessão, o app manda para a tela de entrar e guarda o plano; assim que o
 * login acontece, o destino abre sozinho no plano que ele já tinha escolhido.
 *
 * Os dois caminhos, e por que o destino difere:
 *
 *   onboarding             → paywall com o plano marcado. A pessoa ainda está
 *                            conhecendo; o paywall convence.
 *   /app?assinar=anual     → DIRETO no pagamento. É o link que o dono manda
 *   /app?assinar=mensal      para quem já foi convencido na conversa; parar
 *                            no paywall seria vender de novo para quem veio
 *                            comprar. `&cupom=PREMIUM30` chega ao checkout
 *                            com o desconto já aplicado (o servidor valida).
 */
export function usePlanoPendente() {
  const { user } = useAuth();
  const { view, go } = useNav();
  const { s } = usePrototype();
  const [plano, setPlano] = useState<"annual" | "monthly" | null>(null);
  // Só o link de venda vai direto ao pagamento; o onboarding para no paywall.
  const direto = useRef(false);
  const cupom = useRef<string | undefined>(undefined);

  useEffect(() => {
    try {
      // O link de venda tem prioridade: quem clicou nele veio comprar agora.
      // Os parâmetros saem da URL na hora (recarregar não pode reabrir
      // compra), preservando o resto da query, que o funil lê para os UTMs.
      const url = new URL(window.location.href);
      const q = url.searchParams.get("assinar");
      if (q === "anual" || q === "mensal" || q === "annual" || q === "monthly") {
        cupom.current = url.searchParams.get("cupom")?.trim().toUpperCase() || undefined;
        url.searchParams.delete("assinar");
        url.searchParams.delete("cupom");
        window.history.replaceState(null, "", url);
        direto.current = true;
        setPlano(q === "anual" || q === "annual" ? "annual" : "monthly");
        return;
      }
      const p = window.sessionStorage.getItem("mentorque-onboarding-plan");
      if (p === "annual" || p === "monthly") {
        window.sessionStorage.removeItem("mentorque-onboarding-plan");
        setPlano(p);
      }
    } catch { /* ignore */ }
  }, []);

  // Depende de `view` de propósito: a tela de login chama `back()` sozinha ao
  // entrar, e sem esperar a pilha assentar o paywall seria empurrado antes —
  // aí o `back()` atrasado derrubaria justamente ele.
  const pediuLogin = useRef(false);
  useEffect(() => {
    if (!plano) return;
    if (!user) {
      if (view.name === "auth") return;                          // está logando
      if (pediuLogin.current) { setPlano(null); return; }         // desistiu do login
      pediuLogin.current = true;
      go({ name: "auth" });
      return;
    }
    if (view.name === "auth") return;                            // espera sair do login
    setPlano(null);
    // Quem já é Premium não tem o que comprar: o link vira uma abertura
    // normal do app em vez de um segundo checkout da mesma assinatura.
    if (direto.current && s.premium) return;
    go(direto.current ? { name: "checkout", plan: plano, cupom: cupom.current } : { name: "subscribe", ctx: `onb-${plano}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plano, user, view]);
}

/**
 * Consentimento de anúncios (UMP) na abertura do app, e não na hora do
 * primeiro anúncio: é o que o Google pede, e é o que popula o "Preferências de
 * anúncios" no Perfil.
 */
export function useConsentimentoDeAnuncios() {
  useEffect(() => {
    if (!adsEnabled()) return;
    const plugin = nativeAdMob();
    if (plugin) void ensureConsent(plugin);
  }, []);
}

/**
 * Os dois lembretes locais, sempre em dia com o estado real.
 *
 * O do teste grátis roda a cada mudança de propósito: quem assina hoje precisa
 * do aviso agendado, quem cancela precisa dele desmarcado (não vai ser
 * cobrado, então não há o que avisar), e quem desliga a preferência precisa
 * que ele suma. Reagendar com o mesmo id substitui o anterior, então nunca
 * empilha.
 *
 * O do quiz é reagendado a cada resposta e a cada abertura: é isso que faz o
 * aviso apontar sempre para o próximo dia ainda não respondido, em vez de
 * cobrar uma coisa já feita.
 *
 * NENHUM DOS DOIS PEDE PERMISSÃO AQUI. Pedir fora de um toque da pessoa é o
 * caminho mais curto para o "não" definitivo do sistema. Quem liga o
 * interruptor no Perfil é que dispara o pedido.
 */
export function useLembretes(c: Content) {
  const { s, subscribed, subscriptionEndsAt, subscriptionCanceling } = usePrototype();
  const veiculo = activeVehicle(s);

  // Antes de qualquer sincronização: planta a marca de "este aparelho já
  // agendou aviso?". É ela que evita atravessar a ponte nativa para cancelar
  // o que nunca existiu. Ver semearMarcaDeAgendamento em notificacoes.ts.
  useEffect(() => {
    semearMarcaDeAgendamento(s.notifications);
  }, [s.notifications]);

  useEffect(() => {
    void sincronizarLembrete({
      querLembrete: s.notifications,
      assinante: subscribed,
      fimDoPeriodo: subscriptionEndsAt,
      cancelando: subscriptionCanceling,
      textos: { titulo: c.profile.avisoTesteTitulo, corpo: c.profile.avisoTesteCorpo },
    });
  }, [s.notifications, subscribed, subscriptionEndsAt, subscriptionCanceling, c.profile.avisoTesteTitulo, c.profile.avisoTesteCorpo]);

  useEffect(() => {
    void sincronizarLembreteQuiz({
      quer: s.notifications,
      quiz: s.quiz,
      textos: { titulo: c.quiz.avisoPushTitulo, corpo: c.quiz.avisoPushCorpo },
    });
  }, [s.notifications, s.quiz, c.quiz.avisoPushTitulo, c.quiz.avisoPushCorpo]);

  // O registro de push acompanha o MESMO interruptor dos lembretes: ligado e
  // com a permissão já concedida, o aparelho registra e o token vai para o
  // servidor; desligado, o servidor esquece o token. Não pede permissão nunca
  // (isso é do toque no Perfil) e degrada em silêncio enquanto o console não
  // está configurado. Ver lib/app/push.ts e docs/push.md.
  useEffect(() => {
    void sincronizarPush(s.notifications);
  }, [s.notifications]);

  // Os serviços que a pessoa pôs no calendário viram aviso no dia previsto.
  //
  // A DATA É NOSSA, não dela: ela pôs "troca de óleo" ali justamente porque
  // não sabe quando é. Reagendado a cada mudança do calendário, do histórico e
  // do km, porque qualquer um dos três move a data prevista — registrar a
  // troca de hoje empurra a próxima em doze meses, e o aviso tem que ir junto.
  useEffect(() => {
    void sincronizarLembretesDeRevisao({
      quer: s.notifications,
      veiculo,
      servicos: veiculo ? servicesFor(s, veiculo.id) : [],
      lembretes: s.reminders ?? [],
      textos: {
        titulo: c.revisions.planAvisoTitulo,
        corpo: c.revisions.planAvisoCorpo,
        nomes: c.revisions.ruleLabels,
        carro: veiculo ? carName(veiculo) : "",
      },
    });
    // servicesFor devolve um array novo a cada render: quem entra na lista é
    // s.services, a fonte dele.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.notifications, s.reminders, s.services, veiculo?.id, veiculo?.odometerKm, veiculo?.purchaseDate, c.revisions.planAvisoTitulo, c.revisions.planAvisoCorpo]);
}

/**
 * Botão físico e gesto de voltar do Android.
 *
 * Desfaz o último passo da pessoa, seja ele uma tela empilhada ou uma TROCA DE
 * ABA. Só quando não há mais passo nenhum o app minimiza (minimiza, não fecha:
 * fechar perderia o estado da tela, e é o que o Android faz de errado por
 * padrão em WebView).
 *
 * Antes ele minimizava em qualquer tela inicial, porque trocar de aba zera a
 * pilha: quem ia de Início para Estudos e apertava voltar era jogado para fora
 * do app. Quem guarda o rastro das abas é o roteador (lib/app/nav.tsx), e é de
 * lá que vem o `voltarNoAndroid`.
 *
 * No paywall passa pela porteira das ofertas.
 */
export function useBotaoVoltarDoAndroid() {
  const { view, voltarNoAndroid } = useNav();

  useEffect(() => {
    type Handle = { remove: () => void };
    const AppPlugin = (window as unknown as {
      Capacitor?: { Plugins?: { App?: { addListener?: (ev: string, cb: () => void) => Handle | Promise<Handle>; minimizeApp?: () => void } } };
    }).Capacitor?.Plugins?.App;
    if (!AppPlugin?.addListener) return;
    const sub = AppPlugin.addListener("backButton", () => {
      if (view.name === "subscribe" && !saidaDoPaywallPermitida(null)) return;
      if (!voltarNoAndroid()) AppPlugin.minimizeApp?.();
    });
    return () => {
      if (sub && "remove" in sub) (sub as Handle).remove();
      else (sub as Promise<Handle>)?.then?.((h) => h.remove());
    };
  }, [view, voltarNoAndroid]);
}

/**
 * Métrica de engajamento: registra a abertura de cada conteúdo.
 *
 * O Kit do motorista conta como conteúdo ("equipment") de propósito — assim
 * ele entra no mesmo ranking das aulas e pode mudar de posição no futuro.
 */
export function useMetricaDeConteudo(view: View) {
  useEffect(() => {
    if (view.name === "content") trackContent(view.id, "open");
    else if (view.name === "obd2") trackContent("read-obd2", "open");
    else if (view.name === "equipment") trackContent("equipment", "open");
    else if (view.name === "equipmentHowTo") trackContent(`equipment-${view.itemId}`, "open");
  }, [view]);
}
