"use client";
// BielaMascote.jsx — mascote animada do Mentorque (idle Duolingo-style)
// Uso: <BielaMascote size={280} pose="idle" />  |  pose="acenando" usa a arte do aceno
// Assets esperados em /public/biela/: biela-idle.png (âncora) e biela-acenando.png
// As porcentagens de olhos/vapor foram calibradas por análise de pixel da âncora oficial.

export default function BielaMascote({ size = 280, pose = "idle" }) {
  const src = pose === "acenando" ? "/biela/biela-acenando.png" : "/biela/biela-idle.png";
  const showOverlays = pose === "idle"; // pálpebras/vapor calibrados pra âncora idle

  return (
    <div className="biela-wrap" style={{ width: size }}>
      <img src={src} alt="Biela, a capivara do Mentorque" draggable={false} />
      {showOverlays && (
        <>
          <span className="lid l" />
          <span className="lid r" />
          <span className="puff" />
          <span className="puff p2" />
          <span className="puff p3" />
        </>
      )}
      <style jsx>{`
        .biela-wrap {
          position: relative;
          animation: biela-breath 3.4s ease-in-out infinite;
          transform-origin: 50% 100%;
          user-select: none;
        }
        .biela-wrap img { width: 100%; display: block; }
        .lid {
          position: absolute; width: 16%; height: 4.6%;
          border-radius: 50%; transform: scaleY(0);
        }
        .lid.l { left: 27.9%; top: 16.2%; background: #c47e36; animation: biela-blink 4.6s infinite; }
        .lid.r { left: 71.3%; top: 14.4%; background: #a86422; animation: biela-blink 4.6s infinite 0.02s; }
        .puff {
          position: absolute; left: 55.2%; top: 53%;
          width: 5.5%; aspect-ratio: 1; border-radius: 50%;
          background: rgba(225, 228, 235, 0.55); opacity: 0;
          animation: biela-steam 2.9s infinite;
        }
        .p2 { animation-delay: 0.95s; }
        .p3 { animation-delay: 1.9s; }
        @keyframes biela-breath {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.013); }
        }
        @keyframes biela-blink {
          0%, 91.5%, 95.5%, 100% { transform: scaleY(0); }
          92.8%, 94.2% { transform: scaleY(1); }
        }
        @keyframes biela-steam {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          15% { opacity: 0.6; }
          100% { transform: translateY(-340%) translateX(30%) scale(1.5); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .biela-wrap, .lid, .puff { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
