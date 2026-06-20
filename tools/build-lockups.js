// build-lockups.js — typography comparison board for the three directions.
const fs = require('fs');
const { C, defs, DIRECTIONS, appIcon, wordmark, layout } = require('./lib/system');
const { renderToPng } = require('./lib/render');

const BW = 1680, pad = 72, rowH = 250, gap = 8;
const top = pad + 130;
const BH = top + 3 * rowH + 60;

let body = '';
let y = top;
for (const key of ['A', 'B', 'C']) {
  const spec = DIRECTIONS[key];
  // label
  const lab = layout([{ text: spec.name, color: C.mute }], 'Montserrat-SemiBold.ttf', 20, 0);
  body += `<g transform="translate(${pad},${y + 30})"><path d="${lab.runs[0].d}" fill="${C.mute}"/></g>`;
  // lockup: icon + wordmark, vertically centered in row
  const iconSize = 120;
  const cy = y + rowH / 2 + 8;
  body += `<g transform="translate(${pad},${cy - iconSize / 2})">${appIcon(spec, iconSize, 'dark')}</g>`;
  const fsize = 96;
  const wm = wordmark(spec, fsize, 'dark');
  const wx = pad + iconSize + 46;
  const wy = cy + fsize * 0.34;
  body += `<g transform="translate(${wx},${wy})">${wm.runs}</g>`;
  // subtle divider via tint block (no stripe): faint rounded panel behind each row alternating
  if (y > top) {} // none
  y += rowH + gap;
}

// header
const h1 = layout([{ text: 'Wordmark & lockup', color: C.white }], 'Montserrat-Bold.ttf', 42, -0.01);
const h2 = layout([{ text: 'Mesma palavra, três personalidades tipográficas. O "tor" de men·TOR·que sai no âmbar nas três.', color: C.mute }], 'Montserrat-Medium.ttf', 21, 0);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">
  ${defs()}
  <rect width="${BW}" height="${BH}" fill="${C.graphite}"/>
  <rect width="${BW}" height="${BH}" fill="url(#spec)" opacity="0.04"/>
  <g transform="translate(${pad},${pad + 8})"><path d="${h1.runs[0].d}" fill="${C.white}"/></g>
  <g transform="translate(${pad},${pad + 46})"><path d="${h2.runs[0].d}" fill="${C.mute}"/></g>
  ${body}
</svg>`;
fs.writeFileSync('out/lockups.svg', svg);
renderToPng(svg, 'out/lockups.png', BW * 1.4);
console.log('lockups ->', BW, 'x', BH);
