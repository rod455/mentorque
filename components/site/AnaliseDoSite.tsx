"use client";

import { Analytics } from "@vercel/analytics/react";
import { isNativeApp } from "@/lib/app/wrapper";

// A medição de páginas da Vercel (Web Analytics), só no SITE.
//
// POR QUE (08/09/2026). A pergunta "qual guia está recebendo visita" não tinha
// resposta: o Search Console guardado no retrato só traz consultas, e a Vercel
// Analytics estava desligada. Sem visita por página, o papel de SEO acompanha a
// entrega dele no escuro.
//
// O componente é inofensivo enquanto o painel da Vercel não ligar a medição
// (o script é servido vazio), e isso é uma chave do dono, não do código: ver
// docs/agentes/acoes-do-dono.md.
//
// FORA DO APP das lojas, de propósito. Dentro do binário a página vem de
// `https://localhost` (Android) ou `capacitor://localhost` (iPhone), o script
// da Vercel não existe nessa origem e cada tela viraria um pedido falhando.
// O app já tem o funil próprio (lib/app/funil.ts); esta medição é do site.
export function AnaliseDoSite() {
  if (isNativeApp()) return null;
  return <Analytics />;
}
