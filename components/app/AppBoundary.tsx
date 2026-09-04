"use client";

import React from "react";
import { relatarQuebraDeTela, vigiarErros } from "@/lib/app/erros";

// Rede de segurança do app dentro da WebView.
//
// O /app é 100% client-side: o HTML que sai do servidor é uma casca vazia e
// tudo é desenhado depois que o JS roda. Se qualquer coisa estourar antes da
// primeira pintura — um chunk que não baixou, storage bloqueado pelo aparelho,
// um erro de render — o React desmonta a árvore e o que sobra é uma TELA
// PRETA, sem texto e sem saída. Foi exatamente o que a revisão da Apple viu.
//
// Esta fronteira transforma esse caso num aviso legível com botão de tentar de
// novo. É a diferença entre "app quebrado" e "deu ruim, recarrega".

type Props = { children: React.ReactNode };
type State = { failed: boolean };

// Falha de download de chunk (deploy no meio do carregamento, rede oscilando).
// Recarregar resolve, porque o HTML novo aponta para os arquivos novos.
function isChunkError(e: unknown): boolean {
  const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  return /ChunkLoadError|Loading chunk|Importing a module script failed|dynamically imported module/i.test(msg);
}

const RELOAD_KEY = "mentorque-chunk-reload";

// Em qual tela a coisa estourou. O rastro do React vem como uma pilha de
// nomes, do mais interno ao mais externo; o primeiro é o componente que
// quebrou, e é ele que diz se foi o onboarding, o quiz ou o paywall. A pilha
// inteira não cabe no campo e nem ajuda: sem ela o relato seria "quebrou em
// algum lugar", que é quase o silêncio de onde estamos saindo.
function primeiroComponente(pilha?: string | null): string | undefined {
  const linha = (pilha ?? "").split("\n").map((l) => l.trim()).find(Boolean);
  return linha ? linha.replace(/^(at|in)\s+/, "").split(" ")[0] : undefined;
}

export class AppBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  // Avisa o vigia inline do layout que o React montou — sem isso ele acha que
  // o app morreu e mostra o aviso de recarregar por cima.
  componentDidMount() {
    (window as unknown as { __mqReady?: () => void }).__mqReady?.();
    // O VIGIA DE ERROS COMEÇA AQUI, e não mais no Shell.
    //
    // Ele morava dentro de `useFunilDeAbertura`, que é montado pelo Shell, e o
    // Shell só existe depois de `onboarded`. Ou seja: as cinco páginas do
    // onboarding, que são a primeira coisa que um visitante novo vê e o lugar
    // onde o dinheiro do anúncio cai, rodavam SEM NINGUÉM OLHANDO. Erro ali não
    // virava linha em `app_erros`, e a tabela vazia foi lida como "está tudo
    // bem" em 04/09/2026.
    //
    // Aqui é o ponto mais alto do app: cobre onboarding, Shell e o que vier. A
    // função tem trava própria, então o Shell continuar chamando não duplica
    // ouvinte nenhum.
    vigiarErros();
  }

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // RELATA ANTES DE QUALQUER DECISÃO. O caminho do chunk recarrega a página,
    // e depois da recarga não sobra nada para contar: era assim que a quebra
    // mais comum sumia sem deixar rastro.
    relatarQuebraDeTela(error, primeiroComponente(info.componentStack));

    // Chunk velho: uma única recarga automática resolve. O marcador impede
    // laço infinito caso o problema seja outro.
    if (isChunkError(error)) {
      try {
        if (!window.sessionStorage.getItem(RELOAD_KEY)) {
          window.sessionStorage.setItem(RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* storage bloqueado — segue para a tela de erro */
      }
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-graphite px-6 text-center">
        <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-amber/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/mark.svg" alt="" className="h-9 w-9" />
        </span>
        <p className="font-serif text-xl font-bold text-cream">Algo travou por aqui</p>
        <p className="max-w-xs text-sm leading-snug text-cream/60">
          Não conseguimos carregar o app agora. Verifique sua conexão e tente de novo.
        </p>
        <button
          onClick={() => {
            try { window.sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ }
            window.location.reload();
          }}
          className="mt-1 rounded-full bg-amber px-6 py-3 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
        >
          Tentar de novo
        </button>
      </div>
    );
  }
}
