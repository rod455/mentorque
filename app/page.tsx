import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { jsonLd } from "@/lib/jsonLd";

// Canonical da home, apontando para ela mesma.
//
// Título e descrição vêm do layout; o que faltava aqui era ESTE campo. Toda
// outra página de conteúdo do site declara o seu canonical, e a home era a
// única sem nenhum, justamente a que mais recebe endereço variado: com e sem
// www, com barra e sem barra, e sobretudo com etiqueta de campanha
// (?utm_source=...). Sem a etiqueta, cada variação pode ser tratada como uma
// página diferente e a autoridade se divide entre cópias da mesma coisa.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { Hero } from "@/components/sections/Hero";
import { Gains } from "@/components/sections/Gains";
import { SocialProof } from "@/components/sections/SocialProof";
import { Plans } from "@/components/sections/Plans";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";

// SEIS BLOCOS DESDE 04/10/2026 (aposta `landing-em-seis-blocos`, caderno de
// experimentos). Antes eram treze: TrustBar, ProblemSolution, Features,
// HowItWorks, Consulting, Benefits e FAQ saíram. O conteúdo útil delas está
// nos três ganhos e na linha de contato dentro de Planos; o que elas
// prometiam e o app não tem mais (trilhas com certificado, comunidade e
// lives, consultoria em três níveis, "funciona no navegador") saiu junto.
// Único destino da página: a loja.
export default function Page() {
  return (
    <>
      {/* Quem o Mentorque é, em dado estruturado. A home é a página de mais
          autoridade do site, então é daqui que buscador e IA tiram a ficha do
          produto: nome, preço, plataformas e idiomas. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Header />
      <main>
        <Hero />
        <Gains />
        <SocialProof />
        <Plans />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
