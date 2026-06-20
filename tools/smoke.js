const { layout } = require('./lib/type');
const { hexPath, mCenterline } = require('./lib/marks');
const { renderToPng } = require('./lib/render');

const hex = hexPath(150,150,120,22);
const box = {l:108,r:192,t:96,b:210};
const m = mCenterline(box,0.55);
const wm = layout([{text:'Men',color:'#FFFFFF'},{text:'tor',color:'#F2A623'},{text:'que',color:'#FFFFFF'}],'Montserrat-ExtraBold.ttf',64,-0.01);
let runs = wm.runs.map(r=>`<path transform="translate(330,180)" d="${r.d}" fill="${r.color}"/>`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
<defs>
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fdfdfd"/><stop offset="0.5" stop-color="#c7ccd4"/><stop offset="0.52" stop-color="#9aa1ab"/><stop offset="1" stop-color="#e9ecf1"/>
</linearGradient>
<filter id="sh" x="-40%" y="-40%" width="180%" height="180%">
<feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/>
</filter>
</defs>
<rect width="900" height="300" fill="#16181D"/>
<path d="${hex}" fill="url(#chrome)" filter="url(#sh)"/>
<path d="${m}" fill="none" stroke="#16181D" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
${runs}
</svg>`;
require('fs').writeFileSync('smoke.svg', svg);
renderToPng(svg, 'out/smoke.png', 1800);
console.log('wordmark width:', wm.width.toFixed(1), 'ascent', wm.ascent.toFixed(1));
console.log('OK');
