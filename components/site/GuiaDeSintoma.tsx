import type { Metadata } from "next";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/stores";
import { irmaosDe, type Bloco, type Guia } from "@/lib/site/guias";

// A estrutura compartilhada dos guias de sintoma (mentorque.com.br/<assunto>).
//
// Primas da /landing, e o oposto dela em um ponto decisivo. A /landing é de
// tráfego pago: fica FORA do índice de propósito, não tem link nenhum além dos
// selos e existe para o clique de download. Estas aqui são de tráfego orgânico:
// precisam ser INDEXÁVEIS, precisam ter link interno, e precisam ganhar a
// posição sendo úteis de graça, mesmo para quem nunca vai baixar o app. Página
// que só repete o discurso de venda com uma palavra-chave no título é porta de
// entrada vazia, e é exatamente o que o Google despriorizou.
//
// AS REGRAS DE CONTEÚDO, e o motivo de cada uma. Elas valem para todo guia e a
// `npm run conferir:guias` cobra as que dá para cobrar automaticamente:
//   - Sem número inventado. Nada de "90% dos casos" nem "economize R$ X": não
//     temos essa medição, e conteúdo de manutenção com número falso é o tipo de
//     erro que destrói confiança de uma vez só. Número que vier de fora vem com
//     data e fonte, porque regra e preço envelhecem.
//   - Sem preço. Faixa de valor muda por região, por carro e por mês; publicar
//     no site vira promessa. Dentro do app ela é estimativa contextualizada ao
//     carro da pessoa, aqui seria um preço solto.
//   - Sem certeza mecânica absoluta. "Costuma ser", "pode indicar", "na maioria
//     dos carros". Ninguém diagnostica um carro por texto, e a página diz isso
//     com todas as letras em vez de fingir que diagnostica.
//   - Sem depoimento. A /landing usa depoimentos ilustrativos; numa página
//     indexável isso seria avaliação fabricada, então eles NÃO vêm para cá.
//     Quando houver avaliação real nas lojas, aí entra, com a fonte.
//
// Renderiza no servidor sem nenhum "use client": o HTML que o robô recebe já
// vem com o texto inteiro, sem depender de JavaScript.

/** Monta o `metadata` da página a partir do guia, para os quatro não divergirem. */
export function metadataDoGuia(g: Guia): Metadata {
  return {
    title: g.tituloSeo,
    description: g.descricaoSeo,
    keywords: g.palavras,
    alternates: { canonical: g.caminho },
    openGraph: {
      type: "article",
      title: g.h1,
      description: g.descricaoSeo,
      url: g.caminho,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mentorque" }],
    },
  };
}

const TOM: Record<Bloco["urgencia"]["tom"], string> = {
  alta: "bg-coral/15 text-coral ring-coral/25",
  media: "bg-amber/15 text-amber ring-amber/25",
  baixa: "bg-teal/15 text-teal ring-teal/25",
};

function Lojas() {
  const base =
    "inline-flex h-12 items-center justify-center rounded-xl px-5 font-display text-sm font-semibold transition-colors";
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className={`${base} bg-amber text-graphite hover:bg-amber-300`}>
        Baixar no Google Play
      </a>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noreferrer"
        className={`${base} bg-graphite-700 text-cream ring-1 ring-white/15 hover:bg-graphite-600`}
      >
        Baixar na App Store
      </a>
    </div>
  );
}

