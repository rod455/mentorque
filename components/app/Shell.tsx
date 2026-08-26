"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavProvider, useNav, type View } from "@/lib/app/nav";
import { useSwipe } from "@/lib/app/swipe";
import { usePrototype } from "@/lib/app/store";
import { trackContent } from "@/lib/app/track";
import { useAuth } from "@/lib/app/auth";
import { adsEnabled } from "./AdGate";
import { ensureConsent, nativeAdMob } from "@/lib/app/admob";
import { Icon, useContent } from "./ui";
import { FeedbackSheet } from "./FeedbackSheet";
import { ImportarGaragem } from "./ImportarGaragem";
import { ConfirmandoPagamento } from "./ConfirmandoPagamento";
import { SinoDeAvisos } from "./Avisos";
import { Logo } from "@/components/ui/Logo";
import { HomeScreen } from "./screens/Home";
import { SearchScreen } from "./screens/Search";
import { CarsScreen, AddCarScreen } from "./screens/Cars";
import { CarHub } from "./screens/CarHub";
import { SymptomsScreen, SymptomDetail, SystemProblemsScreen, ChecklistScreen } from "./screens/Symptoms";
import { HealthScreen, HealthQuizScreen, SystemDetail } from "./screens/Health";
import { HistoryScreen, AddServiceScreen, ServiceDetail } from "./screens/History";
import { RevisionsScreen } from "./screens/Revisions";
import { LearnScreen, StudyTrackScreen, CourseScreen, ForYourCarScreen, SavedLessonsScreen, ContentScreen, BielaChatScreen } from "./screens/Learn";
import { EquipmentScreen } from "./screens/Equipment";
import { EquipmentHowToScreen } from "./screens/EquipmentHowTo";
import { Obd2Screen, Obd2ScanScreen } from "./screens/Obd2";
import { FuelCompareScreen } from "./screens/FuelCompare";
import { CarSettingsScreen } from "./screens/CarSettings";
import { ProfileScreen, SubscribeScreen, CheckoutScreen } from "./screens/Profile";
import { QuizScreen } from "./screens/Quiz";
import { GamificationScreen, AchievementsScreen } from "./screens/Gamification";
import { AuthScreen } from "./screens/Auth";
import { funil } from "@/lib/app/funil";
import { sincronizarLembrete } from "@/lib/app/lembreteAssinatura";
import { sincronizarLembreteQuiz } from "@/lib/app/lembreteQuiz";
import { vigiarErros } from "@/lib/app/erros";
import BielaMascote from "@/components/BielaMascote";

