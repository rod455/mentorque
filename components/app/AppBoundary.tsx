"use client";

import React from "react";

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

export class AppBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
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
