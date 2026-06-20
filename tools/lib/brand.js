// brand.js — the OFFICIAL Mentorque mark, normalized to a 300x300 box so it can
// be scaled/placed anywhere. Amber outline hexagon (bolt head) + solid amber
// monoline "M". Faithful to the supplied artwork.
const { hexPath, mCenterline, squirclePath } = require('./marks');
const { layout } = require('./type');

const C = {
  amber: '#F2A623', amberDeep: '#D98E18', amberLite: '#F7B53D',
  graphite: '#16181D', graphite2: '#1E222B', graphite3: '#272C35',
  teal: '#0F8A66', coral: '#C24D26', white: '#FFFFFF', cream: '#F4F2EC',
  ink: '#14161B', mute: '#9AA1AD', mute2: '#6F7782', line: '#E6E3DA',
};

// Mark geometry on a 300 box (center 150,150).
const G = { cx: 150, cy: 150, R: 106, corner: 18, hexStroke: 12.3,
  box: { l: 118, r: 182, t: 117, b: 198 }, mWidth: 28, valley: 0.66 };

// The bare mark (hex outline + M), single color. `solid:true` fills the hex and
// knocks the M out (used for tiny favicon sizes where the outline breaks).
function markBare(color = C.amber, { solid = false, knock = C.graphite } = {}) {
  const hex = hexPath(G.cx, G.cy, G.R, G.corner);
  const m = mCenterline(G.box, G.valley);
  if (solid) {
    return `<path d="${hex}" fill="${color}"/>` +
      `<path d="${m}" fill="none" stroke="${knock}" stroke-width="${G.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<path d="${hex}" fill="none" stroke="${color}" stroke-width="${G.hexStroke}" stroke-linejoin="round"/>` +
    `<path d="${m}" fill="none" stroke="${color}" stroke-width="${G.mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// App icon: squircle bg + mark. theme 'dark'|'light'|'amber'
function appIcon(size, theme = 'dark', { solid = false } = {}) {
  const sq = squirclePath(size / 2, size / 2, size, 5);
  let bg, markColor, knock;
  if (theme === 'dark') { bg = C.graphite; markColor = C.amber; knock = C.graphite; }
  else if (theme === 'light') { bg = C.cream; markColor = C.amber; knock = C.cream; }
  else { bg = C.amber; markColor = C.graphite; knock = C.amber; } // amber tile, graphite mark
  const inner = `<g transform="translate(${size * 0.17},${size * 0.17}) scale(${size * 0.66 / 300})">` +
    (theme === 'amber' ? markBare(C.graphite, { solid, knock: C.amber }) : markBare(markColor, { solid, knock: bg })) + `</g>`;
  return `<path d="${sq}" fill="${bg}"/>${inner}`;
}

// Wordmark "Mentorque" with the shared "tor" in amber. Returns {runs,width,ascent,capH}.
function wordmark(fontFile, fs, { base = C.ink, accent = C.amber, track = -0.012 } = {}) {
  const wm = layout(
    [{ text: 'Men', color: base }, { text: 'tor', color: accent }, { text: 'que', color: base }],
    fontFile, fs, track);
  return { runs: wm.runs.map(r => `<path d="${r.d}" fill="${r.color}"/>`).join(''), width: wm.width, ascent: wm.ascent };
}

module.exports = { C, G, markBare, appIcon, wordmark, layout, squirclePath };
