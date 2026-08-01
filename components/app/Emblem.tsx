"use client";

// Bloom-style badges: layered crests (phases) and medallions (milestones).
// Built purely with CSS gradients + clip-paths so they scale crisply and stay
// on-brand — a light rim, a colored body with a top gloss, and the emoji.

// Per-phase color ramp [rim, body-top, body-bottom]. Distinct hues escalate the
// sense of prestige from a calm teal up to a golden legend tier.
const RAMP: Record<string, [string, string, string]> = {
  aprendiz: ["#1FB891", "#12A974", "#0C7355"],
  piloto: ["#33B7CC", "#1796AB", "#0F7A8C"],
  cuidador: ["#F7C24A", "#F2A623", "#CE8A14"],
  mecanico: ["#F9D26B", "#EDA92A", "#C6860F"],
  mestre: ["#E06648", "#C24D26", "#9E3A1C"],
  lenda: ["#FBE08A", "#F2B01E", "#CE8A14"],
};

function ramp(id: string): [string, string, string] {
  return RAMP[id] ?? ["#1FB891", "#12A974", "#0C7355"];
}

const SHIELD = "polygon(50% 0%, 100% 10%, 100% 56%, 50% 100%, 0% 56%, 0% 10%)";

// A heater-shield crest for the six journey phases.
export function PhaseEmblem({ id, emoji, size = 60, active, locked }: { id: string; emoji: string; size?: number; active?: boolean; locked?: boolean }) {
  const [rim, top, bottom] = locked ? ["#3A4048", "#2A2F36", "#20242A"] : ramp(id);
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, filter: active && !locked ? `drop-shadow(0 0 10px ${rim}66)` : undefined }}
    >
      {/* rim / border */}
      <span className="absolute inset-0" style={{ clipPath: SHIELD, background: rim, opacity: locked ? 0.5 : 1 }} />
      {/* body */}
      <span
        className="absolute"
        style={{ inset: Math.max(2, size * 0.05), clipPath: SHIELD, background: `linear-gradient(to bottom, ${top}, ${bottom})`, opacity: locked ? 0.55 : 1 }}
      />
      {/* top gloss */}
      <span
        className="absolute"
        style={{ inset: Math.max(2, size * 0.05), clipPath: SHIELD, background: "linear-gradient(to bottom, rgba(255,255,255,0.32), rgba(255,255,255,0) 55%)" }}
      />
      {/* emoji */}
      <span className="absolute inset-0 grid place-items-center" style={{ fontSize: size * 0.42, filter: locked ? "grayscale(1)" : undefined, opacity: locked ? 0.7 : 1 }}>
        {emoji}
      </span>
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
