/**
 * generate-thumbs.js
 * Genera thumbnail WebP 600px per tutte le immagini nelle cartelle series-N.
 *
 * Usage:
 *   node generate-thumbs.js              → processa tutte le serie
 *   node generate-thumbs.js series-1     → solo una serie
 *
 * Le thumbnail vengono salvate in images/<serie>/thumbs/<filename>.webp
 * Salta i file già esistenti (non rigenera).
 */

const sharp  = require('sharp');
const fs     = require('fs');
const path   = require('path');

const IMAGES_DIR   = path.join(__dirname, 'images');
const THUMB_WIDTH  = 600;
const THUMB_QUALITY = 82; // WebP quality (0-100)

async function processDir(serieDir) {
  const thumbDir = path.join(serieDir, 'thumbs');
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

  const files = fs.readdirSync(serieDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  if (files.length === 0) { console.log(`  No images found in ${serieDir}`); return; }

  let created = 0, skipped = 0;
  for (const file of files) {
    const baseName  = path.parse(file).name;
    const outFile   = path.join(thumbDir, baseName + '.webp');
    if (fs.existsSync(outFile)) { skipped++; continue; }

    await sharp(path.join(serieDir, file))
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(outFile);
    console.log(`  ✓ ${file} → thumbs/${baseName}.webp`);
    created++;
  }
  console.log(`  ${created} created, ${skipped} already exist.`);
}

async function main() {
  const targetSerie = process.argv[2]; // optional: "series-1"

  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.startsWith('series-'))
    .map(e => e.name);

  if (entries.length === 0) {
    console.error('No series-* directories found in images/');
    process.exit(1);
  }

  const toProcess = targetSerie ? entries.filter(e => e === targetSerie) : entries;
  if (toProcess.length === 0) {
    console.error(`Series "${targetSerie}" not found.`);
    process.exit(1);
  }

  for (const serie of toProcess) {
    console.log(`\nProcessing ${serie}/`);
    await processDir(path.join(IMAGES_DIR, serie));
  }
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
