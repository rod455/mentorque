// type.js — convert a string to outlined SVG path data using opentype.js.
// Supports custom tracking (letter-spacing) and per-letter coloring so we can
// treat the shared "tor" of men-TOR-que in the amber accent.
const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

const FONT_DIR = path.join(__dirname, '..', 'fonts');
const cache = {};
function font(file) {
  if (!cache[file]) {
    const buf = fs.readFileSync(path.join(FONT_DIR, file));
    cache[file] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return cache[file];
}

// Lay out a string. Returns { runs: [{d, color}], width, ascent, descent }
// segments: array of { text, color } so we can color the pun.
// tracking is in em units (e.g. 0.02 = 2% of font size) added between glyphs.
function layout(segments, fontFile, fontSize, tracking = 0) {
  const f = font(fontFile);
  const scale = fontSize / f.unitsPerEm;
  const track = tracking * fontSize;
  let x = 0;
  const runs = [];
  const n = v => Number(v.toFixed(3));
  for (const seg of segments) {
    let d = '';
    for (const ch of seg.text) {
      const glyph = f.charToGlyph(ch);
      const gp = glyph.getPath(x, 0, fontSize); // baseline at y=0
      for (const c of gp.commands) {
        if (c.type === 'M') d += `M ${n(c.x)} ${n(c.y)} `;
        else if (c.type === 'L') d += `L ${n(c.x)} ${n(c.y)} `;
        else if (c.type === 'C') d += `C ${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)} `;
        else if (c.type === 'Q') d += `Q ${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)} `;
        else if (c.type === 'Z') d += 'Z ';
      }
      x += glyph.advanceWidth * scale + track;
    }
    runs.push({ d: d.trim(), color: seg.color });
  }
  const ascent = f.ascender * scale;
  const descent = f.descender * scale; // negative
  return { runs, width: x - track, ascent, descent };
}

// Cap height for vertical centering of all-caps or measuring.
function capHeight(fontFile, fontSize) {
  const f = font(fontFile);
  const os2 = f.tables.os2;
  const ch = (os2 && os2.sCapHeight) ? os2.sCapHeight : f.ascender * 0.7;
  return ch * (fontSize / f.unitsPerEm);
}
function xHeight(fontFile, fontSize) {
  const f = font(fontFile);
  const os2 = f.tables.os2;
  const xh = (os2 && os2.sxHeight) ? os2.sxHeight : f.ascender * 0.5;
  return xh * (fontSize / f.unitsPerEm);
}

module.exports = { layout, capHeight, xHeight, font };
