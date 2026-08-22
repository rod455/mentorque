"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";
import { detectPlatform } from "@/lib/app/platform";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { marcarCliqueDownload, Rastreio } from "./Rastreio";

// LP de conversão para tráfego pago (mentorque.com.br/landing).
//
// Regra de ouro da espec: NENHUM link além dos selos das lojas (e o mínimo
// legal no rodapé). Sem header, sem menu, sem formulário. Objetivo único:
// o clique de download, marcado como ClickToDownload nos pixels.
//
// A headline muda por campanha via ?v= (message match anúncio ↔ página);
// o resto da página é fixo.

const HEADLINES: Record<string, string> = {
  default: "Pare de pagar caro por não entender do seu próprio carro.",
  oficina: "Nunca mais feche um orçamento no escuro.",
  preco: "Descubra o preço justo ANTES de levar o carro na oficina.",
  sintoma: "Barulho estranho no carro? Descubra o que pode ser antes de gastar.",
  aprender: "Aprenda mecânica com quem é da indústria, do zero ao avançado.",
};

function Selo({ loja, onde }: { loja: "app_store" | "google_play"; onde: string }) {
  const éApple = loja === "app_store";
  return (
    <a
      href={éApple ? APP_STORE_URL : PLAY_STORE_URL}
      target="_blank"
      rel="noreferrer"
      onClick={() => marcarCliqueDownload(loja)}
      data-onde={onde}
      className="inline-flex h-14 min-w-[168px] items-center justify-center gap-3 rounded-xl bg-graphite-700 px-5 ring-1 ring-white/15 transition-colors hover:bg-graphite-600"
    >
      <span aria-hidden className="text-cream">
        {éApple ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-.9 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2-.1 0-2.1-.8-2.1-3.2zM14.6 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2z" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M4 3.3c-.3.2-.5.6-.5 1.1v15.2c0 .5.2.9.5 1.1l8.2-8.7L4 3.3z" opacity=".9" />
            <path d="M15.1 9.4 5.6 3l10.6 6.1-1.1.3zM5.6 21l9.5-6.4 1.1.3L5.6 21z" opacity=".75" />
            <path d="m17.9 10.1 2.6 1.5c.7.4.7 1.4 0 1.8l-2.6 1.5-1.6-2.4 1.6-2.4z" opacity=".85" />
          </svg>
        )}
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[11px] text-cream/60">Baixar na</span>
        <span className="font-display text-base font-semibold text-cream">{éApple ? "App Store" : "Google Play"}</span>
      </span>
    </a>
  );
}

function Selos({ onde }: { onde: string }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Selo loja="app_store" onde={onde} />
      <Selo loja="google_play" onde={onde} />
    </div>
  );
}

// CTA primário no padrão que converte em mobile: UMA pílula gigante de alto
// contraste que abre direto a loja do aparelho. Os selos ficam logo abaixo
// como caminho explícito por loja (e para quem lê no desktop).
function BotaoGigante({ onde }: { onde: string }) {
  const abrir = () => {
    marcarCliqueDownload("auto");
    const p = detectPlatform();
    window.open(p === "ios" ? APP_STORE_URL : PLAY_STORE_URL, "_blank");
  };
  return (
    <button
      onClick={abrir}
      data-onde={onde}
      className="w-full max-w-xl rounded-full bg-amber py-4 font-display text-lg font-bold text-graphite shadow-lg shadow-amber/20 transition-transform active:scale-[0.99] sm:py-5"
    >
      Baixar grátis agora
    </button>
  );
}

