// build-web-assets.js — emit transparent, web-ready brand assets for the LP.
const fs = require('fs');
const path = require('path');
const { C, G, markBare, appIcon, wordmark, squirclePath } = require('./lib/brand');
const { capHeight } = require('./lib/type');
const { renderToPng } = require('./lib/render');
const FONT = 'Montserrat-ExtraBold.ttf';

const PUB = path.join(__dirname, '..', 'public');
const LOGODIR = path.join(PUB, 'logo');
const APP = path.join(__dirname, '..', 'app');
fs.mkdirSync(LOGODIR, { recursive: true });

const SVG = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"${extra}>${body}</svg>`;
const write = (p, s) => { fs.writeFileSync(p, s); };

// ---- transparent horizontal lockup ----
function lockupSVG(theme) {
  const base = theme === 'dark' ? C.white : C.ink;
  const markPx = 100;
  const hexVisH = markPx * (2 * G.R * Math.sin(Math.PI / 3) / 300);
  const fsz = (hexVisH * 0.95) / capHeight(FONT, 100) * 100;
  const capH = capHeight(FONT, fsz);
  const wm = wordmark(FONT, fsz, { base, accent: C.amber, track: -0.012 });
  const gap = markPx * 0.12, wmX = markPx + gap, baseline = markPx / 2 + capH / 2;
  const w = Math.ceil(wmX + wm.width) + 4, h = markPx;
  const body = `<g transform="scale(${markPx / 300})">${markBare(C.amber)}</g><g transform="translate(${wmX},${baseline})">${wm.runs}</g>`;
  return SVG(w, h, body);
}
write(path.join(LOGODIR, 'lockup-dark.svg'), lockupSVG('dark'));
write(path.join(LOGODIR, 'lockup-light.svg'), lockupSVG('light'));

// ---- bare mark (amber, transparent) ----
write(path.join(LOGODIR, 'mark.svg'), SVG(300, 300, markBare(C.amber)));
write(path.join(LOGODIR, 'mark-graphite.svg'), SVG(300, 300, markBare(C.graphite)));

// ---- subtle hexagon tiling motif (very low contrast, for backgrounds) ----
(() => {
  // single bolt-head hex outline, tiled; near-transparent stroke
  const { hexPath } = require('./lib/marks');
  const tile = 220, cx = tile / 2, cy = tile / 2, R = 86;
  const hex = hexPath(cx, cy, R, 14);
  const body = `<path d="${hex}" fill="none" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="2.5"/>`;
  write(path.join(LOGODIR, 'hex-pattern.svg'), SVG(tile, tile, body));
})();

// ---- favicon (solid hex, amber on graphite) as app/icon.svg ----
const favicon = SVG(64, 64,
  `<rect width="64" height="64" rx="14" fill="${C.graphite}"/>` +
  `<g transform="translate(3,3) scale(${58 / 300})">${markBare(C.amber, { solid: true, knock: C.graphite })}</g>`);
write(path.join(APP, 'icon.svg'), favicon);
write(path.join(LOGODIR, 'favicon.svg'), favicon);

// apple touch icon 180 (dark squircle + amber mark)
const apple = SVG(180, 180, appIcon(180, 'dark'));
renderToPng(apple, path.join(APP, 'apple-icon.png'), 180);

// ---- Open Graph image 1200x630 ----
(() => {
  const W = 1200, H = 630;
  const markPx = 132;
  const hexVisH = markPx * (2 * G.R * Math.sin(Math.PI / 3) / 300);
  const fsz = (hexVisH * 0.95) / capHeight(FONT, 100) * 100;
  const capH = capHeight(FONT, fsz);
  const wm = wordmark(FONT, fsz, { base: C.white, accent: C.amber, track: -0.012 });
  const gap = markPx * 0.12, wmX = markPx + gap, baseline = markPx / 2 + capH / 2;
  const lockW = wmX + wm.width;
  const { layout } = require('./lib/brand');
  const head = layout([{ text: 'Aprenda mecânica com um', color: C.white }], 'Montserrat-Bold.ttf', 58, -0.01);
  const head2a = layout([{ text: 'especialista ', color: C.white }], 'Montserrat-Bold.ttf', 58, -0.01);
  const head2b = layout([{ text: 'no bolso.', color: C.amber }], 'Montserrat-Bold.ttf', 58, -0.01);
  const sub = layout([{ text: 'Do básico ao avançado · consultoria especializada · iOS e Android', color: '#AEB5C0' }], 'Montserrat-Medium.ttf', 26, 0);
  const pad = 84;
  const body =
    `<rect width="${W}" height="${H}" fill="${C.graphite}"/>` +
    `<rect width="${W}" height="${H}" fill="url(#g)"/>` +
    `<defs><radialGradient id="g" cx="0.8" cy="0.1" r="0.9"><stop offset="0" stop-color="#F2A623" stop-opacity="0.10"/><stop offset="0.5" stop-color="#F2A623" stop-opacity="0"/></radialGradient></defs>` +
    `<g transform="translate(${pad},${pad - 10}) scale(${markPx / 300})">${markBare(C.amber)}</g>` +
    `<g transform="translate(${pad + markPx + 26},${pad - 10 + markPx / 2 + capH / 2})">${wm.runs}</g>` +
    `<g transform="translate(${pad},300)"><path d="${head.runs[0].d}" fill="${C.white}"/></g>` +
    `<g transform="translate(${pad},370)"><path d="${head2a.runs[0].d}" fill="${C.white}"/><g transform="translate(${head2a.width},0)"><path d="${head2b.runs[0].d}" fill="${C.amber}"/></g></g>` +
    `<g transform="translate(${pad},470)"><path d="${sub.runs[0].d}" fill="#AEB5C0"/></g>`;
  const svg = SVG(W, H, body);
  write(path.join(PUB, 'og-image.svg'), svg);
  renderToPng(svg, path.join(PUB, 'og-image.png'), W);
})();

console.log('web assets written to /public/logo, /public, /app');
