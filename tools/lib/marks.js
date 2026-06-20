// marks.js — geometry for the Mentorque mark: bolt-head hexagon + "M" monogram.
// All functions return plain SVG path strings so they can be composed and
// rendered by resvg, and dropped straight into editable .svg deliverables.

// Rounded regular hexagon, pointy left/right (flat top & bottom edges) — a
// hex-nut / bolt-head silhouette. cx,cy center; R center-to-vertex; r corner radius.
function hexPath(cx, cy, R, r = 0) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i); // 0,60,...  -> vertex right first
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  if (r <= 0) {
    return 'M' + pts.map(p => p.map(n => n.toFixed(2)).join(',')).join(' L ') + ' Z';
  }
  // Rounded corners via line-trim + quadratic at each vertex.
  let d = '';
  for (let i = 0; i < 6; i++) {
    const prev = pts[(i + 5) % 6], cur = pts[i], next = pts[(i + 1) % 6];
    const v1 = norm(sub(prev, cur)), v2 = norm(sub(next, cur));
    const p1 = add(cur, scale(v1, r));
    const p2 = add(cur, scale(v2, r));
    d += (i === 0 ? `M ${f(p1)}` : ` L ${f(p1)}`);
    d += ` Q ${f(cur)} ${f(p2)}`;
  }
  return d + ' Z';
}

// Monoline "M" as a polyline (stroke it with round/square caps & joins).
// Returns the path `d` for the centerline. box = {l,r,t,b}; valley in 0..1
// is how far down the central V dips (1 = to the baseline).
function mCenterline(box, valley = 0.52) {
  const { l, r, t, b } = box;
  const mid = (l + r) / 2;
  const vy = t + (b - t) * valley;
  return `M ${l},${b} L ${l},${t} L ${mid},${vy} L ${r},${t} L ${r},${b}`;
}

// iOS-style squircle (superellipse) centered at cx,cy with side `size`.
// n≈5 matches Apple's continuous corner feel.
function squirclePath(cx, cy, size, n = 5, steps = 96) {
  const a = size / 2;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const ct = Math.cos(t), st = Math.sin(t);
    const x = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n) * a;
    const y = Math.sign(st) * Math.pow(Math.abs(st), 2 / n) * a;
    pts.push([cx + x, cy + y]);
  }
  return 'M' + pts.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L ') + ' Z';
}

// helpers
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const scale = (a, s) => [a[0] * s, a[1] * s];
const len = a => Math.hypot(a[0], a[1]);
const norm = a => { const L = len(a) || 1; return [a[0] / L, a[1] / L]; };
const f = p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;

module.exports = { hexPath, mCenterline, squirclePath };
