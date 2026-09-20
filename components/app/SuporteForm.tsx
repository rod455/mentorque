"use client";

// O formulário de "Fale com a gente", fora do Perfil (20/09/2026).
//
// POR QUE ELE SAIU DE LÁ. O dono pediu que a tela "Confira seu e-mail" tivesse
// uma saída para quem o e-mail não alcança: avisar do spam e, se mesmo assim
// não chegar, abrir este formulário já escrito. Só que quem está nessa tela
// AINDA NÃO ENTROU na conta, e o formulário morava dentro do Perfil, que só
// existe depois do login. A pessoa mais precisada de falar com a gente era
// justamente a única sem caminho para isso.
//
// Ele não depende de login: usa o armazenamento do aparelho para o nome e o
// e-mail, e posta em /api/feedback com o id do aparelho. Por isso a extração é
// só mudança de lugar, sem mudança de comportamento.

import { useState } from "react";
import { apiPost } from "@/lib/app/apiBase";
import { useI18n } from "@/lib/i18n";
import { usePrototype } from "@/lib/app/store";
import { Button } from "@/components/ui/Button";
import { inputCls, useContent } from "./ui";

/** Um id estável por aparelho, para o suporte conseguir rastrear a mensagem. */
function deviceId(): string {
  if (typeof window === "undefined") return "—";
  try {
    let id = window.localStorage.getItem("mentorque-uid");
    if (!id) { id = (crypto?.randomUUID?.() ?? String(Math.random()).slice(2)); window.localStorage.setItem("mentorque-uid", id); }
    return id;
  } catch { return "—"; }
}

export type TipoDeSuporte = "doubt" | "suggestion" | "bug";

export function SuporteForm({ tipoInicial = "doubt", mensagemInicial = "", emailInicial = "" }: { tipoInicial?: TipoDeSuporte; mensagemInicial?: string; emailInicial?: string }) {
  const c = useContent();
  const p = c.profile;
  const { locale } = useI18n();
  const { s } = usePrototype();
  const [supType, setSupType] = useState<TipoDeSuporte>(tipoInicial);
  const [supMsg, setSupMsg] = useState(mensagemInicial);
  // `emailInicial` na frente do armazenamento (20/09/2026, pedido do dono).
  //
  // Quem abre isto pela tela de "instruções enviadas" ACABOU de digitar o
  // e-mail dele na tela anterior, e o campo aparecia vazio pedindo de novo. Pior
  // que chato: é a única forma de a gente responder, e quem está travado na
  // porta é quem tem menos paciência para redigitar. O armazenamento (`s.email`)
  // continua valendo para quem abre o formulário pelo Perfil, onde não há nada
  // digitado antes.
  const [supEmail, setSupEmail] = useState(emailInicial.trim() || s.email || "");
  const [supErr, setSupErr] = useState(false);
  const [supStatus, setSupStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendSupport = async () => {
    if (!supMsg.trim()) return setSupErr(true);
    setSupStatus("sending");
    try {
      // `apiPost`, não `fetch` com JSON.
      //
      // `content-type: application/json` numa chamada entre origens obriga o
      // navegador a mandar antes um OPTIONS, e o registro em apiBase.ts conta
      // que essa verificação morria dentro da WebView do iPhone — as chamadas
      // não chegavam NEM como OPTIONS. O middleware hoje responde CORS, mas o
      // canal por onde o usuário reclama do app é o último que pode depender
      // disso: se ele falhar, ninguém avisa, porque avisar é justamente o que
      // ele deixou de fazer.
      const res = await apiPost("/api/feedback", {
        type: supType,
        message: supMsg.trim(),
        name: s.name || undefined,
        email: (supEmail || s.email || "").trim() || undefined,
        userId: deviceId(),
        locale,
      });
      if (!res.ok) throw new Error("send_failed");
      setSupStatus("sent");
      setSupMsg("");
    } catch {
      setSupStatus("error");
    }
  };

  return (
    <div>
      <p className="text-sm text-cream/60">{p.support.subtitle}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {([["doubt", p.support.doubt], ["suggestion", p.support.suggestion], ["bug", p.support.bug]] as const).map(([key, label]) => {
          const active = supType === key;
          return (
            <button
              key={key}
              onClick={() => setSupType(key)}
              className={`rounded-xl px-2 py-2 text-sm font-medium ring-1 transition-colors ${active ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/70 ring-white/10"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {supStatus === "sent" ? (
        <div className="mt-3 rounded-xl bg-teal/10 px-3.5 py-3 text-sm text-teal ring-1 ring-teal/20">{p.support.sent}</div>
      ) : (
        <>
          <textarea
            value={supMsg}
            onChange={(e) => { setSupMsg(e.target.value); setSupErr(false); }}
            rows={5}
            placeholder={p.support.messagePh}
            className={`mt-3 resize-none ${inputCls}`}
          />
          <input
            value={supEmail}
            onChange={(e) => setSupEmail(e.target.value)}
            type="email"
            placeholder={p.support.emailPh}
            className={`mt-2 ${inputCls}`}
          />
          {supErr && <p className="mt-1 text-xs text-coral">{p.support.empty}</p>}
          {supStatus === "error" && <p className="mt-1 text-xs text-coral">{p.support.error}</p>}
          <Button size="lg" className="mt-3 w-full" disabled={supStatus === "sending"} onClick={sendSupport}>
            {supStatus === "sending" ? p.support.sending : p.support.send}
          </Button>
        </>
      )}
    </div>
  );
}
