/**
 * The bolt-head hexagon brand motif, used sparingly as a quiet decorative
 * element (corners, behind numbers). Pointy left/right, rounded corners.
 * Decorative only — aria-hidden.
 */
export function HexMotif({
  className,
  strokeOpacity = 0.5,
  strokeWidth = 6,
  fill = "none",
}: {
  className?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Hexagon />
    </svg>
  );
}

function Hexagon() {
  // regular pointy-left/right hexagon, rounded corners, centered in 200 box, R=92, r=16
  const cx = 100, cy = 100, R = 92, r = 16;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i);
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as const;
  });
  const sub = (a: readonly number[], b: readonly number[]) => [a[0] - b[0], a[1] - b[1]] as const;
  const add = (a: readonly number[], b: readonly number[]) => [a[0] + b[0], a[1] + b[1]] as const;
  const norm = (a: readonly number[]) => {
    const L = Math.hypot(a[0], a[1]) || 1;
    return [a[0] / L, a[1] / L] as const;
  };
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = pts[(i + 5) % 6], cur = pts[i], next = pts[(i + 1) % 6];
    const v1 = norm(sub(prev, cur)), v2 = norm(sub(next, cur));
    const p1 = add(cur, [v1[0] * r, v1[1] * r]);
    const p2 = add(cur, [v2[0] * r, v2[1] * r]);
    d += (i === 0 ? `M ${p1[0].toFixed(1)},${p1[1].toFixed(1)}` : ` L ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`);
    d += ` Q ${cur[0].toFixed(1)},${cur[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  d += " Z";
  return <path d={d} />;
}
