import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { jsonLd } from "@/lib/jsonLd";

// Canonical da home, apontando para ela mesma.
//
// Título e descrição vêm do layout; o que faltava aqui era ESTE campo. Toda
// outra página de conteúdo do site declara o seu canonical, e a home era a
// única sem nenhum — justamente a que mais recebe endereço variado: com e sem
// www, com barra e sem barra, e sobretudo com etiqueta de campanha
// (?utm_source=...). Sem a etiqueta, cada variação pode ser tratada como uma
// página diferente e a autoridade se divide entre cópias da mesma coisa.
//
// Foi um resto do conserto do canonical quebrado: lá se arrumou o DOMÍNIO que
// saía errado, e a home passou batida porque ela não emitia etiqueta nenhuma
// para sair errada.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { SocialProof } from "@/components/sections/SocialProof";
import { Consulting } from "@/components/sections/Consulting";
import { Plans } from "@/components/sections/Plans";
import { Benefits } from "@/components/sections/Benefits";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      {/* Quem o Mentorque é, em dado estruturado. A home é a página de mais
          autoridade do site, então é daqui que buscador e IA tiram a ficha do
          produto: nome, preço, plataformas e idiomas, sem depender de
          interpretar o texto de venda. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Header />
      <main>
        {/* Sandwich: dark hero/transitions, light content blocks. */}
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <SocialProof />
        <Consulting />
        <Plans />
        <Benefits />
        <FAQ />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
