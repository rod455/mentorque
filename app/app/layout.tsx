import type { Metadata } from "next";
import { AuthProvider } from "@/lib/app/auth";
import { PrototypeProvider } from "@/lib/app/store";
import { NativeLinkGuard } from "@/components/app/NativeLinkGuard";

// Interactive product prototype — kept out of search results.
export const metadata: Metadata = {
  title: "Mentorque — protótipo do app",
  robots: { index: false, follow: false },
};

export default function AppPrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NativeLinkGuard />
      <PrototypeProvider>{children}</PrototypeProvider>
    </AuthProvider>
  );
}
