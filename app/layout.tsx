import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Lora } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { GoogleTag } from "@/components/GoogleTag";
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

// Elegant book serif for titles/names — matches the Bloom look. UI chrome
// (buttons, labels, body) stays on the sans above.
const serif = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Base de TODA URL absoluta que o Next gera: canonical de cada página, og:url,
// og:image e o endereço do sitemap.
//
// O padrão era `https://mentorque.app`, um domínio que não resolve. Como
// `NEXT_PUBLIC_SITE_URL` não está definida na Vercel (o mesmo tropeço já está
// documentado em lib/email/waitlist.ts), era ESSE endereço que ia no canonical
// de todas as páginas. Canonical apontando para fora do domínio é o jeito mais
// eficiente de pedir ao buscador que ele não indexe o site: ele lê a etiqueta
// como "a versão boa mora ali", e ali não existe nada.
//
// A variável continua valendo, para apontar um build a outro ambiente. O que
// mudou é o padrão: quando ela falta, cai no endereço real do site.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mentorque.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mentorque: aprenda mecânica com um especialista no bolso",
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
    "app para carro",
    "barulho no carro",
    "luz do painel acesa",
    "diagnóstico de carro",
    "histórico de manutenção do carro",
  ],
  authors: [{ name: "Mentorque" }],
  openGraph: {
    type: "website",
    siteName: "Mentorque",
    title: "Mentorque: mecânica do básico ao avançado, com consultoria no bolso",
    // Estava dizendo "entre na lista de espera" com o app JÁ publicado nas duas
    // lojas. Descrição desatualizada não é detalhe de vaidade: é o texto que um
    // modelo de linguagem lê para responder "esse app já existe?", e a resposta
    // errada afasta exatamente quem estava pronto para baixar.
    description:
      "Diagnóstico por sintoma, trilhas de mecânica para leigos, histórico de manutenção e ferramentas como OBD2 e comparador de combustível. Grátis para usar, no Android, no iPhone e no navegador.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mentorque" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentorque: mecânica do básico ao avançado, com consultoria no bolso",
    description:
      "Entenda o que seu carro tem, decida a urgência e chegue na oficina sabendo o que perguntar. Grátis para usar.",
    images: ["/og-image.png"],
  },
  // Favicon/apple-icon are auto-injected from app/icon.svg and app/apple-icon.png.
};

export const viewport: Viewport = {
  themeColor: "#16181D",
  width: "device-width",
  initialScale: 1,
  // Edge-to-edge. Sem isto o wrapper Android (Capacitor SystemBars) recua a
  // própria WebView para dentro das barras do sistema: o app fica com tarjas
  // e todo o `env(safe-area-inset-*)` do Shell devolve 0.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${serif.variable}`}>
      <body>
        <GoogleTag />
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
