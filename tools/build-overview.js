// build-overview.js — one board presenting the full logo system.
const fs = require('fs');
const { C, G, markBare, appIcon, wordmark, squirclePath } = require('./lib/brand');
const { capHeight, layout } = require('./lib/type');
const { renderToPng } = require('./lib/render');
const FONT = 'Montserrat-ExtraBold.ttf';

const txt = (s, font, size, color, track = 0) => {
  const l = layout([{ text: s, color }], font, size, track);
  return { d: l.runs[0].d, w: l.width };
};

function lockupBody(theme, markPx) {
  const base = theme === 'dark' ? C.white : C.ink;
  const hexVisH = markPx * (2 * G.R * Math.sin(Math.PI / 3) / 300);
  const fsz = (hexVisH * 0.92) / capHeight(FONT, 100) * 100;
  const capH = capHeight(FONT, fsz);
  const wm = wordmark(FONT, fsz, { base, accent: C.amber, track: -0.012 });
  const gap = markPx * 0.10, wmX = markPx + gap, baseline = markPx / 2 + capH / 2;
  return { body: `<g transform="scale(${markPx / 300})">${markBare(C.amber)}</g><g transform="translate(${wmX},${baseline})">${wm.runs}</g>`, w: wmX + wm.width, h: markPx };
}

const BW = 1680, pad = 80;
let y = 0; const blocks = [];
const label = (s, x, yy, color = C.mute) => { const t = txt(s, 'Montserrat-SemiBold.ttf', 18, color, 0.02); return `<g transform="translate(${x},${yy})"><path d="${t.d}" fill="${color}"/></g>`; };

// Header
const h1 = txt('Sistema de logo', 'Montserrat-Bold.ttf', 44, C.white, -0.01);
const h2 = txt('Marca oficial Mentorque + wordmark Montserrat. Âmbar como fio condutor; "tor" destacado.', 'Montserrat-Medium.ttf', 21, C.mute);

// Section 1: lockups (dark card + light card side by side)
const secY = pad + 120;
const cardW = (BW - pad * 2 - 36) / 2, cardH = 280;
const Ld = lockupBody('dark', 150), Ll = lockupBody('light', 150);
const scaleFit = (L, maxW) => Math.min(1, (maxW - 120) / L.w);
const sd = scaleFit(Ld, cardW), sl = scaleFit(Ll, cardW);
let s1 = '';
s1 += `<rect x="${pad}" y="${secY}" width="${cardW}" height="${cardH}" rx="22" fill="${C.graphite}"/>`;
s1 += `<g transform="translate(${pad + 60},${secY + (cardH - Ld.h * sd) / 2}) scale(${sd})">${Ld.body}</g>`;
s1 += label('Lockup · fundo escuro', pad + 24, secY + cardH - 22, C.mute2);
const x2 = pad + cardW + 36;
s1 += `<rect x="${x2}" y="${secY}" width="${cardW}" height="${cardH}" rx="22" fill="${C.cream}"/>`;
s1 += `<g transform="translate(${x2 + 60},${secY + (cardH - Ll.h * sl) / 2}) scale(${sl})">${Ll.body}</g>`;
s1 += label('Lockup · fundo claro', x2 + 24, secY + cardH - 22, '#9A968B');

// Section 2: app icons + small proofs
const sec2Y = secY + cardH + 60;
let s2 = label('App icon (squircle iOS) e provas de tamanho', pad, sec2Y - 18, C.mute);
const icons = [['dark', 'escuro'], ['light', 'claro'], ['amber', 'âmbar']];
let ix = pad;
icons.forEach(([th, lbl]) => {
  const sz = 150;
  if (th === 'light') s2 += `<rect x="${ix - 0}" y="${sec2Y}" width="${sz}" height="${sz}" rx="33" fill="none"/>`;
  s2 += `<g transform="translate(${ix},${sec2Y})">${appIcon(sz, th)}</g>`;
  s2 += label(lbl, ix + 4, sec2Y + sz + 26, C.mute2);
  ix += sz + 36;
});
// small sizes row
ix += 20;
const small = [[60, '60'], [40, '40'], [32, '32·solid']];
let sx = ix, baseY = sec2Y + 150 - 60;
small.forEach(([sz, lbl]) => {
  const solid = String(lbl).includes('solid');
  s2 += `<g transform="translate(${sx},${baseY})">${appIcon(sz, 'dark', { solid })}</g>`;
  s2 += label(lbl, sx, baseY + sz + 18, C.mute2);
  sx += sz + 34;
});
// favicon proof at true 16/32
s2 += label('favicon', sx + 6, baseY + 18, C.mute2);
s2 += `<g transform="translate(${sx},${baseY + 30})">${appIcon(32, 'dark', { solid: true })}</g>`;
s2 += `<g transform="translate(${sx + 44},${baseY + 46})">${appIcon(16, 'dark', { solid: true })}</g>`;

// Section 3: monochrome + palette
const sec3Y = sec2Y + 150 + 90;
let s3 = label('Monocromático (1 cor) e paleta', pad, sec3Y - 18, C.mute);
// mono chips
const mono = [
  ['#16181D on light', C.cream, C.ink],
  ['cream on graphite', C.graphite, C.cream],
  ['amber on graphite', C.graphite, C.amber],
];
let mx = pad;
mono.forEach(([lbl, bg, col]) => {
  s3 += `<rect x="${mx}" y="${sec3Y}" width="150" height="150" rx="20" fill="${bg}"/>`;
  s3 += `<g transform="translate(${mx + 18},${sec3Y + 18}) scale(${114 / 300})">${markBare(col)}</g>`;
  mx += 150 + 24;
});
// palette swatches
const pal = [['Grafite', C.graphite, '#16181D'], ['Âmbar', C.amber, '#F2A623'], ['Teal', C.teal, '#0F8A66'], ['Coral', C.coral, '#C24D26'], ['Branco', C.white, '#FFFFFF']];
let px = mx + 30, pyT = sec3Y;
pal.forEach(([nm, col, hex]) => {
  s3 += `<rect x="${px}" y="${pyT}" width="86" height="86" rx="14" fill="${col}" stroke="#2A2E36" stroke-width="1"/>`;
  s3 += `<g transform="translate(${px},${pyT + 104})"><path d="${txt(nm, 'Montserrat-SemiBold.ttf', 16, C.white).d}" fill="${C.white}"/></g>`;
  s3 += `<g transform="translate(${px},${pyT + 126})"><path d="${txt(hex, 'Montserrat-Medium.ttf', 13, C.mute2).d}" fill="${C.mute2}"/></g>`;
  px += 86 + 18;
});

const BH = sec3Y + 200 + pad;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">
  <rect width="${BW}" height="${BH}" fill="#0E0F12"/>
  <g transform="translate(${pad},${pad})"><path d="${h1.d}" fill="${C.white}"/></g>
  <g transform="translate(${pad},${pad + 38})"><path d="${h2.d}" fill="${C.mute}"/></g>
  ${s1}${s2}${s3}
</svg>`;
fs.writeFileSync('out/system-overview.svg', svg);
renderToPng(svg, 'out/system-overview.png', BW * 1.4);
console.log('overview', BW, 'x', BH);
