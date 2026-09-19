import type { Metadata } from "next";
import { LevaParaALoja } from "@/components/site/LevaParaALoja";

// O link inteligente de download: /baixar?utm_source=instagram&...
//
// Fora do buscador de propósito. Esta página não tem conteúdo para indexar, e
// indexada ela competiria com a home pelas mesmas palavras, entregando um
// desvio para a loja no lugar de uma página que explica o app. O sitemap também
// não a lista (app/sitemap.ts espalha os guias e as páginas de conteúdo).
export const metadata: Metadata = {
  title: "Baixar o Mentorque",
  description: "Abra a loja do seu celular e baixe o Mentorque.",
  robots: { index: false, follow: true },
};

export default function BaixarPage() {
  return <LevaParaALoja />;
}
