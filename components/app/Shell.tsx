"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { NavProvider, useNav, type View } from "@/lib/app/nav";
import { Icon, useContent } from "./ui";
import { CarsScreen, AddCarScreen } from "./screens/Cars";
import { CarHub } from "./screens/CarHub";
import { SymptomsScreen, SymptomDetail, SystemProblemsScreen, ChecklistScreen } from "./screens/Symptoms";
import { HealthScreen, HealthQuizScreen, SystemDetail } from "./screens/Health";
import { HistoryScreen, AddServiceScreen, ServiceDetail } from "./screens/History";
import { RevisionsScreen } from "./screens/Revisions";
import { LearnScreen, StudyTrackScreen, ForYourCarScreen, ContentScreen, BielaChatScreen } from "./screens/Learn";
import { EquipmentScreen } from "./screens/Equipment";
import { CarSettingsScreen } from "./screens/CarSettings";
import { ProfileScreen, SubscribeScreen } from "./screens/Profile";
import { GamificationScreen, AchievementsScreen } from "./screens/Gamification";
import { AuthScreen } from "./screens/Auth";

export function Shell() {
  return (
    <NavProvider initial={{ name: "cars" }}>
      <PhoneShell>
        <Router />
      </PhoneShell>
    </NavProvider>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-graphite-900 text-cream antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-graphite shadow-card">{children}</div>
    </div>
  );
}

// Maps a view to a screen. Deep car screens live under the "cars" tab.
function Router() {
  const { view, back, canBack } = useNav();

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
    }
  })();

  return (
    <>
      <main
        className="flex-1 overflow-y-auto px-5 pb-28"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {screen}
      </main>
      <BottomNav />
    </>
  );
}

type Tab = "cars" | "problems" | "history" | "studies" | "profile";
const TAB_OF: Record<View["name"], Tab> = {
  cars: "cars", addCar: "cars", car: "cars", health: "cars", healthQuiz: "cars", system: "cars", revisions: "cars", carSettings: "cars",
  symptoms: "problems", symptom: "problems", systemProblems: "problems", equipment: "problems", checklist: "problems",
  history: "history", addService: "history", service: "history",
  learn: "studies", studyTrack: "studies", forYourCar: "studies", biela: "studies", content: "studies",
  profile: "profile", gamification: "profile", achievements: "profile", auth: "profile", subscribe: "profile",
};

function BottomNav() {
  const c = useContent();
  const { view, root } = useNav();
  const active = TAB_OF[view.name];

  const items: { tab: Tab; icon: string; label: string; go: () => void }[] = [
    { tab: "cars", icon: "car", label: c.nav.cars, go: () => root({ name: "cars" }) },
    { tab: "problems", icon: "diagnose", label: c.nav.problems, go: () => root({ name: "symptoms" }) },
    { tab: "history", icon: "clock", label: c.nav.history, go: () => root({ name: "history" }) },
    { tab: "studies", icon: "book", label: c.nav.studies, go: () => root({ name: "learn" }) },
    { tab: "profile", icon: "user", label: c.nav.profile, go: () => root({ name: "profile" }) },
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