export function GuiaDeSintoma({ guia: g }: { guia: Guia }) {
  const irmaos = irmaosDe(g.caminho);

  // FAQPage estruturado: mesma pergunta e mesma resposta que aparecem na tela.
  // Marcação que não bate com o texto visível é violação de diretriz do Google e
  // derruba o rich result inteiro, então as duas leem do mesmo array.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map((f) => ({
      "@type": "Question",
      name: f.p,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };

  return (
    <div className="min-h-screen bg-graphite text-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabeçalho próprio: o Header do site é feito de âncoras da home
          (#features, #plans) e numa subpágina levaria a lugar nenhum. Aqui basta
          o caminho de volta, que também é o link interno que o robô segue. */}
      <header className="border-b border-white/5 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5" aria-label="Mentorque">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/mark.svg" alt="" className="h-7 w-7" />
            <span className="font-display text-sm font-semibold text-cream/80">Mentorque</span>
          </a>
          <a href="/" className="text-sm text-cream/55 transition-colors hover:text-cream">
            Ver o app
          </a>
        </div>
      </header>

      <main className="px-5 sm:px-8">
        {/* 1. ABERTURA */}
        <section className="mx-auto max-w-3xl pb-10 pt-12">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-amber">{g.rotulo}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{g.h1}</h1>
          {g.abertura.map((p, i) => (
            <p key={p} className={i === 0 ? "mt-5 text-lg leading-relaxed text-cream/75" : "mt-4 leading-relaxed text-cream/60"}>
              {p}
            </p>
          ))}

          <nav aria-label="Índice do guia" className="mt-8 rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
            <p className="font-display text-sm font-semibold text-cream">{g.indiceTitulo}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {g.blocos.map((b) => (
                <li key={b.id}>
                  <a href={`#${b.id}`} className="text-sm text-cream/70 underline decoration-white/20 underline-offset-4 hover:text-amber">
                    {b.quando}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* 2. OS BLOCOS */}
        <section className="mx-auto max-w-3xl space-y-6 py-6">
          {g.blocos.map((b) => (
            <article key={b.id} id={b.id} className="scroll-mt-6 rounded-2xl bg-graphite-800 p-6 ring-1 ring-white/5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold leading-snug">{b.quando}</h2>
                <span className={`shrink-0 rounded-full px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wider ring-1 ${TOM[b.urgencia.tom]}`}>
                  {b.urgencia.rotulo}
                </span>
              </div>

              <p className="mt-3 leading-relaxed text-cream/75">{b.som}</p>

              <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
                O que costuma estar por trás
              </h3>
              <ul className="mt-3 space-y-2.5">
                {b.causas.map((c) => (
                  <li key={c} className="flex gap-3 text-sm leading-relaxed text-cream/75">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-cream/50">
                Repare nisto antes de ir na oficina
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cream/70">
                {b.observar.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>

              <p className="mt-6 rounded-xl bg-graphite-700/60 p-4 text-sm leading-relaxed text-cream/75">{b.urgencia.texto}</p>
            </article>
          ))}
        </section>

        {/* 3. O BLOCO DE SEGURANÇA */}
        <section className="mx-auto max-w-3xl py-10">
          <div className="rounded-2xl bg-coral/10 p-6 ring-1 ring-coral/25 sm:p-7">
            <h2 className="font-serif text-2xl font-bold">{g.pareAgora.titulo}</h2>
            <p className="mt-3 leading-relaxed text-cream/75">{g.pareAgora.intro}</p>
            <ul className="mt-4 space-y-2.5">
              {g.pareAgora.itens.map((s) => (
                <li key={s} className="flex gap-3 text-sm leading-relaxed text-cream/80">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. COMO CHEGAR NA OFICINA */}
        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">{g.oficina.titulo}</h2>
          <p className="mt-3 leading-relaxed text-cream/70">{g.oficina.intro}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {g.oficina.cartoes.map((o, i) => (
              <div key={o.titulo} className="rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-amber/15 font-display font-bold text-amber">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-cream">{o.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{o.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONVITE (honesto: diz o que o app faz, não promete resultado) */}
        <section className="mx-auto max-w-3xl py-10">
          <div className="rounded-2xl bg-graphite-800 p-6 ring-1 ring-white/5 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">{g.convite.titulo}</h2>
            <p className="mt-3 leading-relaxed text-cream/75">{g.convite.texto}</p>
            <p className="mt-3 leading-relaxed text-cream/60">
              O plano gratuito cobre a garagem, o diagnóstico por sintoma e as aulas introdutórias, sem cartão.
            </p>
            <div className="mt-6">
              <Lojas />
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="mx-auto max-w-3xl py-10">
          <h2 className="font-serif text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-7 space-y-3">
            {g.faq.map((f) => (
              <details key={f.p} className="group rounded-2xl bg-graphite-800 ring-1 ring-white/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-[15px] font-semibold text-cream [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-[15px] font-semibold">{f.p}</h3>
                  <span aria-hidden className="text-amber transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-cream/70">{f.r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. OS OUTROS GUIAS.
            Não é enfeite de rodapé: até aqui cada guia era uma ilha ligada só à
            home, e página sem link de entrada demora muito mais para ser
            encontrada. Um robô que chega em qualquer um dos quatro alcança os
            outros três em um passo. */}
        {irmaos.length > 0 && (
          <section className="mx-auto max-w-3xl py-10">
            <h2 className="font-serif text-2xl font-bold">Outros guias de diagnóstico</h2>
            <ul className="mt-6 space-y-3">
              {irmaos.map((o) => (
                <li key={o.caminho}>
                  <a
                    href={o.caminho}
                    className="block rounded-2xl bg-graphite-800 p-5 ring-1 ring-white/5 transition-colors hover:ring-amber/30"
                  >
                    <span className="font-display text-base font-semibold text-cream">{o.chamada}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-cream/60">{o.descricaoSeo}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="mt-6 border-t border-white/5 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl text-sm text-cream/50">
          <p className="leading-relaxed">
            Conteúdo educativo do Mentorque. Não substitui a inspeção de um profissional: o objetivo é te deixar mais bem
            informado na hora de decidir.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <a href="/" className="underline underline-offset-4 hover:text-cream">Mentorque</a>
            <a href="/privacidade" className="underline underline-offset-4 hover:text-cream">Privacidade</a>
            <a href="/termos" className="underline underline-offset-4 hover:text-cream">Termos</a>
          </p>
          <p className="mt-4 text-xs text-cream/35">© 2026 Mentorque</p>
        </div>
      </footer>
    </div>
  );
}