export function LandingDownload({ variante }: { variante?: string }) {
  const headline = HEADLINES[variante ?? "default"] ?? HEADLINES.default;

  // Botão flutuante (mobile): aparece depois que a pessoa rola a primeira
  // tela, e abre a loja certa direto pelo aparelho detectado.
  const [flutuante, setFlutuante] = useState(false);
  useEffect(() => {
    const h = () => setFlutuante(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const baixarDireto = () => {
    marcarCliqueDownload("auto");
    const p = detectPlatform();
    window.open(p === "ios" ? APP_STORE_URL : p === "android" ? PLAY_STORE_URL : PLAY_STORE_URL, "_blank");
  };

  return (
    <div className="min-h-screen bg-graphite text-cream">
      <Rastreio />

      {/* 1. HERO */}
      <section className="relative overflow-hidden px-5 pb-14 pt-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <img src="/logo/mark.svg" alt="Mentorque" className="h-9 w-9" draggable={false} />
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">{headline}</h1>
              <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-cream/70 lg:mx-0">
                Diagnóstico por sintoma, preço justo antes da oficina e aulas de mecânica com quem é da indústria. Grátis pra começar.
              </p>
              <div className="mt-7 flex flex-col items-center gap-4 lg:items-start" id="baixar">
                <BotaoGigante onde="hero" />
                <Selos onde="hero" />
              </div>
              <p className="mt-3 text-sm text-cream/55">Grátis. Sem cartão. Já disponível pra iPhone e Android.</p>
            </div>
            <div className="relative mx-auto">
              <PhoneMockup />
              <img
                src="/biela/biela-acenando.png"
                alt=""
                className="absolute -bottom-4 -left-20 hidden h-40 w-40 object-contain sm:block"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE CONFIANÇA (faixa de selos, estilo logo strip) */}
      <div className="border-y border-white/5 bg-graphite-800 px-5 py-5">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-cream/70">
          <span className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-.9 2.4-1.9.8-1.1 1.1-2.1 1.1-2.2-.1 0-2.1-.8-2.1-3.2zM14.6 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.6-.8 2.5.9.1 1.8-.5 2.4-1.2z" /></svg>
            <span className="flex flex-col leading-tight"><span className="text-[10px] text-cream/45">Disponível na</span><span className="font-display text-sm font-semibold">App Store</span></span>
          </span>
          <span className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 3.3c-.3.2-.5.6-.5 1.1v15.2c0 .5.2.9.5 1.1l8.2-8.7L4 3.3z" opacity=".9" /><path d="M15.1 9.4 5.6 3l10.6 6.1-1.1.3zM5.6 21l9.5-6.4 1.1.3L5.6 21z" opacity=".75" /><path d="m17.9 10.1 2.6 1.5c.7.4.7 1.4 0 1.8l-2.6 1.5-1.6-2.4 1.6-2.4z" opacity=".85" /></svg>
            <span className="flex flex-col leading-tight"><span className="text-[10px] text-cream/45">Disponível no</span><span className="font-display text-sm font-semibold">Google Play</span></span>
          </span>
          <span className="flex items-center gap-2.5">
            <span aria-hidden className="text-xl">🔧</span>
            <span className="flex flex-col leading-tight"><span className="text-[10px] text-cream/45">Feito por quem</span><span className="font-display text-sm font-semibold">trabalha na indústria</span></span>
          </span>
        </div>
      </div>

      {/* 3. O PROBLEMA */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold">Quanto você já perdeu por não entender do seu carro?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icone: "🔧", texto: "A oficina decide por você. E quase sempre cobra a mais." },
              { icone: "💸", texto: "Peça trocada à toa custa mais que um ano inteiro do app." },
              { icone: "❓", texto: "“Confia, tem que trocar.” E você paga no escuro." },
            ].map((c) => (
              <div key={c.icone} className="rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <span aria-hidden className="text-2xl">{c.icone}</span>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. A SOLUÇÃO */}
      <section className="bg-graphite-800/60 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold">Chegue na oficina sabendo o que o carro tem. E quanto deve custar.</h2>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            {[
              { n: "1", titulo: "Diagnóstico por sintoma", texto: "Descreva o barulho, veja as causas prováveis e a urgência real." },
              { n: "2", titulo: "Preço justo antes de fechar", texto: "Faixa de preço do serviço e checklist pra levar na oficina." },
              { n: "3", titulo: "Aprenda com quem é da indústria", texto: "Trilhas do zero ao avançado, sem garimpo no YouTube." },
              { n: "4", titulo: "Seu carro acompanhado", texto: "Saúde do carro, revisões no prazo e histórico de tudo que você fez." },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber/15 font-display font-bold text-amber">{r.n}</span>
                <div>
                  <p className="font-display text-base font-semibold text-cream">{r.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/70">{r.texto}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-4">
            <BotaoGigante onde="solucao" />
            <Selos onde="solucao" />
          </div>
        </div>
      </section>

      {/* 5. AUTORIDADE */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-amber/15 font-serif text-2xl font-bold text-amber">AV</span>
          <div>
            <h2 className="font-serif text-2xl font-bold">Quem te ensina vive disso.</h2>
            <p className="mt-2 leading-relaxed text-cream/70">
              Alessandro Vila Nova, engenheiro da Mercedes-Benz nos Estados Unidos. Não é curso genérico de plataforma: é o conhecimento de quem está dentro da indústria, no seu bolso.
            </p>
          </div>
        </div>
      </section>

      {/* 5b. DEPOIMENTOS (os mesmos do onboarding do app) */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold">Amado por motoristas de todo o Brasil</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { quote: "Descobri o problema do meu carro em minutos. Finalmente sei o que pedir na oficina.", name: "Marina S." },
              { quote: "O diagnóstico me salvou de pagar um orçamento absurdo. Apontou o problema e o preço justo.", name: "Carlos E." },
              { quote: "Os lembretes de revisão mudaram tudo. Não perco mais nenhuma manutenção.", name: "Juliana M." },
            ].map((d) => (
              <figure key={d.name} className="flex flex-col rounded-2xl bg-graphite-800 p-5 text-left ring-1 ring-white/5">
                <span aria-hidden className="text-sm tracking-wider text-amber">★★★★★</span>
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-cream/80">“{d.quote}”</blockquote>
                <figcaption className="mt-3 text-xs font-semibold text-cream/50">{d.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REVERSÃO DE RISCO + CTA FINAL */}
      <section className="bg-graphite-800/60 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold">Baixe grátis. Comece hoje.</h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-cream/70">
            Plano gratuito pra sempre: garagem, diagnóstico por sintoma e aulas introdutórias sem pagar nada. E quem baixa agora entra no <strong className="text-cream">lote de fundadores</strong>: preço de assinatura travado pra sempre.
          </p>
          <div className="mt-7 flex flex-col items-center gap-4">
            <BotaoGigante onde="final" />
            <Selos onde="final" />
          </div>
          <p className="mt-3 text-sm text-cream/55">Sem cartão. Sem fidelidade. Cancele quando quiser.</p>
        </div>
      </section>

      {/* 6b. PERGUNTAS FREQUENTES (sanfona nativa, zero JavaScript) — mata as
          objeções de quem chegou frio pelo anúncio antes do último CTA. */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-serif text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            {[
              { p: "O Mentorque é grátis?", r: "Sim. Garagem, diagnóstico por sintoma e as aulas introdutórias são gratuitos pra sempre, sem cartão. O Premium desbloqueia o plano de revisões pelo manual do seu carro, a Biela ilimitada e as trilhas completas." },
              { p: "Funciona pra qualquer carro?", r: "Sim. Você cadastra marca, modelo, ano e motor, e o app adapta diagnóstico, revisões e conteúdo ao seu carro, de populares a importados, incluindo motos na garagem." },
              { p: "Preciso entender de mecânica?", r: "Não. O app foi feito pra quem NÃO entende: você descreve o problema do seu jeito, em português normal, e ele te explica o que pode ser, a urgência e quanto deve custar." },
              { p: "O app substitui a oficina?", r: "Não, e nem tenta. Ele te prepara PARA a oficina: você chega sabendo as causas prováveis, a faixa de preço justa e as perguntas certas. Quem decide continua sendo você, com um mecânico de confiança." },
              { p: "Funciona no iPhone e no Android?", r: "Sim, nas duas lojas. E a sua conta vale nos dois: começou no celular, continua no computador pelo site." },
              { p: "Quanto custa o Premium?", r: "Tem plano mensal e anual, com teste grátis pra conhecer. O preço está na página de assinatura dentro do app, e quem baixa agora entra no lote de fundadores, com preço travado pra sempre." },
            ].map((f) => (
              <details key={f.p} className="group rounded-2xl bg-graphite-800 ring-1 ring-white/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-[15px] font-semibold text-cream [&::-webkit-details-marker]:hidden">
                  {f.p}
                  <span aria-hidden className="text-amber transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-cream/70">{f.r}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <BotaoGigante onde="faq" />
          </div>
        </div>
      </section>

      {/* 7. RODAPÉ MÍNIMO */}
      <footer className="px-5 pb-24 pt-8 text-center text-xs text-cream/40 sm:pb-10">
        © 2026 Mentorque ·{" "}
        <a href="/privacidade" className="underline hover:text-cream/70">Privacidade</a> ·{" "}
        <a href="/termos" className="underline hover:text-cream/70">Termos</a>
      </footer>

      {/* Botão flutuante (mobile) */}
      {flutuante && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-graphite-900/95 p-3 backdrop-blur sm:hidden">
          <button
            onClick={baixarDireto}
            className="w-full rounded-full bg-amber py-3.5 font-display text-[15px] font-bold text-graphite active:scale-[0.99]"
          >
            Baixar grátis
          </button>
        </div>
      )}
    </div>
  );
}
