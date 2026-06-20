import type { Metadata } from "next";
import { PrototypeProvider } from "@/lib/app/store";

// Interactive product prototype — kept out of search results.
export const metadata: Metadata = {
  title: "Mentorque — protótipo do app",
  robots: { index: false, follow: false },
};

export default function AppPrototypeLayout({ children }: { children: React.ReactNode }) {
  return <PrototypeProvider>{children}</PrototypeProvider>;
}
