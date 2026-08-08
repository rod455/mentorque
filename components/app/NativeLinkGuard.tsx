"use client";

import { useEffect } from "react";
import { isNativeApp, openExternal } from "@/lib/app/wrapper";

// Trava de navegação do app da loja.
//
// A WebView do Capacitor só manda um link para o navegador do sistema quando o
// HOST muda. Como o app roda em `mentorque.com.br/app`, qualquer link interno
// para outra rota do mesmo site (`/privacidade`, `/`) abriria a landing —
// com tabela de preços e checkout do Stripe — dentro do app da loja. Isso é
// exatamente o que a política de pagamentos do Google Play proíbe.
//
// Aqui interceptamos o clique antes da navegação e mandamos a URL para fora
// (aba do sistema). O app nativo nunca sai de `/app`.
export function NativeLinkGuard() {
  useEffect(() => {
    if (!isNativeApp()) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const raw = anchor.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // mailto:, tel: e afins — o próprio Capacitor resolve com um Intent.
      if (url.protocol !== "http:" && url.protocol !== "https:") return;

      const leavesTheApp = url.origin !== window.location.origin || !url.pathname.startsWith("/app");
      if (!leavesTheApp) return;

      e.preventDefault();
      openExternal(url.href);
    };

    // Fase de captura: roda antes de qualquer handler do React.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
