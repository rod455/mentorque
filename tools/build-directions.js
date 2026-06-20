// build-directions.js — three refinement directions for the Mentorque mark,
// composed onto a single dark presentation board for selection.
const fs = require('fs');
const { layout } = require('./lib/type');
const { hexPath, mCenterline, squirclePath } = require('./lib/marks');
const { renderToPng } = require('./lib/render');

const C = {
  graphite: '#16181D', graphiteUp: '#1E222B', plate: '#2A2F39',
  amber: '#F2A623', amberDeep: '#D98E18',
  teal: '#0F8A66', coral: '#C24D26', white: '#FFFFFF',
  s1: '#FCFDFF', s2: '#DFE3EA', s3: '#AEB5C0', s4: '#E8EBF1', ink: '#14161B',
};

// ---- shared defs (gradients + soft shadow; NO hard fold lines) ----
function defs() {
  return `<defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0" stop-color="${C.s1}"/>
      <stop offset="0.46" stop-color="${C.s2}"/>
      <stop offset="0.56" stop-color="${C.s3}"/>
      <stop offset="1" stop-color="${C.s4}"/>
    </linearGradient>
    <radialGradient id="spec" cx="0.32" cy="0.24" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.0"/>
    </radialGradient>
    <linearGradient id="amberG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7B53D"/><stop offset="1" stop-color="${C.amberDeep}"/>
    </linearGradient>
    <linearGradient id="plateG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#313742"/><stop offset="1" stop-color="#20242C"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.40"/>
    </filter>
    <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.30"/>
    </filter>
  </defs>`;
}

// Direction specs ----------------------------------------------------------
const DIRECTIONS = {
  A: {
    name: 'A · Cromo Refinado',
    blurb: 'Hexágono em metal escovado, M em negativo. Premium, confiável — a evolução direta do logo atual.',
    font: 'Montserrat-ExtraBold.ttf', track: -0.012, valley: 0.55,
    hex: 'chrome', mCap: 'round', mWidth: 34, hexCorner: 16,
  },
  B: {
    name: 'B · Grafite Sólido',
    blurb: 'Hexágono grafite chapado, M vazado, entalhe âmbar de torque. Flat, nativo de app, ótimo no tamanho pequeno.',
    font: 'SairaSemiCondensed-Bold.ttf', track: 0.0, valley: 0.5,
    hex: 'solid', mCap: 'butt', mWidth: 36, hexCorner: 10, accentNotch: true,
  },
  C: {
    name: 'C · Contorno Técnico',
    blurb: 'Hexágono em contorno, monograma âmbar. Blueprint de oficina, energético — destaca a letra do "torque".',
    font: 'Rajdhani-Bold.ttf', track: 0.01, valley: 0.52,
    hex: 'outline', mCap: 'round', mWidth: 30, hexCorner: 14, mColor: C.amber,
  },
};

