"use client";

import { usePrototype } from "@/lib/app/store";
import { OnboardingFlow } from "@/components/app/OnboardingFlow";
import { Shell } from "@/components/app/Shell";

// The prototype is a client-side state machine: run onboarding until the
// activation loop completes, then drop into the app shell.
export default function AppPrototypePage() {
  const { s } = usePrototype();
  return s.onboarded ? <Shell /> : <OnboardingFlow />;
}
