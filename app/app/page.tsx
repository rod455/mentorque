"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { OnboardingFlow } from "@/components/app/OnboardingFlow";
import { Shell } from "@/components/app/Shell";
import { SplashScreen } from "@/components/app/SplashScreen";

// The prototype is a client-side state machine: brand splash on entry, then
// run onboarding until the activation loop completes, then the app shell.
export default function AppPrototypePage() {
  const { s } = usePrototype();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;
  return s.onboarded ? <Shell /> : <OnboardingFlow />;
}
