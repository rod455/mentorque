import type { Metadata } from "next";
import { LandingDownload } from "@/components/lp/LandingDownload";

// LP de conversão para tráfego pago: mentorque.com.br/landing
//
// Todas as campanhas apontam para cá com UTMs, e o ângulo do anúncio escolhe
// a headline via ?v= (oficina, preco, sintoma, aprender). Fora do índice de
// busca de propósito: quem chega aqui veio de anúncio, e a página não deve
// competir com a home no Google.
export const metadata: Metadata = {
  title: "Baixe o Mentorque grátis",
  description:
    "Diagnóstico por sintoma, preço justo antes da oficina e aulas de mecânica com quem é da indústria. Grátis pra começar.",
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  return <LandingDownload variante={v} />;
}
