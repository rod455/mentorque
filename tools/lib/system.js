// system.js — shared Mentorque mark system used by the build scripts.
const { layout } = require('./type');
const { hexPath, mCenterline, squirclePath } = require('./marks');

const C = {
  graphite: '#16181D', graphiteUp: '#1E222B', plate: '#2A2F39',
  amber: '#F2A623', amberDeep: '#D98E18',
  teal: '#0F8A66', coral: '#C24D26', white: '#FFFFFF', cream: '#F3F1EC',
  s1: '#FCFDFF', s2: '#DFE3EA', s3: '#AEB5C0', s4: '#E8EBF1', ink: '#14161B', mute: '#AEB5C0',
};

function defs() {
  return `<defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0" stop-color="${C.s1}"/><stop offset="0.46" stop-color="${C.s2}"/>
      <stop offset="0.56" stop-color="${C.s3}"/><stop offset="1" stop-color="${C.s4}"/>
    </linearGradient>
    <radialGradient id="spec" cx="0.32" cy="0.24" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="0.4" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="amberG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7B53D"/><stop offset="1" stop-color="${C.amberDeep}"/>
    </linearGradient>
    <linearGradient id="plateG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#313742"/><stop offset="1" stop-color="#20242C"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.40"/></filter>
    <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.30"/></filter>
  </defs>`;
}

const DIRECTIONS = {
  A: { name: 'A · Cromo Refinado',
    blurb: 'Hexágono em metal escovado, M em negativo. Premium, confiável — a evolução direta do logo atual.',
    font: 'Montserrat-ExtraBold.ttf', track: -0.012, valley: 0.55,
    hex: 'chrome', mCap: 'round', mWidth: 34, hexCorner: 16 },
  B: { name: 'B · Grafite Sólido',
    blurb: 'Hexágono grafite chapado, M vazado, entalhe âmbar de torque. Flat, nativo de app, ótimo no tamanho pequeno.',
    font: 'SairaSemiCondensed-Bold.ttf', track: 0.0, valley: 0.5,
    hex: 'solid', mCap: 'butt', mWidth: 36, hexCorner: 10, accentNotch: true },
  C: { name: 'C · Contorno Técnico',
    blurb: 'Hexágono em contorno, monograma âmbar. Blueprint de oficina, energético — destaca a letra do "torque".',
    font: 'Rajdhani-Bold.ttf', track: 0.01, valley: 0.52,
    hex: 'outline', mCap: 'round', mWidth: 30, hexCorner: 14, mColor: C.amber },
};

function mark(spec, theme = 'dark') {
  const cx = 150, cy = 150, R = 120;
  const hex = hexPath(cx, cy, R, spec.hexCorner);
  const box = { l: 104, r: 196, t: 92, b: 214 };
  const m = mCenterline(box, spec.valley);
  const nx = (box.l + box.r) / 2, ny = box.t + (box.b - box.t) * spec.valley;
  let s = '';
  if (theme === 'light') {
    s += `<path d="${hex}" fill="${C.graphite}" filter="url(#soft2)"/>`;
    if (spec.hex === 'outline') {
      s += `<path d="${m}" fill="none" stroke="${C.amber}" stroke-width="${spec.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      s += `<path d="${m}" fill="none" stroke="${C.cream}" stroke-width="${spec.mWidth}" stroke-linecap="${spec.mCap}" stroke-linejoin="${spec.mCap === 'round' ? 'round' : 'miter'}"/>`;
      if (spec.accentNotch) s += `<circle cx="${nx}" cy="${ny + 6}" r="10" fill="${C.amber}"/>`;
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
    if (spec.accentNotch) s += `<circle cx="${nx}" cy="${ny + 6}" r="11" fill="url(#amberG)"/>`;
  } else {
    s += `<path d="${hex}" fill="none" stroke="${C.s2}" stroke-width="16" stroke-linejoin="round" filter="url(#soft2)"/>`;
    s += `<path d="${m}" fill="none" stroke="${spec.mColor}" stroke-width="${spec.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return s;
}

function appIcon(spec, size, theme = 'dark') {
  const sq = squirclePath(size / 2, size / 2, size, 5);
  const bg = theme === 'dark' ? C.graphite : C.cream;
  const inner = `<g transform="translate(${size * 0.16},${size * 0.16}) scale(${size * 0.68 / 300})">${mark(spec, theme)}</g>`;
  return `<path d="${sq}" fill="${bg}"/>${inner}`;
}

function wordmark(spec, fs, theme = 'dark') {
  const base = theme === 'dark' ? C.white : C.ink;
  const wm = layout([
    { text: 'Men', color: base }, { text: 'tor', color: C.amber }, { text: 'que', color: base },
  ], spec.font, fs, spec.track);
  const runs = wm.runs.map(r => `<path d="${r.d}" fill="${r.color}"/>`).join('');
  return { runs, width: wm.width, ascent: wm.ascent };
}

module.exports = { C, defs, DIRECTIONS, mark, appIcon, wordmark, layout };
