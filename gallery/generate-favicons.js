/**
 * generate-favicons.js
 * Genera il set completo di favicon da un'immagine sorgente (via sharp).
 *
 * Usage:
 *   node generate-favicons.js [sorgente]
 *   default sorgente: images/series-1/01.jpg (crop quadrato centrale)
 *
 * Output in favicon/:
 *   favicon-16.png, favicon-32.png, apple-touch-icon.png (180),
 *   icon-192.png, icon-512.png
 *
 * I <link> corrispondenti sono già in index.html.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = process.argv[2] || 'images/series-1/01.jpg';
const OUT_DIR = path.join(ROOT, 'favicon');

const SIZES = [
  { file: 'favicon-16.png', px: 16 },
  { file: 'favicon-32.png', px: 32 },
  { file: 'apple-touch-icon.png', px: 180 },
  { file: 'icon-192.png', px: 192 },
  { file: 'icon-512.png', px: 512 },
];

async function main() {
  const src = path.resolve(ROOT, SRC);
  if (!fs.existsSync(src)) { console.error(`Sorgente non trovata: ${src}`); process.exit(1); }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const { file, px } of SIZES) {
    await sharp(src)
      .resize(px, px, { fit: 'cover', position: 'attention' }) // crop sul soggetto
      .png()
      .toFile(path.join(OUT_DIR, file));
    console.log(`  ✓ favicon/${file} (${px}×${px})`);
  }
  console.log('\nFatto. Ricorda di committare la cartella favicon/.');
}

main().catch(err => { console.error(err); process.exit(1); });
