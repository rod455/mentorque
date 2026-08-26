"use client";

import { usePrototype } from "@/lib/app/store";
import { useContent } from "./ui";

// O que a pessoa vê ao voltar do checkout.
//
// Antes não via nada. O app recarregava, a sessão levava alguns segundos para
// voltar, e nesse intervalo tudo aparecia como plano gratuito. Quem tinha
// acabado de pagar tocava em qualquer recurso Premium, batia no paywall e
// concluía que a compra falhou.
//
// Em 25/08/2026 um cliente fez exatamente isso: pagou 23:52:23, voltou
// 23:52:27 e às 23:52:37 estava começando um SEGUNDO checkout. O dinheiro
// tinha entrado, a assinatura existia, e mesmo assim ele quase pagou duas
// vezes. Foi ele quem pediu esta tela.
//
// Por isso ela cobre a tela inteira enquanto confirma: não é enfeite de
// carregamento, é o que impede a pessoa de tocar no paywall no exato momento
// em que o app ainda não sabe que ela é assinante.
export function ConfirmandoPagamento() {
  const { checkoutVoltando, fecharAvisoCheckout } = usePrototype();
  const c = useContent();
  const t = c.checkout;

  if (!checkoutVoltando) return null;

  const confirmando = checkoutVoltando === "confirmando";
  const liberado = checkoutVoltando === "liberado";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6" role="status" aria-live="polite">
      <div className="absolute inset-0 bg-graphite/95" />
      <div className="relative w-full max-w-sm rounded-2xl bg-graphite-800 p-7 text-center ring-1 ring-white/10">
        {confirmando && (
          <>
            <span
              aria-hidden
              className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-amber"
            />
            <h2 className="mt-5 font-serif text-xl font-bold text-cream">{t.confirmandoTitulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">{t.confirmandoCorpo}</p>
          </>
        )}

        {liberado && (
          <>
            <span aria-hidden className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-teal/15 text-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <h2 className="mt-4 font-serif text-xl font-bold text-cream">{t.liberadoTitulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">{t.liberadoCorpo}</p>
            <button
              onClick={fecharAvisoCheckout}
              className="mt-6 w-full rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-graphite transition-opacity hover:opacity-90"
            >
              {t.liberadoBotao}
            </button>
          </>
        )}

        {/* Demorou mais que o teto. Nunca dizer "deu erro": o pagamento pode ter
            entrado, e mandar a pessoa tentar de novo é como o cliente de 25/08
            quase pagou duas vezes. O texto manda esperar e olhar o e-mail. */}
        {checkoutVoltando === "demorou" && (
          <>
            <span aria-hidden className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-amber/15 text-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <h2 className="mt-4 font-serif text-xl font-bold text-cream">{t.demorouTitulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">{t.demorouCorpo}</p>
            <button
              onClick={fecharAvisoCheckout}
              className="mt-6 w-full rounded-xl bg-graphite-700 px-4 py-3 font-display text-sm font-semibold text-cream ring-1 ring-white/10 transition-colors hover:bg-graphite-600"
            >
              {t.demorouBotao}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
