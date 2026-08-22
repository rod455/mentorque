"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/app/apiBase";
import { useI18n } from "@/lib/i18n";
import { usePrototype } from "@/lib/app/store";
import { EVENTO, type MotivoFeedback } from "@/lib/app/feedbackPrompt";
import { effectiveStorePlatform, isNativeApp, nativePlatform, openExternal, storeListingUrl } from "@/lib/app/wrapper";
import { APP_VERSION } from "@/lib/app/content";
import { Button } from "@/components/ui/Button";
import { Sheet, inputCls, useContent } from "./ui";

// A pergunta de nota, montada uma vez no Shell e acordada por evento.
//
// Fica aqui, e não dentro de cada tela que dispara: os três momentos (primeiro
// serviço, terceira aula da trilha, resposta útil da Biela) vivem em telas
// diferentes, e três cópias da mesma folha é como uma delas deixa de conferir
// uma regra sem ninguém notar.

const hojeISO = () => new Date().toISOString().slice(0, 10);

export function FeedbackSheet() {
  const c = useContent();
  const f = c.feedback;
  const { locale } = useI18n();
  const { s, patchFeedback } = usePrototype();

  const [aberta, setAberta] = useState(false);
  const [motivo, setMotivo] = useState<MotivoFeedback | null>(null);
  const [nota, setNota] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [email, setEmail] = useState("");
  const [envio, setEnvio] = useState<"idle" | "enviando" | "enviado" | "erro">("idle");

  useEffect(() => {
    const h = (e: Event) => {
      setMotivo((e as CustomEvent<MotivoFeedback>).detail ?? null);
      setNota(null);
      setTexto("");
      setEmail(s.email ?? "");
      setEnvio("idle");
      setAberta(true);
      // O pedido conta a partir daqui, mesmo que a pessoa feche sem responder:
      // o que precisa ficar registrado é que o app já interrompeu uma vez.
      patchFeedback({ perguntadoEm: hojeISO() });
    };
    window.addEventListener(EVENTO, h);
    return () => window.removeEventListener(EVENTO, h);
  }, [s.email, patchFeedback]);

  const escolher = (n: number) => {
    setNota(n);
    patchFeedback({ respondidoEm: hojeISO(), nota: n });
  };

  const paraALoja = () => {
    patchFeedback({ foiParaLoja: true });
    openExternal(storeListingUrl());
    setAberta(false);
  };

  const enviar = async () => {
    setEnvio("enviando");
    try {
      const res = await apiPost("/api/feedback", {
        type: "rating",
        rating: nota,
        motivo,
        message: texto.trim(),
        name: s.name || undefined,
        email: email.trim() || undefined,
        locale,
        versao: APP_VERSION,
        plataforma: isNativeApp() ? (nativePlatform() ?? "nativo") : "web",
        premium: !!s.premium,
      });
      if (!res.ok) throw new Error("send_failed");
      setEnvio("enviado");
    } catch {
      setEnvio("erro");
    }
  };

  if (!aberta) return null;

  const baixa = nota != null && nota <= 3;
  // O rótulo cita a loja pelo nome, porque "Avaliar na App Store" num Android
  // manda a pessoa para uma loja que o aparelho dela não tem. Vale também na
  // WEB pelo celular: o user-agent diz o aparelho, e um iPhone no Safari vai
  // para a App Store como iria pelo app. Só o desktop fica genérico — ali o
  // botão leva ao site, e falar em loja seria promessa que o link não cumpre.
  const plataforma = effectiveStorePlatform();
  const rotuloLoja =
    plataforma === "ios" ? f.irParaLoja
    : plataforma === "android" ? f.irParaLojaPlay
    : f.irParaLojaGenerico;
  const naLoja = plataforma !== null;

  return (
    <Sheet open onClose={() => setAberta(false)}>
      {nota == null ? (
        <div className="pt-1 text-center">
          {/* `px-10`: o X de fechar da folha fica no canto superior direito, e
              sem esse respiro o título passa por baixo dele e corta. */}
          <h2 className="px-10 font-serif text-xl font-bold text-cream">{f.pergunta}</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-cream/55">{f.subtitulo}</p>
          <div className="mt-5 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => escolher(n)}
                aria-label={f.estrelaLabel.replace("{n}", String(n))}
                className="grid h-12 w-12 place-items-center rounded-full text-2xl text-cream/35 transition-colors hover:bg-white/5 hover:text-amber active:scale-95"
              >
                ★
              </button>
            ))}
          </div>
          <button onClick={() => setAberta(false)} className="mt-5 text-sm text-cream/45 hover:text-cream/70">
            {f.depois}
          </button>
        </div>
      ) : baixa ? (
        <div className="pt-1">
          <h2 className="pr-10 font-serif text-xl font-bold text-cream">{f.contaTitulo}</h2>
          <p className="mt-1.5 text-sm text-cream/55">{f.contaCorpo}</p>
          {envio === "enviado" ? (
            <p className="mt-5 rounded-2xl bg-teal/10 p-4 text-center text-sm text-cream/85 ring-1 ring-teal/25">{f.enviado}</p>
          ) : (
            <>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={4}
                placeholder={f.placeholder}
                className={`${inputCls} mt-4 resize-none`}
              />
              <label className="mt-3 block text-xs text-cream/50">
                {f.emailLabel}
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </label>
              {envio === "erro" && <p className="mt-2 text-sm text-coral">{f.erro}</p>}
              <Button className="mt-4 w-full" onClick={enviar} disabled={envio === "enviando"}>
                {envio === "enviando" ? f.enviando : f.enviar}
              </Button>
            </>
          )}
          {/* A loja continua ao alcance de quem deu nota baixa. Esconder aqui é
              exatamente o filtro que a Apple trata como manipulação da nota. */}
          <button onClick={paraALoja} className="mx-auto mt-4 block text-xs text-cream/40 underline hover:text-cream/70">
            {naLoja ? f.lojaMesmoAssim : f.irParaLojaGenerico}
          </button>
        </div>
      ) : (
        <div className="pt-1 text-center">
          <h2 className="px-10 font-serif text-xl font-bold text-cream">{f.obrigadoTitulo}</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-cream/55">{f.obrigadoCorpo}</p>
          {/* Botão, nunca redirecionamento: a pessoa decide se vai. */}
          <Button className="mt-5 w-full" onClick={paraALoja}>{rotuloLoja}</Button>
          <button onClick={() => setAberta(false)} className="mt-3 text-sm text-cream/45 hover:text-cream/70">
            {f.depois}
          </button>
        </div>
      )}
    </Sheet>
  );
}
