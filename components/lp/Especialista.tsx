"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

// Quem está por trás do conteúdo.
//
// É o bloco que decide a venda para quem chegou frio de um anúncio. A objeção
// silenciosa de todo app de ensino é "mais um curso de internet", e ela não se
// responde com adjetivo: responde-se com CARGO, LUGAR e TEMPO, que a pessoa
// pode conferir. Por isso as credenciais vêm em números e nomes próprios, e
// não em "especialista renomado".
//
// O QUE NÃO ENTRA AQUI, por decisão do dono: o nome da empresa atual e da
// empresa anterior. A afirmação continua verdadeira sem elas ("engenheiro de
// calibração de powertrain nos Estados Unidos" é o cargo, não a marca), e
// pendurar o produto no nome de uma montadora que não patrocina nada seria
// pedir problema por um ganho que o cargo já entrega.
//
// Cada linha daqui sai do currículo, sem arredondar para cima. A tentação num
// bloco desses é engordar o número; o custo de ser pego exagerando é a única
// coisa que este bloco existe para evitar.

// Os nomes de arquivo aceitos para a foto, em ordem de preferência.
//
// São três em vez de um porque o arquivo é subido à mão (pelo GitHub ou pela
// pasta public), e errar a extensão é o engano mais fácil do mundo: a pessoa
// exporta em PNG, sobe como `alessandro.png`, e a página cai nas iniciais sem
// dizer por quê. Tentar os três custa nada e evita uma ida e volta.
//
// `.jpg` vem primeiro de propósito: é foto de rosto, e JPEG pesa uma fração do
// PNG para o mesmo resultado numa página que se paga por visita.
const FOTOS = ["/equipe/alessandro.jpg", "/equipe/alessandro.png", "/equipe/alessandro.jpeg"];

const CREDENCIAIS = [
  {
    destaque: "4 anos",
    titulo: "Porsche Cup Brasil",
    detalhe: "Engenheiro de dados e performance, dentro do box",
  },
  {
    destaque: "Hoje",
    titulo: "Estados Unidos",
    detalhe: "Engenheiro automotivo",
  },
  {
    destaque: "Formação",
    titulo: "CEFET-MG e PUC Minas",
    detalhe: "Engenharia mecânica e pós em engenharia automotiva",
  },
];

export function Especialista() {
  // Se a foto não estiver publicada, cai nas iniciais em vez de deixar um
  // retângulo vazio no meio da página de conversão.
  //
  // O `onError` sozinho NÃO basta, e isto foi visto quebrado: a página é
  // renderizada no servidor, o navegador tenta a imagem e falha ANTES de o
  // React hidratar, então o handler é registrado depois do evento e nunca
  // ouve nada. Sobrava uma moldura vazia. Por isso a checagem também acontece
  // na montagem: `complete` com `naturalWidth` zero é exatamente "já tentei e
  // não veio".
  const [tentativa, setTentativa] = useState(0);
  const semFoto = tentativa >= FOTOS.length;

  // Avança SE E SOMENTE SE a falha for do arquivo que está sendo tentado
  // agora. Sem essa trava os dois caminhos de detecção (o `onError` e a
  // checagem de montagem) contam a mesma falha duas vezes, e o segundo nome da
  // lista é PULADO. Foi exatamente o que aconteceu: com a foto publicada em
  // `.png`, a página caía nas iniciais mesmo com o arquivo lá.
  const avancar = (deIndice: number) => setTentativa((n) => (n === deIndice ? n + 1 : n));

  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth === 0) avancar(tentativa);
  }, [tentativa]);

  return (
    <section className="px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-9">
          <div className="shrink-0">
            {semFoto ? (
              <span className="grid h-32 w-32 place-items-center rounded-2xl bg-amber/15 font-serif text-3xl font-bold text-amber sm:h-36 sm:w-36">
                AV
              </span>
            ) : (
              <img
                // A chave amarra o <img> à tentativa: sem ela o React reusaria
                // o mesmo elemento ao trocar o src, e o `complete` de dentro do
                // efeito ainda seria o da imagem anterior.
                key={FOTOS[tentativa]}
                ref={img}
                src={FOTOS[tentativa]}
                alt="Alessandro Vila Nova"
                width={144}
                height={144}
                loading="lazy"
                onError={() => avancar(tentativa)}
                className="h-32 w-32 rounded-2xl object-cover object-top ring-1 ring-white/10 sm:h-36 sm:w-36"
                draggable={false}
              />
            )}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="font-serif text-3xl font-bold leading-tight">Quem te ensina faz isso todo dia.</h2>
            <p className="mt-1.5 font-display text-sm font-semibold uppercase tracking-[0.12em] text-amber">
              Alessandro Vila Nova
            </p>
            {/* Parágrafo à ESQUERDA mesmo no celular, com o título centrado.
                Texto corrido centralizado obriga o olho a procurar o começo de
                cada linha, e este é o único bloco longo da página. */}
            <p className="mt-3 text-left leading-relaxed text-cream/75">
              Engenheiro mecânico com pós em engenharia automotiva. Passou quatro anos como engenheiro de dados e
              performance na Porsche Cup Brasil, no box, decidindo acerto de carro e estratégia de corrida. Hoje mora
              nos Estados Unidos e trabalha como engenheiro automotivo.
            </p>
            <p className="mt-3 text-left leading-relaxed text-cream/75">
              O conteúdo do Mentorque sai daí. Não é curso genérico de plataforma: é o que um engenheiro que mexe com
              motor de verdade sabe, escrito para quem nunca abriu um capô.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {CREDENCIAIS.map((c) => (
            <div key={c.titulo} className="rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/5">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-amber">{c.destaque}</p>
              <p className="mt-1.5 font-display text-[15px] font-semibold text-cream">{c.titulo}</p>
              <p className="mt-1 text-sm leading-snug text-cream/60">{c.detalhe}</p>
            </div>
          ))}
        </div>

        {/* O detalhe que prova o resto. Uma vaga que veio como PRÊMIO de uma
            seleção é mais difícil de duvidar do que qualquer adjetivo, e é o
            tipo de coisa que a pessoa consegue conferir se quiser. */}
        <p className="mt-5 text-left text-sm leading-relaxed text-cream/50">
          Chegou à Porsche Cup em 2º lugar entre 40 candidatos no curso de engenharia de automobilismo e aquisição de
          dados da própria categoria. O prêmio da seleção era a vaga na equipe.
        </p>
      </div>
    </section>
  );
}
