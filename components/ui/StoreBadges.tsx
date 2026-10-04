"use client";

import { useI18n } from "@/lib/i18n";
import {
  APP_STORE_PUBLICADO,
  APP_STORE_URL,
  PLAY_STORE_PUBLICADO,
  PLAY_STORE_URL,
} from "@/lib/stores";
import { marcarCliqueDownload } from "@/components/lp/Rastreio";
import { funil } from "@/lib/app/funil";

/**
 * Selos das lojas. Com `href` viram link; sem `href`, continuam um botão inerte
 * com a legenda "Em breve".
 *
 * Quem manda são os interruptores em lib/stores.ts. No Google Play é literal (a
 * ficha não existe). Na Apple é uma decisão de posicionamento: o app está
 * aprovado, mas a landing ainda vende pré-lançamento, e anunciar a loja no meio
 * disso derruba os dois discursos.
 */
function Badge({
  store,
  loja,
  caption,
  href,
  aoClicar,
}: {
  store: string;
  loja: "app_store" | "google_play";
  caption: string;
  href?: string;
  aoClicar: (loja: "app_store" | "google_play") => void;
}) {
  const inner = (
    <span className="flex items-center gap-3">
      <span aria-hidden className="text-cream/90">
        {store === "App Store" ? <AppleGlyph /> : <PlayGlyph />}
      </span>
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[11px] text-cream/60">{caption}</span>
        <span className="font-display text-sm font-medium text-cream">{store}</span>
      </span>
    </span>
  );
  const cls =
    "inline-flex h-12 items-center rounded-xl bg-graphite-700 px-4 ring-1 ring-white/10 transition-[background-color,transform] duration-200 hover:bg-graphite-600 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none";
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cls}
      onClick={() => aoClicar(loja)}
    >
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} aria-disabled="true" title={`${store}: ${caption}`}>
      {inner}
    </button>
  );
}

// O CLIQUE NO SELO DEIXA RASTRO NO NOSSO FUNIL (04/10/2026).
//
// Até aqui o selo só avisava o Pixel da Meta e o Google Ads
// (`marcarCliqueDownload`), e o nosso funil não sabia de nada: os únicos
// `clicou_baixar` da base vinham do /baixar. A aposta `landing-em-seis-blocos`
// mede cliques de loja na home, e sem isto ela seria aposta medida por
// instrumento que não existe (régua do CRO, ponto 13). A `origem` diz de onde
// na página o clique saiu ("home-topo", "home-fim"), mais a loja, para a
// leitura separar o que o /baixar grava (lá a origem é só a loja).
//
// `umaVez` com chave por origem e loja: a mesma pessoa tocando duas vezes no
// mesmo selo não são dois interessados. O try/catch é a regra de sempre:
// medição nunca segura a navegação.
export function StoreBadges({ className, origem }: { className?: string; origem?: string }) {
  const { t } = useI18n();
  const marcar = (loja: "app_store" | "google_play") => {
    marcarCliqueDownload(loja);
    if (!origem) return;
    try {
      funil("clicou_baixar", { origem: `${origem}:${loja}`, umaVez: true, chave: `baixar:${origem}:${loja}` });
    } catch {
      /* medição não segura a navegação */
    }
  };
  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ""}`}>
      <Badge
        store={t.hero.appStore}
        loja="app_store"
        caption={APP_STORE_PUBLICADO ? t.hero.downloadOn : t.hero.comingSoon}
        href={APP_STORE_PUBLICADO ? APP_STORE_URL : undefined}
        aoClicar={marcar}
      />
      <Badge
        store={t.hero.googlePlay}
        loja="google_play"
        caption={PLAY_STORE_PUBLICADO ? t.hero.downloadOn : t.hero.comingSoon}
        href={PLAY_STORE_PUBLICADO ? PLAY_STORE_URL : undefined}
        aoClicar={marcar}
      />
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-.9 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2-.1 0-2.1-.8-2.1-3.2zM14.6 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 3.3c-.3.2-.5.6-.5 1.1v15.2c0 .5.2.9.5 1.1l8.2-8.7L4 3.3z" opacity=".9" />
      <path d="m14.7 9.3-2.5 2.7 2.5 2.7 3-1.7c.8-.5.8-1.5 0-2l-3-1.7z" />
      <path d="m4 3.3 8.2 8.7 2.5-2.7L5.4 2.7c-.6-.3-1.1-.2-1.4.6z" opacity=".7" />
      <path d="m12.2 12 -8.2 8.7c.3.8.8.9 1.4.6l9.3-5.3-2.5-3z" opacity=".5" />
    </svg>
  );
}
