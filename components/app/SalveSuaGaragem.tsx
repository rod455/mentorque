"use client";

import { useEffect, useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { useNav } from "@/lib/app/nav";
import { carName } from "@/lib/app/content";
import { Icon, useContent } from "./ui";

/**
 * Nome do evento que esta folha escuta.
 *
 * POR QUE EVENTO E NÃO UMA MARCA NO sessionStorage: a folha é montada UMA VEZ,
 * junto com o app, dentro de Sobreposicoes. Um efeito de montagem lendo uma
 * marca rodaria antes de o cadastro de carro existir, e a folha nunca
 * apareceria — o defeito silencioso de sempre, que só apareceria no aparelho
 * do dono. O mesmo desenho da folha de estrelas (lib/app/feedbackPrompt.ts).
 */
export const EVENTO = "mq-salve-garagem";

/** Chamado pelo cadastro de carro: acorda a folha. */
export function pedirConviteDeConta(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO));
}

// "Salve sua garagem": o convite a criar conta logo depois do primeiro carro.
//
// O MOMENTO É O ARGUMENTO. A pessoa acabou de digitar marca, modelo, ano e km;
// é o instante em que ela mais sente que tem algo a perder, e o único em que
// "seus dados estão só neste aparelho" é uma frase concreta em vez de um
// aviso genérico. Pedir cadastro na abertura do app é pedir por nada, e é o
// que faz metade das pessoas fechar antes de ver o produto.
//
// DÁ PARA DIZER NÃO, e isso não é fraqueza de desenho: o app funciona como
// convidado de propósito (está nos Termos, seção 3), e forçar a conta aqui
// seria quebrar uma promessa escrita para ganhar um cadastro. Quem recusa
// continua com tudo funcionando; o convite só não volta.
//
// Uma vez por sessão, nunca para quem já tem conta.
export function SalveSuaGaragem() {
  const c = useContent();
  const g = c.salvarGaragem;
  const { s } = usePrototype();
  const { user } = useAuth();
  const { go } = useNav();
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    const abrir = () => setAberta(true);
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  const v = activeVehicle(s);
  if (!aberta || user || !v) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-graphite/80 px-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-graphite-800 p-6 ring-1 ring-white/10">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber/15 text-amber">
          <Icon name="car" className="h-6 w-6" />
        </div>
        <p className="text-center font-serif text-lg font-bold text-cream">{g.title}</p>
        <p className="mt-2 text-center text-sm leading-relaxed text-cream/65">
          {g.body.replace("{carro}", carName(v))}
        </p>

        <button
          onClick={() => { setAberta(false); go({ name: "auth" }); }}
          className="mt-5 w-full rounded-xl bg-amber px-4 py-3 font-display text-sm font-semibold text-graphite active:scale-[0.99]"
        >
          {g.cta}
        </button>
        <button
          onClick={() => setAberta(false)}
          className="mt-2 w-full rounded-xl px-4 py-2.5 font-display text-sm font-medium text-cream/55"
        >
          {g.later}
        </button>
      </div>
    </div>
  );
}
