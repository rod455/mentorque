// build-brand.js — faithful vector reproduction of the official Mentorque mark:
// amber outline hexagon (bolt head) + solid amber monoline "M" with round caps.
const fs = require('fs');
const { hexPath, mCenterline, squirclePath } = require('./lib/marks');
const { renderToPng } = require('./lib/render');

const AMBER = '#F2A623';
const GRAPHITE = '#16181D';

// Canonical mark on a 1024 canvas (matches the supplied artwork proportions).
function brandMark(amber = AMBER) {
  const cx = 512, cy = 512, R = 362, corner = 62;
  const hex = hexPath(cx, cy, R, corner);
  const hexStroke = 42;
  // M geometry (centerline of the monoline strokes)
  const box = { l: 402, r: 622, t: 398, b: 676 };
  const mWidth = 96, valley = 0.66;
  const m = mCenterline(box, valley);
  return `
    <path d="${hex}" fill="none" stroke="${amber}" stroke-width="${hexStroke}" stroke-linejoin="round"/>
    <path d="${m}" fill="none" stroke="${amber}" stroke-width="${mWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// 1) marca isolada on transparent (shown on white here for the proof)
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#FFFFFF"/>
  ${brandMark()}
</svg>`;
fs.writeFileSync('out/brand-mark-light.svg', markSvg);
renderToPng(markSvg, 'out/brand-mark-light.png', 512);

// 2) app icon: dark squircle + amber mark
const sq = squirclePath(512, 512, 1024, 5);
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <path d="${sq}" fill="${GRAPHITE}"/>
  ${brandMark()}
</svg>`;
fs.writeFileSync('out/brand-icon-dark.svg', iconSvg);
renderToPng(iconSvg, 'out/brand-icon-dark.png', 512);

// 3) side-by-side comparison board (their two refs recreated)
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="560" viewBox="0 0 1100 560">
  <rect width="1100" height="560" fill="#0E0F12"/>
  <g transform="translate(40,40) scale(0.46)"><rect width="1024" height="1024" rx="40" fill="#FFFFFF"/>${brandMark()}</g>
  <g transform="translate(580,40) scale(0.46)"><path d="${squirclePath(512,512,1024,5)}" fill="${GRAPHITE}"/>${brandMark()}</g>
</svg>`;
fs.writeFileSync('out/brand-compare.svg', board);
renderToPng(board, 'out/brand-compare.png', 1100);
console.log('brand mark rendered');
