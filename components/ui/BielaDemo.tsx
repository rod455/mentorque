/* eslint-disable @next/next/no-img-element */
"use client";

import { useI18n } from "@/lib/i18n";

/**
 * O Biela em ação, na primeira dobra da landing (aposta
 * `landing-em-seis-blocos`, 04/10/2026).
 *
 * Substitui a moldura de celular que mostrava uma "Trilha · Freios" com
 * barra de progresso e certificado, coisa que o app não tem mais. O que a
 * pessoa vê aqui é o uso real do produto: uma pergunta com as palavras dela e
 * a resposta do Biela como ela sai hoje, em texto corrido e curto. O texto
 * mora em `strings.*.ts` (`hero.demo`), e o comentário de lá explica por que
 * a resposta NÃO está em três blocos ainda.
 *
 * A arte animada da Biela fica (decisão do dono, 04/10): é a marca, e é ela
 * que dá presença ao personagem. A caixa tem tamanho fixo para a imagem não
 * empurrar a página quando chega (o mesmo cuidado do `BielaNoCarro`).
 */
export function BielaDemo() {
  const { t } = useI18n();
  const d = t.hero.demo;
  return (
    <figure
      id="biela"
      role="img"
      aria-label={d.alt}
      className="relative mx-auto w-full max-w-[400px] scroll-mt-28"
    >
      <div className="rounded-[1.75rem] border border-white/10 bg-graphite-900 p-3 shadow-card">
        <div className="overflow-hidden rounded-[1.25rem] bg-graphite-800">
          {/* cabeçalho do chat */}
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-amber/15">
              <img
                src="/biela/biela-falando-anim.webp"
                width={40}
                height={40}
                alt=""
                className="h-10 w-10 object-contain"
                draggable={false}
              />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold text-cream">{d.biela}</span>
              <span className="block truncate text-[11px] text-cream/55">{d.typing}</span>
            </span>
            <span className="ml-auto rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-cream/60 ring-1 ring-white/10">
              {d.car}
            </span>
          </div>

          {/* conversa */}
          <div className="flex flex-col gap-3 px-4 py-4">
            <p className="sr-only">{d.you}:</p>
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-graphite-600 px-4 py-2.5 text-[0.9375rem] leading-snug text-cream">
              {d.question}
            </p>
            <p className="sr-only">{d.biela}:</p>
            <p className="max-w-[92%] rounded-2xl rounded-bl-md border-l-2 border-amber bg-graphite-700 px-4 py-3 text-[0.9375rem] leading-relaxed text-cream/90">
              {d.answer}
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
