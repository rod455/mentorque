import type { Metadata } from "next";
import { AuthProvider } from "@/lib/app/auth";
import { PrototypeProvider } from "@/lib/app/store";
import { NativeLinkGuard } from "@/components/app/NativeLinkGuard";

// O app em si (a landing é que é indexada). O título vai para o <title> da
// página — e é lido por rastreadores e pelos revisores das lojas, então nada
// de "protótipo" aqui.
export const metadata: Metadata = {
  title: "Mentorque — cuide do seu carro com confiança",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NativeLinkGuard />
      <PrototypeProvider>{children}</PrototypeProvider>
    </AuthProvider>
  );
}
