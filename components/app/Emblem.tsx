"use client";

// Phase badges: custom medallion artwork (PNGs in /public/badges), one per
// journey phase. Milestones ("acervo") still use the CSS medallion below.

// Phase id → badge artwork.
const BADGE: Record<string, string> = {
  aprendiz: "/badges/badge-aprendiz.png",
  piloto: "/badges/badge-piloto.png",
  cuidador: "/badges/badge-cuidador.png",
  mecanico: "/badges/badge-mecanico-garagem.png",
  mestre: "/badges/badge-mestre-garagem.png",
  lenda: "/badges/badge-lenda-mentorque.png",
};

// A phase medallion. Not-yet-reached phases render dessaturated (grayscale +
// dimmed) per the asset guidance; the current phase gets a soft gold glow.
export function PhaseEmblem({ id, emoji, size = 60, active, locked }: { id: string; emoji?: string; size?: number; active?: boolean; locked?: boolean }) {
  const src = BADGE[id];
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size, filter: active && !locked ? "drop-shadow(0 0 9px rgba(242,176,30,0.45))" : undefined }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          draggable={false}
          className={locked ? "grayscale" : undefined}
          style={{ width: size, height: size, objectFit: "contain", opacity: locked ? 0.4 : 1 }}
        />
      ) : (
        <span style={{ fontSize: size * 0.5, filter: locked ? "grayscale(1)" : undefined, opacity: locked ? 0.5 : 1 }}>{emoji}</span>
      )}
    </span>
  );
}

// A round medallion for the "Seu acervo" milestones.
export function MedalEmblem({ emoji, size = 56, earned }: { emoji: string; size?: number; earned?: boolean }) {
  const gold = earned;
  const rim = gold ? "#F2B01E" : "#3A4048";
  const top = gold ? "#F7C24A" : "#2A2F36";
  const bottom = gold ? "#CE8A14" : "#20242A";
  return (
    <span
      className="relative inline-grid place-items-center rounded-full shrink-0"
      style={{ width: size, height: size, background: rim, filter: gold ? "drop-shadow(0 0 8px #F2B01E55)" : undefined }}
    >
      <span
        className="absolute rounded-full"
        style={{ inset: Math.max(2, size * 0.06), background: `linear-gradient(to bottom, ${top}, ${bottom})` }}
      />
      <span className="absolute rounded-full" style={{ inset: Math.max(2, size * 0.06), background: "linear-gradient(to bottom, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)" }} />
      <span className="relative" style={{ fontSize: size * 0.42, filter: gold ? undefined : "grayscale(1)", opacity: gold ? 1 : 0.65 }}>
        {emoji}
      </span>
    </span>
  );
}
