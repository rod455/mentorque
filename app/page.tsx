import { Header } from "@/components/Header";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProblemSolution } from "@/components/sections/ProblemSolution";
import { TryNow } from "@/components/sections/TryNow";
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
      <Header />
      <main>
        {/* Sandwich: dark hero/transitions, light content blocks. */}
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <TryNow />
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
