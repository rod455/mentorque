// render.js — rasterize an SVG string to PNG with resvg, loading our fonts.
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const FONT_DIR = path.join(__dirname, '..', 'fonts');
const fontFiles = fs.readdirSync(FONT_DIR)
  .filter(f => f.endsWith('.ttf'))
  .map(f => path.join(FONT_DIR, f));

function renderToPng(svg, outPath, width) {
  const resvg = new Resvg(svg, {
    font: { fontFiles, loadSystemFonts: false },
    fitTo: width ? { mode: 'width', value: width } : { mode: 'original' },
    background: 'rgba(0,0,0,0)',
  });
  const png = resvg.render().asPng();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  return outPath;
}
module.exports = { renderToPng };
