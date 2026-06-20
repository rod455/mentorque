// build-typecompare.js — the official mark + wordmark in the three typefaces.
const fs = require('fs');
const { C, G, markBare, wordmark } = require('./lib/brand');
const { capHeight, layout } = require('./lib/type');
const { renderToPng } = require('./lib/render');

const fonts = [
  ['Montserrat-ExtraBold.ttf', 'Montserrat · premium geométrica (recomendada)', -0.012],
  ['SairaSemiCondensed-Bold.ttf', 'Saira · industrial condensada', 0.0],
  ['Rajdhani-Bold.ttf', 'Rajdhani · motorsport técnica', 0.01],
];
const BW = 1500, pad = 80, rowH = 220;
const BH = pad * 2 + 80 + fonts.length * rowH;
let body = '';
let y = pad + 80;
for (const [font, name, track] of fonts) {
  const markPx = 150;
  const hexVisH = markPx * (2 * G.R * Math.sin(Math.PI / 3) / 300);
  const fsz = (hexVisH * 0.92) / capHeight(font, 100) * 100;
  const capH = capHeight(font, fsz);
  const wm = wordmark(font, fsz, { base: C.white, accent: C.amber, track });
  const gap = markPx * 0.10, wmX = markPx + gap, baseline = markPx / 2 + capH / 2;
  const lab = layout([{ text: name, color: C.mute }], 'Montserrat-SemiBold.ttf', 17, 0.01);
  body += `<g transform="translate(${pad},${y - 26})"><path d="${lab.runs[0].d}" fill="${C.mute}"/></g>`;
  body += `<g transform="translate(${pad},${y})"><g transform="scale(${markPx / 300})">${markBare(C.amber)}</g><g transform="translate(${wmX},${baseline})">${wm.runs}</g></g>`;
  y += rowH;
}
const h1 = layout([{ text: 'Wordmark — qual fonte?', color: C.white }], 'Montserrat-Bold.ttf', 40, -0.01);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">
  <rect width="${BW}" height="${BH}" fill="${C.graphite}"/>
  <g transform="translate(${pad},${pad + 4})"><path d="${h1.runs[0].d}" fill="${C.white}"/></g>
  ${body}</svg>`;
fs.writeFileSync('out/type-compare.svg', svg);
renderToPng(svg, 'out/type-compare.png', BW * 1.4);
console.log('typecompare done');
