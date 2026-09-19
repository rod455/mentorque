"use client";
// BielaNoCarro.jsx — a Biela dirigindo o conversível (cena animada)
// Uso: <BielaNoCarro size={640} driving />          (rodas + suspensão + vapor do café)
//      <BielaNoCarro size={640} driving={false} />  (parada; só o vapor do café)
// Assets esperados em /public/biela-carro/: biela-carro-base.png e biela-carro-roda.png
// Percentuais calibrados por análise de pixel da arte oficial — não recortar os PNGs.

// `size` é o tamanho DESEJADO, não uma exigência: o `maxWidth: 100%` abaixo é
// o que impede a cena de esticar o layout numa tela estreita. Sem ele, a cena
// empurrava a coluna do grid do topo da landing para 400px num celular de
// 393px, e como aquela seção é `overflow-hidden` o excesso não virava rolagem
// e sim texto e botão cortados na borda direita. As peças internas são todas
// percentuais, então encolher a moldura já ajusta rodas e vapor junto.
export default function BielaNoCarro({ size = 640, driving = true, speed = 0.9 }) {
  return (
    <div
      className={`cena-wrap ${driving ? "driving" : ""}`}
      style={{ width: size, maxWidth: "100%", "--spin": `${speed}s` }}
    >
      {/* LARGURA E ALTURA DECLARADAS, E NÃO É FORMALIDADE (19/09/2026).
          São as medidas reais dos PNGs (1175x628 e 244x244). Sem elas o
          navegador não sabe que altura a imagem vai ter e reserva ZERO: a cena
          nasce sem altura nenhuma e, quando o arquivo chega, a caixa salta para
          a altura real e empurra a página inteira.

          Isso custava um pulo de 0,186 de CLS aos 183ms na home, medido com o
          rastro do Chrome DevTools, e era praticamente todo o CLS da página. No
          pulo, a coluna de texto subia 244px e o celular da direita subia
          488px. Trocar o carrossel ou a tipografia não resolvia nada disso: a
          causa era imagem sem espaço reservado.

          Os atributos aqui e o `aspect-ratio` no `.cena-wrap` fazem a mesma
          coisa por dois caminhos, de propósito: o atributo vale mesmo se o CSS
          demorar, e a proporção vale mesmo se alguém tirar os atributos. */}
      <img className="base" src="/biela-carro/biela-carro-base.png" width={1175} height={628} alt="Biela dirigindo o conversível Mentorque" draggable={false} />
      <img className="roda f" src="/biela-carro/biela-carro-roda.png" width={244} height={244} alt="" draggable={false} />
      <img className="roda t" src="/biela-carro/biela-carro-roda.png" width={244} height={244} alt="" draggable={false} />
      <span className="puff" />
      <span className="puff p2" />
      <span className="puff p3" />
      <style jsx>{`
        /* A proporção real do PNG base, 1175 por 628. É ela que garante altura
           à caixa desde o primeiro quadro, antes de qualquer imagem chegar. */
        .cena-wrap { position: relative; user-select: none; aspect-ratio: 1175 / 628; }
        .cena-wrap.driving { animation: cena-bounce 0.55s ease-in-out infinite; }
        .base { width: 100%; display: block; }
        .roda { position: absolute; width: 20.77%; }
        .roda.f { left: 9.11%; top: 60.35%; }
        .roda.t { left: 66.72%; top: 60.35%; }
        .driving .roda { animation: roda-spin var(--spin, 0.9s) linear infinite; }
        .puff {
          position: absolute; left: 52.51%; top: 39.81%;
          width: 4.5%; aspect-ratio: 1; border-radius: 50%;
          background: rgba(228, 231, 238, 0.5); opacity: 0;
          animation: cena-steam 2.9s infinite;
        }
        .p2 { animation-delay: 0.95s; }
        .p3 { animation-delay: 1.9s; }
        @keyframes roda-spin { to { transform: rotate(-360deg); } }
        @keyframes cena-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes cena-steam {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          15% { opacity: 0.55; }
          100% { transform: translateY(-300%) translateX(25%) scale(1.4); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cena-wrap, .roda, .puff { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
