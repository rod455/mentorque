"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/app/auth";
import { guardaVenda } from "@/lib/app/vendaPendente";
import { useI18n } from "@/lib/i18n";
import { StoreBadges } from "@/components/ui/StoreBadges";
import BielaMascote from "@/components/BielaMascote";
import { PhoneFrame } from "./ui";

// "O Mentorque é um app": o que quem chega ao /app pelo navegador, no site em
// produção e sem conta, vê no lugar do app. Decisão do dono em 12/09/2026;
// a regra de quando isto aparece está em lib/app/porteiraDaWeb.ts.
//
// Quem JÁ TEM conta entra por aqui mesmo: Google e Apple abrem o login social
// na hora (é o que 24 das 27 contas usam), e o e-mail leva à tela de login do
// app. Sem isso, as três pessoas que pagam pelo Stripe ficariam trancadas do
// lado de fora da própria assinatura.
//
// O link de venda (`?assinar=anual&cupom=...`) continua valendo: o plano é
// guardado ANTES do login, como faz usePlanoPendente, porque o login social
// na web recarrega a página e a URL não sobrevive à travessia.
export function BaixeOApp({ onEntrarComEmail }: { onEntrarComEmail: () => void }) {
  const { t } = useI18n();
  const p = t.porteira;
  const { signInGoogle, signInApple } = useAuth();

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("assinar");
      if (q === "anual" || q === "mensal" || q === "annual" || q === "monthly") {
        const cupom = url.searchParams.get("cupom")?.trim().toUpperCase() || undefined;
        guardaVenda({ plano: q === "anual" || q === "annual" ? "annual" : "monthly", direto: true, cupom });
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center" data-porteira-da-web>
        <BielaMascote pose="acenando" size={180} />
        <h1 className="mt-6 text-balance font-serif text-[28px] font-bold leading-tight text-cream">{p.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-cream/70">{p.body}</p>

        <div className="mt-7 flex justify-center">
          <StoreBadges className="justify-center" />
        </div>

        <div className="mt-10 w-full max-w-sm rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/[0.06]">
          <p className="text-sm font-medium text-cream/80">{p.jaTemConta}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => void signInGoogle()}
              className="rounded-xl bg-cream px-3 py-2.5 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
            >
              {p.google}
            </button>
            <button
              onClick={() => void signInApple()}
              className="rounded-xl bg-graphite-700 px-3 py-2.5 font-display text-sm font-semibold text-cream ring-1 ring-white/10 active:scale-[0.99]"
            >
              {p.apple}
            </button>
          </div>
          <button onClick={onEntrarComEmail} className="mt-3 text-xs text-cream/55 underline-offset-2 hover:text-cream hover:underline">
            {p.email}
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
