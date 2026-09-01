"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Brand splash shown on app entry: the M-in-hexagon mark pops in and keeps a
// subtle "vibrating" pulse (like the reference), with the name + tagline below.
// Auto-dismisses after a short hold; tap to skip; respects reduced-motion.
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const finished = useRef(false);

  // Só sai uma vez, venha de onde vier (transição, cancelamento ou prazo).
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    let reduce = false;
    try {
      reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* matchMedia indisponível — segue com a animação normal */
    }
    const t = setTimeout(() => setLeaving(true), reduce ? 900 : 2200);

    // TRAVA DE SEGURANÇA. Antes, a splash só saía pelo onTransitionEnd — e
    // esse evento simplesmente não chega em vários casos reais: "Reduzir
    // movimento" zerando a duração, o app indo para segundo plano no meio da
    // transição (o WebKit dispara transitioncancel), ou o CSS do styled-jsx
    // não tendo sido aplicado. Sem o evento, `splashDone` nunca virava true, o
    // Shell nunca era montado e a splash já estava com opacity: 0 — ou seja,
    // TELA PRETA travada, sem nenhuma forma de interagir. Era esse o bug que a
    // revisão da Apple encontrou. Este prazo garante a entrada no app.
    const hard = setTimeout(finish, 4000);
    return () => { clearTimeout(t); clearTimeout(hard); };
  }, [finish]);

  return (
    <div
      className={`splash ${leaving ? "leaving" : ""}`}
      onClick={() => setLeaving(true)}
      onTransitionEnd={(e) => {
        if (leaving && e.target === e.currentTarget) finish();
      }}
      onTransitionCancel={(e) => {
        if (leaving && e.target === e.currentTarget) finish();
      }}
      role="img"
      aria-label="Mentorque: Seu carro na palma da sua mão"
    >
      <span className="glow" aria-hidden />

      <div className="logo-in">
        <div className="logo-idle">
          <svg viewBox="0 0 300 300" width="128" height="128" aria-hidden>
            <path
              d="M 247.00,134.41 Q 256.00,150.00 247.00,165.59 L 212.00,226.21 Q 203.00,241.80 185.00,241.80 L 115.00,241.80 Q 97.00,241.80 88.00,226.21 L 53.00,165.59 Q 44.00,150.00 53.00,134.41 L 88.00,73.79 Q 97.00,58.20 115.00,58.20 L 185.00,58.20 Q 203.00,58.20 212.00,73.79 Z"
              fill="none"
              stroke="#F2A623"
              strokeWidth="12.3"
              strokeLinejoin="round"
            />
            <path
              d="M 118,198 L 118,117 L 150,170.46 L 182,117 L 182,198"
              fill="none"
              stroke="#F2A623"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="text-in">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-cream">Mentorque</h1>
        <p className="mt-2 text-sm text-cream/65">Seu carro na palma da sua mão</p>
      </div>

      <span className="dot" aria-hidden />

      <style jsx>{`
        .splash {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0f1115;
          opacity: 1;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .splash.leaving {
          opacity: 0;
          transform: scale(1.04);
        }
        .glow {
          position: absolute;
          top: 42%;
          width: 460px;
          max-width: 90vw;
          aspect-ratio: 1;
          border-radius: 50%;
          transform: translateY(-50%);
          background: radial-gradient(closest-side, rgba(242, 166, 35, 0.2), transparent 70%);
          animation: glow-pulse 2.6s ease-in-out infinite;
        }
        .logo-in {
          position: relative;
          animation: logo-in 0.75s cubic-bezier(0.2, 0.9, 0.25, 1.25) both;
        }
        .logo-idle {
          transform-origin: 50% 50%;
          animation: logo-idle 2.4s ease-in-out 0.75s infinite;
        }
        .text-in {
          position: relative;
          margin-top: 28px;
          text-align: center;
          animation: text-in 0.6s ease 0.55s both;
        }
        .dot {
          position: relative;
          margin-top: 34px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(242, 166, 35, 0.9);
          animation: dot-pulse 1.1s ease-in-out infinite;
        }
        @keyframes logo-in {
          0% { opacity: 0; transform: scale(0.55); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes logo-idle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.035) rotate(1.4deg); }
          50% { transform: scale(1.05) rotate(0deg); }
          75% { transform: scale(1.035) rotate(-1.4deg); }
        }
        @keyframes text-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.55; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.08); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash { transition: opacity 0.3s ease; }
          .splash.leaving { transform: none; }
          .glow, .logo-in, .logo-idle, .text-in, .dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
