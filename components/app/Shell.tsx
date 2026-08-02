"use client";

import { useLayoutEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { NavProvider, useNav, type View } from "@/lib/app/nav";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { Icon, useContent } from "./ui";
import { Logo } from "@/components/ui/Logo";
import { HomeScreen } from "./screens/Home";
import { SearchScreen } from "./screens/Search";
import { CarsScreen, AddCarScreen } from "./screens/Cars";
import { CarHub } from "./screens/CarHub";
import { SymptomsScreen, SymptomDetail, SystemProblemsScreen, ChecklistScreen } from "./screens/Symptoms";
import { HealthScreen, HealthQuizScreen, SystemDetail } from "./screens/Health";
import { HistoryScreen, AddServiceScreen, ServiceDetail } from "./screens/History";
import { RevisionsScreen } from "./screens/Revisions";
import { LearnScreen, StudyTrackScreen, ForYourCarScreen, ContentScreen, BielaChatScreen } from "./screens/Learn";
import { EquipmentScreen } from "./screens/Equipment";
import { CarSettingsScreen } from "./screens/CarSettings";
import { ProfileScreen, SubscribeScreen, CheckoutScreen } from "./screens/Profile";
import { GamificationScreen, AchievementsScreen } from "./screens/Gamification";
import { AuthScreen } from "./screens/Auth";

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
  return (
    <div className="h-screen w-full overflow-hidden bg-graphite-900 text-cream antialiased supports-[height:100dvh]:h-dvh">
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col overflow-hidden bg-graphite shadow-card">{children}</div>
    </div>
  );
}

// Maps a view to a screen. Deep car screens live under the "cars" tab.
function Router() {
  const { view, back, canBack, depth, lastAction } = useNav();

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

  // Swipe left→right = go back to the previous screen (last one the user was on).
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && canBack) back();
  };

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
      case "health": return <HealthScreen />;
      case "healthQuiz": return <HealthQuizScreen />;
      case "system": return <SystemDetail system={view.system} />;
      case "history": return <HistoryScreen />;
      case "addService": return <AddServiceScreen preset={view.preset} editId={view.editId} />;
      case "service": return <ServiceDetail id={view.id} />;
      case "revisions": return <RevisionsScreen />;
      case "learn": return <LearnScreen />;
      case "equipment": return <EquipmentScreen />;
      case "studyTrack": return <StudyTrackScreen trackId={view.trackId} />;
      case "forYourCar": return <ForYourCarScreen />;
      case "biela": return <BielaChatScreen seed={view.seed} />;
      case "content": return <ContentScreen id={view.id} />;
      case "carSettings": return <CarSettingsScreen />;
      case "profile": return <ProfileScreen />;
      case "gamification": return <GamificationScreen />;
      case "achievements": return <AchievementsScreen />;
      case "auth": return <AuthScreen />;
      case "subscribe": return <SubscribeScreen ctx={view.ctx} />;
      case "checkout": return <CheckoutScreen plan={view.plan} />;
    }
  })();

  const showTopBar = TAB_ROOTS.has(view.name);

  return (
    <>
      {showTopBar && <TopBar />}
      <main
        ref={mainRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-28 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {screen}
      </main>
      <BottomNav />
    </>
  );
}

// Cabeçalho fixo das abas principais: marca à esquerda, foto de perfil à direita.
const TAB_ROOTS = new Set<View["name"]>(["home", "cars", "symptoms", "history", "learn"]);

function TopBar() {
  const { root } = useNav();
  const { s } = usePrototype();
  const { user } = useAuth();
  // Mesma regra do Perfil: avatar enviado > foto do login (Google) > inicial.
  const googlePic = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const avatarSrc = s.avatar ?? googlePic ?? null;
  const initial = (s.name || user?.email || "").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="flex items-center justify-between px-5 pb-1 pt-[max(env(safe-area-inset-top),14px)]">
      <button onClick={() => root({ name: "home" })} className="flex items-center" aria-label="Início">
        <Logo variant="lockup-dark" className="h-7 w-auto" priority />
      </button>
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
    </header>
  );
}

type Tab = "home" | "cars" | "problems" | "history" | "studies" | "profile";
const TAB_OF: Record<View["name"], Tab> = {
  home: "home", search: "home",
  cars: "cars", addCar: "cars", car: "cars", health: "cars", healthQuiz: "cars", system: "cars", revisions: "cars", carSettings: "cars",
  symptoms: "problems", symptom: "problems", systemProblems: "problems", equipment: "problems", checklist: "problems",
  history: "history", addService: "history", service: "history",
  learn: "studies", studyTrack: "studies", forYourCar: "studies", biela: "studies", content: "studies",
  profile: "profile", gamification: "profile", achievements: "profile", auth: "profile", subscribe: "profile", checkout: "profile",
};

function BottomNav() {
  const c = useContent();
  const { view, root } = useNav();
  const active = TAB_OF[view.name];

  const items: { tab: Tab; icon: string; label: string; go: () => void }[] = [
    { tab: "home", icon: "home", label: c.nav.home, go: () => root({ name: "home" }) },
    { tab: "cars", icon: "car", label: c.nav.carsShort, go: () => root({ name: "cars" }) },
    { tab: "problems", icon: "diagnose", label: c.nav.problems, go: () => root({ name: "symptoms" }) },
    { tab: "history", icon: "clock", label: c.nav.history, go: () => root({ name: "history" }) },
    { tab: "studies", icon: "book", label: c.nav.studies, go: () => root({ name: "learn" }) },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t border-white/10 bg-graphite-900/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur">
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
