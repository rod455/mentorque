"use client";

import { useLayoutEffect, useRef } from "react";
import { NavProvider, useNav, type View } from "@/lib/app/nav";
import { useSwipe } from "@/lib/app/swipe";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { saidaDoPaywallPermitida } from "@/lib/app/saidaDoPaywall";
import {
  useBotaoVoltarDoAndroid,
  useConsentimentoDeAnuncios,
  useFunilDeAbertura,
  useLembretes,
  useMetricaDeConteudo,
  usePlanoPendente,
} from "@/lib/app/aberturaDoApp";
import { Icon, useContent } from "./ui";
import { Logo } from "@/components/ui/Logo";
import { SinoDeAvisos } from "./Avisos";
import { Sobreposicoes } from "./Sobreposicoes";
import { telaDaView } from "./telas";

// A moldura do app: a coluna de celular, o roteador, as barras.
//
// O QUE SAIU DAQUI, e por quê. O `Router` tinha 258 linhas e só uma dúzia
// decidia tela; o resto era funil, lembrete, consentimento de anúncio e o
// botão de voltar do Android. Agora:
//
//   telas.tsx                  qual view desenha qual tela
//   Sobreposicoes.tsx          o que aparece por cima, e em que ordem
//   lib/app/aberturaDoApp.ts   os efeitos de fundo, um gancho por assunto
//   lib/app/saidaDoPaywall.ts  a porteira das ofertas de retenção
//
// O que sobrou é a moldura de verdade: montar, rolar, e desenhar as barras.

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

function Router() {
  const { view, back, canBack, depth, lastAction } = useNav();
  const c = useContent();

  // Os efeitos de fundo. Cada um é uma preocupação com nome própria; o que
  // eles fazem está documentado em lib/app/aberturaDoApp.ts.
  useFunilDeAbertura();
  usePlanoPendente();
  useConsentimentoDeAnuncios();
  useLembretes(c);
  useBotaoVoltarDoAndroid();
  useMetricaDeConteudo(view);

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

  // Arrastar da esquerda para a direita volta para a tela anterior.
  const swipe = useSwipe({
    onRight: () => {
      if (!canBack) return;
      // Saindo do paywall por gesto: o funil de ofertas pode segurar a saída.
      if (view.name === "subscribe" && !saidaDoPaywallPermitida(null)) return;
      back();
    },
  });

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
      <Sobreposicoes view={view.name} />
      {showTopBar && <TopBar />}
      <main
        ref={mainRef}
        onScroll={onScroll}
        className={`flex-1 overflow-y-auto overflow-x-hidden px-5 ${folgaRodape} [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        {...swipe}
      >
        {telaDaView(view)}
      </main>
      <BottomNav />
    </>
  );
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
  quiz: "studies", quizHistorico: "studies",
  profile: "profile", gamification: "profile", achievements: "profile", auth: "profile", subscribe: "profile", checkout: "profile",
};

function BottomNav() {
  const c = useContent();
  const { view, root } = useNav();
  const active = TAB_OF[view.name];

  // Saindo do paywall por uma aba, o funil de ofertas pode segurar a saída;
  // ao dispensar as ofertas, a navegação pendente é concluída pela própria tela.
  const tryGo = (v: View) => {
    if (view.name === "subscribe" && !saidaDoPaywallPermitida(v)) return;
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