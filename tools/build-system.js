// build-system.js — full Mentorque logo system from the official mark.
const fs = require('fs');
const { C, G, markBare, appIcon, wordmark, squirclePath } = require('./lib/brand');
const { capHeight } = require('./lib/type');
const { renderToPng } = require('./lib/render');

const FONT = 'Montserrat-ExtraBold.ttf';   // wordmark typeface (swappable)
const OUT = 'out/logo';
fs.mkdirSync(OUT, { recursive: true });
const emit = (name, svg, pngW) => {
  fs.writeFileSync(`${OUT}/${name}.svg`, svg);
  if (pngW) renderToPng(svg, `${OUT}/${name}.png`, pngW);
};
const SVG = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

// ---------- horizontal lockup ----------
// markPx = rendered size of the 300-box mark. Wordmark cap-height tuned to the
// hexagon's visual height; baseline optically centered on the mark.
function lockup(theme, { markPx = 200 } = {}) {
  const dark = theme === 'dark';
  const base = dark ? C.white : C.ink;
  const markColor = C.amber;
  const hexVisH = markPx * (2 * G.R * Math.sin(Math.PI / 3) / 300); // visual hex height
  const capTarget = hexVisH * 0.92;
  // find fontSize giving that cap height
  let fsz = 100; const ch1 = capHeight(FONT, 100); fsz = capTarget / ch1 * 100;
  const capH = capHeight(FONT, fsz);
  const wm = wordmark(FONT, fsz, { base, accent: C.amber, track: -0.012 });
  const gap = markPx * 0.10;
  const markX = 0, wmX = markPx + gap;
  const cy = markPx / 2;
  const baseline = cy + capH / 2;
  const totalW = wmX + wm.width;
  const body = `<g transform="translate(${markX},0) scale(${markPx / 300})">${markBare(markColor)}</g>` +
    `<g transform="translate(${wmX},${baseline})">${wm.runs}</g>`;
  return { body, w: totalW, h: markPx, cy };
}

// dark lockup (on graphite)
{
  const L = lockup('dark', { markPx: 200 });
  const pad = 80;
  emit('lockup-dark', SVG(L.w + pad * 2, L.h + pad * 2,
    `<rect width="${L.w + pad * 2}" height="${L.h + pad * 2}" fill="${C.graphite}"/><g transform="translate(${pad},${pad})">${L.body}</g>`), 1600);
}
// light lockup (on cream)
{
  const L = lockup('light', { markPx: 200 });
  const pad = 80;
  emit('lockup-light', SVG(L.w + pad * 2, L.h + pad * 2,
    `<rect width="${L.w + pad * 2}" height="${L.h + pad * 2}" fill="${C.cream}"/><g transform="translate(${pad},${pad})">${L.body}</g>`), 1600);
}

// ---------- marca isolada (bare mark, transparent) ----------
emit('mark-amber', SVG(300, 300, markBare(C.amber)), 600);
emit('mark-white', SVG(300, 300, markBare(C.white)), 600);
emit('mark-graphite', SVG(300, 300, markBare(C.graphite)), 600);

// ---------- app icons (squircle) ----------
emit('appicon-dark', SVG(1024, 1024, appIcon(1024, 'dark')), 512);
emit('appicon-light', SVG(1024, 1024, appIcon(1024, 'light')), 512);
emit('appicon-amber', SVG(1024, 1024, appIcon(1024, 'amber')), 512);

// ---------- monochrome (1 color) ----------
emit('mono-onlight', SVG(300, 300, markBare(C.ink)), 600);       // graphite on light
emit('mono-ondark', SVG(300, 300, markBare(C.cream)), 600);      // cream on dark (with bg)
emit('mono-ondark-bg', SVG(300, 300, `<rect width="300" height="300" fill="${C.graphite}"/>${markBare(C.cream)}`), 600);

// ---------- favicon ----------
// At <=32px the outline + thin M lose legibility, so the favicon uses the SOLID
// hex with a knockout M. Provide svg + 48/32/16 png.
const favSolidDark = SVG(64, 64, `<rect width="64" height="64" rx="14" fill="${C.graphite}"/><g transform="translate(2,2) scale(${60/300})">${markBare(C.amber, { solid: true, knock: C.graphite })}</g>`);
emit('favicon', favSolidDark);
renderToPng(favSolidDark, `${OUT}/favicon-48.png`, 48);
renderToPng(favSolidDark, `${OUT}/favicon-32.png`, 32);
renderToPng(favSolidDark, `${OUT}/favicon-16.png`, 16);

console.log('system files written to', OUT);
fs.readdirSync(OUT).sort().forEach(f => console.log(' -', f));
