/**
 * generate-reels.js
 * Genera i video dei Reel di lancio (specifiche: docx/LAUNCH-POSTS.md).
 * Output: social/reels/<id>.mp4 — 1080×1920 (9:16), 30fps, H.264, senza audio
 * (la musica la aggiunge l'autore dall'app Instagram al caricamento).
 *
 * Ken Burns: zoom lento dal totale verso il punto focale, testo overlay con
 * fade temporizzato, chiusura su nero con l'handle.
 * Due modalità per il 9:16:
 *   - letterbox: opere ORIZZONTALI — si parte dall'opera intera su fondo
 *     scuro e lo zoom entra fin dentro il soggetto
 *   - cover: opere VERTICALI — full-bleed (crop laterale minimo), focus
 *     espresso in frazioni del canvas già croppato
 * Font via fontfile= diretto (vedi nota in generate-manifesto.js).
 *
 * Requisiti: ffmpeg nel PATH. Usage: node generate-reels.js [id]
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'social', 'reels');
const FONT = 'fonts/HankenGrotesk.ttf';
const FPS = 30;
const CARD_SECONDS = 1.6; // chiusura su nero con handle
const BG = '0x0d0d0d';

// alpha drawtext: fade-in a from, fade-out a to (0.6s di rampa)
function fadeWindow(from, to) {
  if (to === null) return `min(1\\,max(0\\,(t-${from})/0.6))`;
  return `if(lt(t\\,${from})\\,0\\,if(lt(t\\,${from + 0.6})\\,(t-${from})/0.6\\,if(lt(t\\,${to - 0.6})\\,1\\,if(lt(t\\,${to})\\,(${to}-t)/0.6\\,0))))`;
}

const REELS = [
  {
    // Oracle: opera orizzontale 3000×2001 — letterbox, zoom dal totale al volto
    id: 'launch-4-oracle',
    source: 'images/series-2/10.jpg',
    mode: 'letterbox',
    seconds: 10,
    zoomTo: 3.2,
    focus: { x: 0.5, y: 0.5 }, // volto al centro del canvas letterbox
    texts: [
      { text: 'Oracle — Salvador, 1982', size: 46, y: 0.84, from: 2, to: null },
    ],
  },
  {
    // The Gaze: opera verticale 2001×3000 — full-bleed, zoom estremo sull'occhio
    id: 'launch-8-look-closer',
    source: 'images/series-2/13.jpg',
    mode: 'cover',
    seconds: 13,
    zoomTo: 5, // fino alla grana/pixel, come lo zoom 1:1 del sito
    focus: { x: 0.34, y: 0.30 }, // l'occhio sinistro (frazioni del canvas croppato)
    texts: [
      { text: 'Look closer.', size: 52, y: 0.78, from: 2, to: 4.8 },
      { text: 'Closer.', size: 52, y: 0.78, from: 5.2, to: 8 },
      { text: 'What do you see?', size: 52, y: 0.78, from: 9, to: null },
    ],
  },
];

const only = process.argv[2];
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const r of REELS) {
  if (only && !r.id.includes(only)) continue;
  const frames = r.seconds * FPS;
  const out = path.join(OUT_DIR, r.id + '.mp4');

  // preparazione canvas 9:16 prima dello zoompan
  const prep = r.mode === 'letterbox'
    // opera intera centrata su fondo scuro (canvas = larghezza opera × 16/9)
    ? `scale=3000:-2,pad=3000:5334:0:(oh-ih)/2:${BG}`
    // full-bleed: cover-crop sovracampionato per uno zoompan fluido
    : `scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840`;

  const drawTexts = r.texts.map(t =>
    `drawtext=fontfile=${FONT}:text='${t.text}':fontsize=${t.size}:fontcolor=0xf5f5f5` +
    `:alpha='${fadeWindow(t.from, t.to)}':x=(w-text_w)/2:y=h*${t.y}` +
    `:shadowcolor=black@0.55:shadowx=2:shadowy=2`
  ).join(',');

  const filter =
    `[0:v]${prep},` +
    `zoompan=z='1+${r.zoomTo - 1}*on/${frames - 1}'` +
    `:x='iw*${r.focus.x}-(iw/zoom)/2':y='ih*${r.focus.y}-(ih/zoom)/2'` +
    `:d=${frames}:s=1080x1920:fps=${FPS},` +
    drawTexts + ',' +
    `fade=t=out:st=${r.seconds - 0.6}:d=0.6,format=yuv420p,setsar=1[v0];` +
    // card di chiusura su nero con l'handle
    `[1:v]drawtext=fontfile=${FONT}:text='humanfrequency.project':fontsize=40:fontcolor=0xf5f5f5` +
    `:alpha='${fadeWindow(0.15, null)}':x=(w-text_w)/2:y=(h-text_h)/2,format=yuv420p,setsar=1[v1];` +
    `[v0][v1]concat=n=2:v=1:a=0[v]`;

  execFileSync('ffmpeg', [
    '-y',
    '-i', r.source,
    '-f', 'lavfi', '-t', String(CARD_SECONDS), '-i', `color=c=${BG}:s=1080x1920:r=${FPS}`,
    '-filter_complex', filter,
    '-map', '[v]',
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-movflags', '+faststart',
    out,
  ], { cwd: ROOT, stdio: ['ignore', 'inherit', 'pipe'] });

  const mb = (fs.statSync(out).size / 1048576).toFixed(1);
  console.log(`✓ ${path.relative(ROOT, out)} — ${r.seconds + CARD_SECONDS}s, ${mb}MB`);
}
