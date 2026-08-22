"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { isNativeApp } from "@/lib/app/wrapper";

// Google tag (gtag.js) do Google Ads, em TODAS as páginas do site.
//
// Fica fora do app nativo de propósito: o mesmo layout empacota o app das
// lojas (Capacitor), e script de anúncio dentro do app instalado não mede
// campanha nenhuma, só cria problema de política de privacidade nas lojas.
// Por isso a decisão é em runtime, depois do mount.
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID ?? "AW-18405035613";

export function GoogleTag() {
  const [liberado, setLiberado] = useState(false);
  useEffect(() => {
    if (!isNativeApp()) setLiberado(true);
  }, []);
  if (!liberado || !GADS_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GADS_ID}');`}
      </Script>
    </>
  );
}
