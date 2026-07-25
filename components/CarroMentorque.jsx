"use client";
// CarroMentorque.jsx — conversível animado do universo Biela/Mentorque
// Uso: <CarroMentorque size={640} driving />        (rodas girando + bounce de suspensão)
//      <CarroMentorque size={640} driving={false}/> (estático, estacionado)
// Assets esperados em /public/carro/: carro-base.png e carro-roda.png
// Posições das rodas calibradas por análise de pixel da arte oficial — não recortar os PNGs.

export default function CarroMentorque({ size = 640, driving = true, speed = 0.9 }) {
  return (
    <div
      className={`carro-wrap ${driving ? "driving" : ""}`}
      style={{ width: size, "--spin": `${speed}s` }}
    >
      <img className="base" src="/carro/carro-base.png" alt="Conversível Mentorque" draggable={false} />
      <img className="roda f" src="/carro/carro-roda.png" alt="" draggable={false} />
      <img className="roda t" src="/carro/carro-roda.png" alt="" draggable={false} />
      <style jsx>{`
        .carro-wrap {
          position: relative;
          user-select: none;
        }
        .carro-wrap.driving {
          animation: carro-bounce 0.55s ease-in-out infinite;
        }
        .base { width: 100%; display: block; }
        .roda { position: absolute; width: 20.98%; }
        .roda.f { left: 8.86%; top: 51.75%; }
        .roda.t { left: 66.52%; top: 51.81%; }
        .driving .roda { animation: roda-spin var(--spin, 0.9s) linear infinite; }
        @keyframes roda-spin { to { transform: rotate(-360deg); } }
        @keyframes carro-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .carro-wrap, .roda { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
