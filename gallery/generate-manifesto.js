/**
 * generate-manifesto.js
 * Genera l'immagine tipografica del post manifesto (launch-9):
 * claim su fondo #0d0d0d, Hanken Grotesk, 1080×1350 (4:5).
 * Output: social/launch-9-manifesto.jpg
 *
 * Usa ffmpeg con fontfile= diretto (fonts/HankenGrotesk.ttf): su Windows
 * sharp/libvips ignora i font non installati nel sistema (fontconfig custom
 * non rispettato), ffmpeg invece carica il TTF dal path senza dipendenze.
 *
 * Requisiti: ffmpeg nel PATH. Usage: node generate-manifesto.js
 */

const { execFileSync } = require('child_process');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'social', 'launch-9-manifesto.jpg');
// path relativo con forward slash: evita l'escaping del drive (g\:) in drawtext
const FONT = 'fonts/HankenGrotesk.ttf';

const W = 1080, H = 1350;

// tracking manuale per la riga piccola (drawtext non ha letter-spacing)
const SUB = 'H U M A N   F R E Q U E N C Y   ·   2 0 2 6';

const draw = [
  `drawtext=fontfile='${FONT}':text='A journey through':fontsize=64:fontcolor=0xf5f5f5:x=(w-text_w)/2:y=${H / 2 - 96}`,
  `drawtext=fontfile='${FONT}':text='the possible':fontsize=64:fontcolor=0xf5f5f5:x=(w-text_w)/2:y=${H / 2 - 12}`,
  `drawtext=fontfile='${FONT}':text='${SUB}':fontsize=20:fontcolor=0x9a9a9a:x=(w-text_w)/2:y=${H / 2 + 124}`,
].join(',');

execFileSync('ffmpeg', [
  '-y', '-f', 'lavfi', '-i', `color=c=0x0d0d0d:s=${W}x${H}:d=1`,
  '-vf', draw,
  '-frames:v', '1', '-q:v', '2',
  OUT,
], { cwd: ROOT, stdio: ['ignore', 'inherit', 'pipe'] });

console.log('✓ ' + path.relative(ROOT, OUT));
