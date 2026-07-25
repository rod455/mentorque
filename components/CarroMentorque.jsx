"use client";
// CarroMentorque.jsx — conversível animado do universo Biela/Mentorque
// Uso: <CarroMentorque size={640} driving />        (rodas girando + bounce de suspensão)
//      <CarroMentorque size={640} driving={false}/> (estático, estacionado)
// Assets esperados em /public/carro/: carro-base.png e carro-roda.png
// Posições das rodas calibradas por análise de pixel da arte oficial — não recortar os PNGs.

export default function CarroMentorque({ size = 640, driving = true, speed = 0.9, boost = false }) {
  return (
    <div
      className={`carro-wrap ${driving ? "driving" : ""} ${boost ? "boost" : ""}`}
      style={{ width: size, "--spin": `${speed}s` }}
    >
      <img className="base" src="/carro/carro-base.png" alt="Conversível Mentorque" draggable={false} />
      <img className="roda f" src="/carro/carro-roda.png" alt="" draggable={false} />
      <img className="roda t" src="/carro/carro-roda.png" alt="" draggable={false} />
      <span className="exhaust e1" />
      <span className="exhaust e2" />
      <span className="exhaust e3" />
      <span className="exhaust e4" />
      <span className="exhaust e5" />
      <span className="exhaust e6" />
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
        /* Exhaust smoke from the tailpipe at the rear (right) — drifts back + up */
        .exhaust {
          position: absolute; left: 88%; top: 70%;
          width: 6%; aspect-ratio: 1; border-radius: 50%;
          background: radial-gradient(circle, rgba(214, 214, 220, 0.6), rgba(214, 214, 220, 0));
          opacity: 0;
        }
        .driving .exhaust { animation: exhaust-puff 1.3s ease-out infinite; }
        .exhaust.e2 { animation-delay: 0.43s; }
        .exhaust.e3 { animation-delay: 0.86s; }
        .exhaust.e4 { animation-delay: 0.22s; }
        .exhaust.e5 { animation-delay: 0.65s; }
        .exhaust.e6 { animation-delay: 1.08s; }
        @keyframes exhaust-puff {
          0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
          20% { opacity: 0.45; }
          100% { opacity: 0; transform: translate(90%, -130%) scale(1.7); }
        }
        /* On acceleration: much denser, bigger, faster smoke (thick stream) */
        .boost.driving .exhaust { animation-name: exhaust-boost; animation-duration: 0.42s; }
        .boost .exhaust.e1 { animation-delay: 0s; }
        .boost .exhaust.e2 { animation-delay: 0.07s; }
        .boost .exhaust.e3 { animation-delay: 0.14s; }
        .boost .exhaust.e4 { animation-delay: 0.21s; }
        .boost .exhaust.e5 { animation-delay: 0.28s; }
        .boost .exhaust.e6 { animation-delay: 0.35s; }
        @keyframes exhaust-boost {
          0% { opacity: 0; transform: translate(0, 0) scale(0.8); }
          12% { opacity: 0.95; }
          100% { opacity: 0; transform: translate(150%, -200%) scale(3.4); }
        }
        @media (prefers-reduced-motion: reduce) {
          .carro-wrap, .roda, .exhaust { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
