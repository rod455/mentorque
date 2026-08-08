import type { Metadata } from "next";
import { AuthProvider } from "@/lib/app/auth";
import { PrototypeProvider } from "@/lib/app/store";
import { NativeLinkGuard } from "@/components/app/NativeLinkGuard";
import { AppBoundary } from "@/components/app/AppBoundary";

// O app em si (a landing é que é indexada). O título vai para o <title> da
// página — e é lido por rastreadores e pelos revisores das lojas, então nada
// de "protótipo" aqui.
export const metadata: Metadata = {
  title: "Mentorque — cuide do seu carro com confiança",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // A fronteira envolve TUDO: os providers também leem storage e podem
    // falhar num aparelho com dados de site bloqueados.
    <AppBoundary>
      <AuthProvider>
        <NativeLinkGuard />
        <PrototypeProvider>{children}</PrototypeProvider>
      </AuthProvider>
    </AppBoundary>
  );
}
