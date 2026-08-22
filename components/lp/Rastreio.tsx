"use client";

import { useEffect } from "react";
import Script from "next/script";

// Rastreio da LP de tráfego pago.
//
// O Google tag em si é global (components/GoogleTag.tsx, no layout raiz).
// Aqui ficam o Pixel da Meta (só na LP, e só quando o id existir no
// ambiente) e a função de conversão dos cliques de download.
//   NEXT_PUBLIC_META_PIXEL_ID        id numérico do Pixel da Meta
//   NEXT_PUBLIC_GADS_LABEL_DOWNLOAD  troca o rótulo da conversão, se um dia mudar
import { GADS_ID } from "@/components/GoogleTag";

const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const GADS_LABEL = process.env.NEXT_PUBLIC_GADS_LABEL_DOWNLOAD ?? "hiG4CLKEk-YcEN2cmshE";

type ComPixels = { fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void };

// A conversão que importa: toque num selo de loja (ou no botão flutuante).
export function marcarCliqueDownload(store: "google_play" | "app_store" | "auto"): void {
  try {
    const w = window as unknown as ComPixels;
    w.fbq?.("trackCustom", "ClickToDownload", { store });
    if (GADS_ID && GADS_LABEL) {
      w.gtag?.("event", "conversion", {
        send_to: `${GADS_ID}/${GADS_LABEL}`,
        value: 1.0,
        currency: "BRL",
        store,
      });
    }
  } catch { /* rastreio nunca segura o clique */ }
}

// Guarda as UTMs (e a variante de headline) no aparelho. Se essa pessoa
// instalar e depois criar conta pela web, dá para ligar campanha a cadastro.
function guardarUtm(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "v"]) {
      const val = q.get(k);
      if (val) utm[k] = val.slice(0, 80);
    }
    if (Object.keys(utm).length) {
      utm.em = new Date().toISOString();
      window.localStorage.setItem("mq-utm", JSON.stringify(utm));
    }
  } catch { /* sem armazenamento: segue */ }
}

export function Rastreio() {
  useEffect(() => { guardarUtm(); }, []);
  return (
    <>
      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
