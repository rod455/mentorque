import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mentorque.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mentorque — aprenda mecânica com um especialista no bolso",
  description:
    "Mentorque é o app de educação em mecânica automotiva do básico ao avançado, com consultoria especializada. Entenda seu carro, economize na oficina e tenha ajuda humana quando travar.",
  applicationName: "Mentorque",
  keywords: [
    "mecânica automotiva",
    "curso de mecânica",
    "aprender mecânica",
    "consultoria automotiva",
    "OBD2",
    "manutenção de carro",
    "auto mechanics app",
  ],
  authors: [{ name: "Mentorque" }],
  openGraph: {
    type: "website",
    siteName: "Mentorque",
    title: "Mentorque — mecânica do básico ao avançado, com consultoria no bolso",
    description:
      "Trilhas guiadas, diagnóstico por sintoma, ferramentas (OBD2, preço justo, checklist) e consultoria com o creator e a equipe. Entre na lista de espera.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mentorque" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentorque — mecânica do básico ao avançado, com consultoria no bolso",
    description:
      "Aprenda mecânica com um especialista no bolso. Entre na lista de espera do Mentorque.",
    images: ["/og-image.png"],
  },
  // Favicon/apple-icon are auto-injected from app/icon.svg and app/apple-icon.png.
};

export const viewport: Viewport = {
  themeColor: "#16181D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>
        <I18nProvider>
          <a
            href="#top"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-amber focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-medium focus:text-graphite"
          >
            Pular para o conteúdo
          </a>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