// Build the mark (hex + M) inside a 300x300 box. theme = 'dark'|'light'
// On light backgrounds every direction collapses to a solid dark hexagon with a
// cream knockout (chrome/outline don't read on cream) — the proper inverse.
function mark(spec, theme = 'dark') {
  const cx = 150, cy = 150, R = 120;
  const hex = hexPath(cx, cy, R, spec.hexCorner);
  const box = { l: 104, r: 196, t: 92, b: 214 };
  const m = mCenterline(box, spec.valley);
  const cream = '#F3F1EC';
  const nx = (box.l + box.r) / 2, ny = box.t + (box.b - box.t) * spec.valley;
  let s = '';

  if (theme === 'light') {
    s += `<path d="${hex}" fill="${C.graphite}" filter="url(#soft2)"/>`;
    s += `<path d="${m}" fill="none" stroke="${cream}" stroke-width="${spec.mWidth}" stroke-linecap="${spec.mCap}" stroke-linejoin="${spec.mCap === 'round' ? 'round' : 'miter'}"/>`;
    if (spec.accentNotch) s += `<circle cx="${nx}" cy="${ny + 6}" r="10" fill="${C.amber}"/>`;
    if (spec.hex === 'outline') { // keep the pun: amber M even on light
      s = `<path d="${hex}" fill="${C.graphite}" filter="url(#soft2)"/>` +
          `<path d="${m}" fill="none" stroke="${C.amber}" stroke-width="${spec.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return s;
  }

  if (spec.hex === 'chrome') {
    s += `<path d="${hex}" fill="url(#chrome)" filter="url(#soft)"/>`;
    s += `<path d="${hex}" fill="url(#spec)"/>`;
    s += `<path d="${m}" fill="none" stroke="${C.graphite}" stroke-width="${spec.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (spec.hex === 'solid') {
    s += `<path d="${hex}" fill="url(#plateG)" filter="url(#soft)"/>`;
    s += `<path d="${hex}" fill="none" stroke="#3A404B" stroke-width="2"/>`;
    s += `<path d="${m}" fill="none" stroke="${C.white}" stroke-width="${spec.mWidth}" stroke-linecap="${spec.mCap}" stroke-linejoin="miter"/>`;
    if (spec.accentNotch)
      s += `<circle cx="${nx}" cy="${ny + 6}" r="11" fill="url(#amberG)"/>`;
  } else { // outline
    const sw = 16;
    s += `<path d="${hex}" fill="none" stroke="${C.s2}" stroke-width="${sw}" stroke-linejoin="round" filter="url(#soft2)"/>`;
    s += `<path d="${m}" fill="none" stroke="${spec.mColor}" stroke-width="${spec.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return s;
}

// App icon (squircle) containing the mark, at given pixel size.
function appIcon(spec, size, theme = 'dark') {
  const sq = squirclePath(size / 2, size / 2, size, 5);
  const bg = theme === 'dark' ? C.graphite : '#F3F1EC';
  const inner = `<g transform="translate(${size * 0.16},${size * 0.16}) scale(${size * 0.68 / 300})">${mark(spec, theme)}</g>`;
  return `<g>
    <path d="${sq}" fill="${bg}"/>
    <path d="${sq}" fill="none" stroke="${theme === 'dark' ? '#000' : '#ddd'}" stroke-opacity="0.25" stroke-width="1"/>
    ${inner}
  </g>`;
}

// Horizontal lockup: icon + wordmark. Returns {svg, width} at height ~h.
function lockup(spec, h, theme = 'dark') {
  const iconSize = h;
  const icon = `<g transform="translate(0,0)">${appIcon(spec, iconSize, theme)}</g>`;
  const fs = h * 0.62;
  const wm = layout(
    [{ text: 'Men', color: theme === 'dark' ? C.white : C.ink },
     { text: 'tor', color: C.amber },
     { text: 'que', color: theme === 'dark' ? C.white : C.ink }],
    spec.font, fs, spec.track);
  const gap = h * 0.34;
  const wmX = iconSize + gap;
  const wmY = h / 2 + fs * 0.34; // optical baseline centering
  const runs = wm.runs.map(r => `<path d="${r.d}" fill="${r.color}"/>`).join('');
  const svg = `${icon}<g transform="translate(${wmX},${wmY})">${runs}</g>`;
  return { svg, width: wmX + wm.width };
}

// ---- compose the board ----
const BW = 1680, cardH = 300, pad = 64, gap = 28;
const BH = pad * 2 + 150 + 3 * cardH + 2 * gap + 60;
let cards = '';
let y = pad + 150;
for (const key of ['A', 'B', 'C']) {
  const spec = DIRECTIONS[key];
  const cardY = y;
  // card background (soft tint, no stripes)
  cards += `<rect x="${pad}" y="${cardY}" width="${BW - 2 * pad}" height="${cardH}" rx="22" fill="#1C1F27"/>`;
  // big icon
  const big = 196;
  cards += `<g transform="translate(${pad + 44},${cardY + (cardH - big) / 2})">${appIcon(spec, big, 'dark')}</g>`;
  // name + blurb
  const tx = pad + 44 + big + 56;
  const nm = layout([{ text: spec.name, color: C.white }], 'Montserrat-Bold.ttf', 34, -0.005);
  cards += `<g transform="translate(${tx},${cardY + 64})"><path d="${nm.runs[0].d}" fill="${C.white}"/></g>`;
  // blurb (wrap manually)
  const words = spec.blurb.split(' ');
  let line = '', lines = [], maxw = BW - tx - pad - 360;
  for (const w of words) {
    const test = (line ? line + ' ' : '') + w;
    const tw = layout([{ text: test, color: '#fff' }], 'Montserrat-Medium.ttf', 19, 0).width;
    if (tw > maxw && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((ln, i) => {
    const lp = layout([{ text: ln, color: '#AEB5C0' }], 'Montserrat-Medium.ttf', 19, 0);
    cards += `<g transform="translate(${tx},${cardY + 100 + i * 28})"><path d="${lp.runs[0].d}" fill="#AEB5C0"/></g>`;
  });
  // small-size proofs at right: 60 dark, 60 light, 36
  let px = BW - pad - 44 - (64 + 64 + 40 + 40);
  const py = cardY + (cardH) / 2;
  // 60 dark
  cards += `<g transform="translate(${px},${py - 32})">${appIcon(spec, 60, 'dark')}</g>`;
  px += 84;
  // 60 light (on a light chip so we can judge light-bg legibility)
  cards += `<rect x="${px - 6}" y="${py - 38}" width="72" height="72" rx="16" fill="#F3F1EC"/>`;
  cards += `<g transform="translate(${px},${py - 32})">${appIcon(spec, 60, 'light')}</g>`;
  px += 84;
  // 36
  cards += `<g transform="translate(${px + 12},${py - 18})">${appIcon(spec, 36, 'dark')}</g>`;
  // labels
  const lab = (t, x) => { const l = layout([{ text: t, color: '#7E8693' }], 'Montserrat-Medium.ttf', 13, 0); return `<g transform="translate(${x},${py + 44})"><path d="${l.runs[0].d}" fill="#7E8693"/></g>`; };
  cards += lab('60 · escuro', BW - pad - 44 - 232);
  cards += lab('60 · claro', BW - pad - 44 - 148);
  cards += lab('36', BW - pad - 44 - 44);
  y += cardH + gap;
}

// header
const title = layout([{ text: 'Mentorque', color: C.white }], 'Montserrat-Bold.ttf', 40, -0.01);
const sub = layout([{ text: 'Três direções de refinamento do logo — escolha uma para eu desenvolver o sistema completo.', color: '#AEB5C0' }], 'Montserrat-Medium.ttf', 20, 0);

const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">
  ${defs()}
  <rect width="${BW}" height="${BH}" fill="${C.graphite}"/>
  <rect width="${BW}" height="${BH}" fill="url(#spec)" opacity="0.04"/>
  <g transform="translate(${pad},${pad + 6})"><path d="${title.runs[0].d}" fill="${C.white}"/></g>
  <g transform="translate(${pad},${pad + 44})"><path d="${sub.runs[0].d}" fill="#AEB5C0"/></g>
  ${cards}
</svg>`;

fs.writeFileSync('out/directions.svg', board);
renderToPng(board, 'out/directions.png', BW * 1.4);
console.log('board', BW, 'x', BH, '-> out/directions.png');
