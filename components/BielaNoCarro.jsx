"use client";
// BielaNoCarro.jsx — a Biela dirigindo o conversível (cena animada)
// Uso: <BielaNoCarro size={640} driving />          (rodas + suspensão + vapor do café)
//      <BielaNoCarro size={640} driving={false} />  (parada; só o vapor do café)
// Assets esperados em /public/biela-carro/: biela-carro-base.png e biela-carro-roda.png
// Percentuais calibrados por análise de pixel da arte oficial — não recortar os PNGs.

export default function BielaNoCarro({ size = 640, driving = true, speed = 0.9 }) {
  return (
    <div
      className={`cena-wrap ${driving ? "driving" : ""}`}
      style={{ width: size, "--spin": `${speed}s` }}
    >
      <img className="base" src="/biela-carro/biela-carro-base.png" alt="Biela dirigindo o conversível Mentorque" draggable={false} />
      <img className="roda f" src="/biela-carro/biela-carro-roda.png" alt="" draggable={false} />
      <img className="roda t" src="/biela-carro/biela-carro-roda.png" alt="" draggable={false} />
      <span className="puff" />
      <span className="puff p2" />
      <span className="puff p3" />
      <style jsx>{`
        .cena-wrap { position: relative; user-select: none; }
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
