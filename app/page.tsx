import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Consulting } from "@/components/sections/Consulting";
import { Plans } from "@/components/sections/Plans";
import { Benefits } from "@/components/sections/Benefits";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        {/* Sandwich: dark hero/transitions, light content blocks. */}
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <Features />
        <HowItWorks />
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