export function Shell() {
  return (
    <NavProvider initial={{ name: "home" }}>
      <PhoneShell>
        <Router />
      </PhoneShell>
    </NavProvider>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  // Altura travada (h-dvh) para o <main> ser o scroller real — assim a
  // navegação controla o scroll (topo ao avançar, restaura ao voltar).
  //
  // O recuo do topo fica na coluna inteira (e não em cada cabeçalho): no
  // Android edge-to-edge a status bar cobre o y=0, e as telas profundas usam
  // o `AppHeader` em vez da `TopBar`.
  return (
    <div className="app-backdrop h-screen w-full overflow-hidden text-cream antialiased supports-[height:100dvh]:h-dvh">
      <div className="app-col flex h-full flex-col overflow-hidden bg-graphite pt-[env(safe-area-inset-top)] shadow-card">{children}</div>
    </div>
  );
}

// Maps a view to a screen. Deep car screens live under the "cars" tab.
function Router() {
  const { view, back, canBack, depth, lastAction, go } = useNav();
  const c = useContent();
  const { s, subscribed, subscriptionEndsAt, subscriptionCanceling } = usePrototype();

  // Vindo do onboarding ("Monte seu teste"): abre o paywall com o plano
  // escolhido — mas só depois do login.
  //
  // Assinar deslogado amarraria a compra a um usuário anônimo do RevenueCat: o
  // motorista pagaria e o Premium não apareceria na conta dele. Então, sem
  // sessão, o app manda para a tela de entrar e guarda o plano; assim que o
  // login acontece, o paywall abre sozinho no plano que ele já tinha escolhido.
  const { user } = useAuth();

  // Funil: uma abertura por sessão; e "cadastro" na primeira sessão logada de
  // uma conta RECÉM-criada (created_at nos últimos 15 min — cobre e-mail e
  // login social, sem contar logins de conta antiga). O marcador local garante
  // que cada aparelho relata o cadastro uma vez só.
  useEffect(() => { funil("abriu_app", { umaVez: true }); vigiarErros(); }, []);
  useEffect(() => {
    if (!user) return;
    try { if (window.localStorage.getItem("mq-cadastro-ev")) return; } catch { /* segue */ }
    const criado = Date.parse((user as { created_at?: string }).created_at ?? "");
    if (Number.isFinite(criado) && Date.now() - criado < 15 * 60 * 1000) {
      funil("cadastro", { userId: user.id });
    }
    try { window.localStorage.setItem("mq-cadastro-ev", "1"); } catch { /* ignore */ }
  }, [user]);

  const [planoPendente, setPlanoPendente] = useState<"annual" | "monthly" | null>(null);
  useEffect(() => {
    try {
      const plan = window.sessionStorage.getItem("mentorque-onboarding-plan");
      if (plan === "annual" || plan === "monthly") {
        window.sessionStorage.removeItem("mentorque-onboarding-plan");
        setPlanoPendente(plan);
      }
    } catch { /* ignore */ }
  }, []);
  // Depende de `view` de propósito: a tela de login chama `back()` sozinha ao
  // entrar, e sem esperar a pilha assentar o paywall seria empurrado antes —
  // aí o `back()` atrasado derrubaria justamente ele.
  const pediuLogin = useRef(false);
  useEffect(() => {
    if (!planoPendente) return;
    if (!user) {
      if (view.name === "auth") return;                             // está logando
      if (pediuLogin.current) { setPlanoPendente(null); return; }    // desistiu do login
      pediuLogin.current = true;
      go({ name: "auth" });
      return;
    }
    if (view.name === "auth") return;                               // espera sair do login
    setPlanoPendente(null);
    go({ name: "subscribe", ctx: `onb-${planoPendente}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planoPendente, user, view]);

  // Scroll responsivo: avançar/abrir conteúdo ou trocar de aba → topo;
  // voltar → restaura a posição de onde o usuário estava (por nível da pilha).
  const mainRef = useRef<HTMLElement>(null);
  const scrollPos = useRef<Record<string, number>>({});
  const posKey = `${depth}:${view.name}`;
  useLayoutEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.scrollTop = lastAction === "back" ? scrollPos.current[posKey] ?? 0 : 0;
  }, [view, depth, lastAction, posKey]);
  const onScroll = () => {
    const el = mainRef.current;
    if (el) scrollPos.current[posKey] = el.scrollTop;
  };

  // Consentimento de anúncios (UMP) na abertura do app, não na hora do
  // primeiro anúncio: é o que o Google pede, e é o que popula o "Preferências
  // de anúncios" no Perfil.
  useEffect(() => {
    if (!adsEnabled()) return;
    const plugin = nativeAdMob();
    if (plugin) void ensureConsent(plugin);
  }, []);

  // Lembrete de fim do teste grátis, em dia com o estado da assinatura.
  //
  // Roda a cada mudança de propósito: quem assina hoje precisa do aviso
  // agendado, quem cancela precisa dele desmarcado (não vai ser cobrado, então
  // não há o que avisar), e quem desliga a preferência precisa que ele suma.
  // Reagendar com o mesmo id substitui o anterior, então isto nunca empilha.
  //
  // Não pede permissão aqui: pedir fora de um toque da pessoa é o caminho mais
  // curto para o "não" definitivo do sistema. Quem liga o interruptor no Perfil
  // é que dispara o pedido.
  useEffect(() => {
    void sincronizarLembrete({
      querLembrete: s.notifications,
      assinante: subscribed,
      fimDoPeriodo: subscriptionEndsAt,
      cancelando: subscriptionCanceling,
      textos: { titulo: c.profile.avisoTesteTitulo, corpo: c.profile.avisoTesteCorpo },
    });
  }, [s.notifications, subscribed, subscriptionEndsAt, subscriptionCanceling, c.profile.avisoTesteTitulo, c.profile.avisoTesteCorpo]);

  // Aviso do quiz de amanhã. Reagendado a cada mudança do estado do quiz (ou
  // seja, a cada resposta) e a cada abertura do app: é isso que faz o aviso
  // apontar sempre para o próximo dia ainda não respondido, em vez de cobrar
  // uma coisa já feita. Ver lib/app/lembreteQuiz.ts.
  useEffect(() => {
    void sincronizarLembreteQuiz({
      quer: s.notifications,
      quiz: s.quiz,
      textos: { titulo: c.quiz.avisoPushTitulo, corpo: c.quiz.avisoPushCorpo },
    });
  }, [s.notifications, s.quiz, c.quiz.avisoPushTitulo, c.quiz.avisoPushCorpo]);

  // Botão físico/gesto de voltar do Android (wrapper): volta na navegação do
  // app; na raiz, minimiza o app (sem fechar). Paywall passa pelo funil.
  useEffect(() => {
    type Handle = { remove: () => void };
    const AppPlugin = (window as unknown as {
      Capacitor?: { Plugins?: { App?: { addListener?: (ev: string, cb: () => void) => Handle | Promise<Handle>; minimizeApp?: () => void } } };
    }).Capacitor?.Plugins?.App;
    if (!AppPlugin?.addListener) return;
    const sub = AppPlugin.addListener("backButton", () => {
      if (view.name === "subscribe" && !paywallExitAllowed(null)) return;
      if (canBack) back();
      else AppPlugin.minimizeApp?.();
    });
    return () => {
      if (sub && "remove" in sub) (sub as Handle).remove();
      else (sub as Promise<Handle>)?.then?.((h) => h.remove());
    };
  }, [view, canBack, back]);

  // Métrica de engajamento: registra a abertura de cada conteúdo/aula.
  // O Kit do motorista conta como conteúdo ("equipment") — assim ele entra no
  // mesmo ranking de engajamento das aulas e pode mudar de posição no futuro.
  useEffect(() => {
    if (view.name === "content") trackContent(view.id, "open");
    else if (view.name === "obd2") trackContent("read-obd2", "open");
    else if (view.name === "equipment") trackContent("equipment", "open");
    else if (view.name === "equipmentHowTo") trackContent(`equipment-${view.itemId}`, "open");
  }, [view]);

  // Arrastar da esquerda para a direita volta para a tela anterior.
  const swipe = useSwipe({
    onRight: () => {
      if (!canBack) return;
      // Saindo do paywall por gesto: o funil de ofertas pode segurar a saída.
      if (view.name === "subscribe" && !paywallExitAllowed(null)) return;
      back();
    },
  });

  const screen = (() => {
    switch (view.name) {
      case "home": return <HomeScreen />;
      case "search": return <SearchScreen />;
      case "cars": return <CarsScreen />;
      case "addCar": return <AddCarScreen editId={view.editId} />;
      case "car": return <CarHub />;
      case "symptoms": return <SymptomsScreen />;
      case "symptom": return <SymptomDetail id={view.id} />;
      case "systemProblems": return <SystemProblemsScreen system={view.system} />;
      case "checklist": return <ChecklistScreen symptomId={view.symptomId} />;
      case "obd2": return <Obd2Screen />;
      case "health": return <HealthScreen />;
      case "healthQuiz": return <HealthQuizScreen />;
      case "system": return <SystemDetail system={view.system} />;
      case "history": return <HistoryScreen />;
      case "addService": return <AddServiceScreen preset={view.preset} editId={view.editId} />;
      case "service": return <ServiceDetail id={view.id} />;
      case "revisions": return <RevisionsScreen />;
      case "learn": return <LearnScreen />;
      case "equipment": return <EquipmentScreen />;
      case "equipmentHowTo": return <EquipmentHowToScreen itemId={view.itemId} />;
      case "studyTrack": return <StudyTrackScreen trackId={view.trackId} />;
      case "course": return <CourseScreen id={view.id} />;
      case "forYourCar": return <ForYourCarScreen />;
      case "savedLessons": return <SavedLessonsScreen />;
      case "biela": return <BielaChatScreen seed={view.seed} />;
      // "Aulas"-ferramenta abrem a página real (OBD2, Etanol × Gasolina).
      case "content":
        if (view.id === "read-obd2") return <Obd2Screen />;
        if (view.id === "obd2-scan") return <Obd2ScanScreen />;
        if (view.id === "fuel-compare") return <FuelCompareScreen />;
        return <ContentScreen id={view.id} />;
      case "carSettings": return <CarSettingsScreen />;
      case "profile": return <ProfileScreen />;
      case "quiz": return <QuizScreen />;
      case "gamification": return <GamificationScreen />;
      case "achievements": return <AchievementsScreen initialTab={view.tab} />;
      case "auth": return <AuthScreen />;
      case "subscribe": return <SubscribeScreen ctx={view.ctx} />;
      case "checkout": return <CheckoutScreen plan={view.plan} offer={view.offer} />;
    }
  })();

  const showTopBar = TAB_ROOTS.has(view.name);
  // Folga do rodapé.
  //
  // As telas que rolam ganham 7rem: a barra de abas é fixa e cobriria o fim do
  // conteúdo, então sobra respiro no fim da rolagem. Já as telas que gerenciam
  // a PRÓPRIA altura (o chat, com o campo de digitação colado embaixo) herdavam
  // essa mesma folga e ela virava um buraco preto de uns 90px entre o campo e a
  // barra — o safe-area ainda entrava duas vezes, aqui e na própria barra.
  //
  // Para elas a folga é exatamente a altura da barra: 3.75rem do conteúdo
  // (ícone + rótulo + py-2, medidos em 60px) mais o mesmo `max(safe, 8px)` que
  // ela usa de padding. Somam os 68px que a barra ocupa de fato.
  const folgaRodape = ALTURA_PROPRIA.has(view.name)
    ? "pb-[calc(3.75rem+max(env(safe-area-inset-bottom),8px))]"
    : "pb-[calc(7rem+env(safe-area-inset-bottom))]";

  return (
    <>
      <WelcomeBack currentView={view.name} />
      {/* Montada uma vez, acordada por evento. Ver lib/app/feedbackPrompt.ts. */}
      <FeedbackSheet />
      {/* Só aparece ao entrar numa conta que já tem garagem com carros de
          convidado no aparelho. Fica por cima de tudo: a decisão vem antes de
          a pessoa mexer numa garagem que ainda pode mudar. */}
      <ImportarGaragem />
      {/* Cobre a tela enquanto confirma a compra. Fica ACIMA de tudo de
          propósito: é o que impede alguém que acabou de pagar de tocar num
          recurso Premium, bater no paywall e começar um segundo checkout. */}
      <ConfirmandoPagamento />
      {showTopBar && <TopBar />}
      <main
        ref={mainRef}
        onScroll={onScroll}
        className={`flex-1 overflow-y-auto overflow-x-hidden px-5 ${folgaRodape} [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        {...swipe}
      >
        {screen}
      </main>
      <BottomNav />
    </>
  );
}

const WELCOME_BACK_KEY = "mentorque-welcome-back";

// Tela de retorno (formato Bloom): quando o app volta do segundo plano e o
// usuário ainda não cadastrou o primeiro carro, convida a cadastrar.
function WelcomeBack({ currentView }: { currentView: View["name"] }) {
  const c = useContent();
  const w = c.welcomeBack;
  const { s } = usePrototype();
  const { go } = useNav();
  const [show, setShow] = useState(false);
  const hasCar = s.vehicles.length > 0;

  // Uma vez por instalação. Antes disparava a cada retorno do segundo plano —
  // quem só quisesse olhar o app sem cadastrar carro levava uma tela cheia de
  // convite toda vez que voltava, inclusive entre um print e outro.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      try {
        if (window.localStorage.getItem(WELCOME_BACK_KEY)) return;
        window.localStorage.setItem(WELCOME_BACK_KEY, "1");
      } catch {
        /* modo privado: mostra uma vez por sessão */
      }
      setShow(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Só para quem ainda não tem carro; não interrompe o próprio cadastro.
  if (!show || hasCar || currentView === "addCar" || currentView === "auth") return null;

  return (
    // Responsivo: conteúdo centralizado que cabe numa tela; em aparelhos muito
    // pequenos, rola em vez de cortar. Padding inferior respeita a barra do
    // navegador (safe area).
    <div className="fixed inset-0 z-50 app-col overflow-y-auto bg-graphite [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-h-full flex-col items-center justify-center px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)] text-center">
        <BielaMascote pose="acenando" size={116} />
        <h1 className="mt-3 max-w-xs font-serif text-xl font-bold leading-snug text-cream">{w.title}</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-cream/55">{w.sub}</p>

        <div className="mt-4 w-full max-w-sm space-y-2">
          {w.bullets.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-2.5 text-left ring-1 ring-white/[0.06]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
                <Icon name={b.icon} className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm text-cream/85">{b.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setShow(false); go({ name: "addCar" }); }}
          className="mt-4 w-full max-w-sm rounded-full bg-amber py-3 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
        >
          🚗 {w.cta}
        </button>
        <button onClick={() => setShow(false)} className="mt-2.5 rounded-full bg-graphite-800 px-4 py-2 text-xs text-cream/60 ring-1 ring-white/[0.06]">
          → {w.later}
        </button>
      </div>
    </div>
  );
}

// Saída do paywall: dispara o evento que o SubscribeScreen escuta. Se uma
// oferta for exibida, o evento é cancelado e a navegação fica segurada.
function paywallExitAllowed(target: View | null): boolean {
  if (typeof window === "undefined") return true;
  const ev = new CustomEvent<View | null>("mq-paywall-exit", { detail: target, cancelable: true });
  return window.dispatchEvent(ev); // false = preventDefault (oferta na tela)
}

// Cabeçalho fixo das abas principais: marca à esquerda, foto de perfil à direita.
const TAB_ROOTS = new Set<View["name"]>(["home", "cars", "symptoms", "history", "learn"]);

// Telas que ocupam a altura toda por conta própria, em vez de rolar. Ver
// `folgaRodape` acima.
const ALTURA_PROPRIA = new Set<View["name"]>(["biela"]);

function TopBar() {
  const { root } = useNav();
  const { s } = usePrototype();
  const { user } = useAuth();
  // Mesma regra do Perfil: avatar enviado > foto do login (Google) > inicial.
  const googlePic = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const avatarSrc = s.avatar ?? googlePic ?? null;
  const initial = (s.name || user?.email || "").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="flex items-center justify-between px-5 pb-1 pt-3.5">
      <button onClick={() => root({ name: "home" })} className="flex items-center" aria-label="Início">
        <Logo variant="lockup-dark" className="h-7 w-auto" priority />
      </button>
      <div className="flex items-center gap-2">
        <SinoDeAvisos />
        <button
          onClick={() => root({ name: "profile" })}
          aria-label="Perfil"
          className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-teal/25 font-display text-sm font-semibold text-teal ring-1 ring-white/10"
        >
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </button>
      </div>
    </header>
  );
}

type Tab = "home" | "cars" | "problems" | "history" | "studies" | "profile";
const TAB_OF: Record<View["name"], Tab> = {
  home: "home", search: "home",
  cars: "cars", addCar: "cars", car: "cars", health: "cars", healthQuiz: "cars", system: "cars", revisions: "cars", carSettings: "cars",
  symptoms: "problems", symptom: "problems", systemProblems: "problems", equipment: "problems", equipmentHowTo: "problems", checklist: "problems", obd2: "problems",
  history: "history", addService: "history", service: "history",
  learn: "studies", studyTrack: "studies", course: "studies", forYourCar: "studies", savedLessons: "studies", biela: "studies", content: "studies",
  quiz: "studies",
  profile: "profile", gamification: "profile", achievements: "profile", auth: "profile", subscribe: "profile", checkout: "profile",
};

function BottomNav() {
  const c = useContent();
  const { view, root } = useNav();
  const active = TAB_OF[view.name];

  // Saindo do paywall por uma aba, o funil de ofertas pode segurar a saída;
  // ao dispensar as ofertas, a navegação pendente é concluída pela própria tela.
  const tryGo = (v: View) => {
    if (view.name === "subscribe" && !paywallExitAllowed(v)) return;
    root(v);
  };

  const items: { tab: Tab; icon: string; label: string; go: () => void }[] = [
    { tab: "home", icon: "home", label: c.nav.home, go: () => tryGo({ name: "home" }) },
    { tab: "cars", icon: "car", label: c.nav.carsShort, go: () => tryGo({ name: "cars" }) },
    { tab: "problems", icon: "diagnose", label: c.nav.problems, go: () => tryGo({ name: "symptoms" }) },
    { tab: "history", icon: "clock", label: c.nav.history, go: () => tryGo({ name: "history" }) },
    { tab: "studies", icon: "book", label: c.nav.studies, go: () => tryGo({ name: "learn" }) },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 app-col border-t border-white/10 bg-graphite-900/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur">
      <div className="flex items-end">
        {items.map((it) => {
          const on = active === it.tab;
          return (
            <button key={it.tab} onClick={it.go} className="flex flex-1 flex-col items-center gap-1 py-2">
              <Icon name={it.icon} className={`h-6 w-6 ${on ? "text-amber" : "text-cream/55"}`} />
              <span className={`text-[10px] ${on ? "font-medium text-amber" : "text-cream/55"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
