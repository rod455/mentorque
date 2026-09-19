import type { Metadata } from "next";
import { HomeNova } from "@/components/nova/HomeNova";

// Home alternativa, para o dono comparar com a de verdade (19/09/2026).
//
// FORA DO BUSCADOR, DE PROPÓSITO. Esta página usa o MESMO texto da home, então
// para o Google ela é conteúdo duplicado da página mais importante do site.
// Deixar entrar no índice divide a autoridade da home com uma cópia
// experimental, que é o oposto do que a gente quer. O `robots` aqui e a
// ausência dela no sitemap resolvem os dois lados.
//
// A página some junto com a pasta components/nova no dia em que o dono decidir.
export const metadata: Metadata = {
  title: "Mentorque: versão de comparação",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeNova />;
}
