/**
 * update-manifest.js
 * Aggiorna manifest.json in modo NON distruttivo:
 *   - Preserva titoli/descrizioni esistenti per le immagini già presenti
 *   - Aggiunge scaffold (placeholder) per le immagini nuove
 *   - Rimuove entries per immagini che non esistono più
 *   - Preserva le sezioni about, seo, site invariate
 *   - Gestisce tutte le directory series-* trovate in images/
 *
 * Usage:
 *   node update-manifest.js
 */

const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const IMAGES_DIR    = path.join(__dirname, 'images');
const IMAGE_EXTS    = /\.(jpg|jpeg|png)$/i;

// Load or create manifest
let manifest = {};
if (fs.existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} else {
  manifest = {
    site:   { name: 'Andrea Spinazzola', hero: { seriesId: 'series-1', interval: 5000 } },
    about:  { photo: 'images/AS_BW_PORTRAIT_02.png', name: 'Andrea\nSpinazzola', bio: '', email: '', instagram: '', instagramHandle: '' },
    seo:    { title: 'Andrea Spinazzola', description: '', ogImage: '' },
    series: []
  };
}

// Ensure top-level sections exist (migration from old format)
if (!manifest.about) manifest.about = { photo: '', name: '', bio: '', email: '', instagram: '', instagramHandle: '' };
if (!manifest.seo)   manifest.seo   = { title: '', description: '', ogImage: '' };

// Scan all series-* directories
const seriesDirs = fs.existsSync(IMAGES_DIR)
  ? fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith('series-'))
      .map(e => e.name)
      .sort()
  : [];

if (seriesDirs.length === 0) {
  console.error('Nessuna cartella series-* trovata in images/');
  process.exit(1);
}

const existingSeriesMap = Object.fromEntries((manifest.series || []).map(s => [s.id, s]));
const updatedSeries = [];

async function run() {
for (const dirName of seriesDirs) {
  const seriesId  = dirName; // e.g. "series-1"
  const seriesDir = path.join(IMAGES_DIR, dirName);

  // Scan image files (exclude thumbs/ subdirectory)
  const files = fs.readdirSync(seriesDir)
    .filter(f => IMAGE_EXTS.test(f) && !f.startsWith('.'))
    .sort();

  if (files.length === 0) continue;

  const existing = existingSeriesMap[seriesId] || {};
  const existingImgMap = Object.fromEntries((existing.images || []).map(img => [img.filename, img]));

  // Auto-generate series number label (e.g. "series-1" → "I")
  const seriesNum = parseInt(dirName.replace('series-', ''), 10) || 1;
  const romanNumerals = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const roman = romanNumerals[seriesNum - 1] || String(seriesNum);

  const images = [];
  for (let idx = 0; idx < files.length; idx++) {
    const file     = files[idx];
    const filename = `images/${dirName}/${file}`;
    const thumb    = `images/${dirName}/thumbs/${path.parse(file).name}.webp`;
    const prev     = existingImgMap[filename] || {};
    const num      = String(idx + 1).padStart(2, '0');

    // Dimensioni reali (w/h): preservate se già presenti, altrimenti lette dal file.
    // Usate da index.html/PhotoSwipe per evitare il preload di tutte le thumbnail.
    let w = prev.w, h = prev.h;
    if (!w || !h) {
      try {
        const meta = await sharp(path.join(seriesDir, file)).metadata();
        w = meta.width; h = meta.height;
      } catch (e) {
        console.warn(`  ⚠️  impossibile leggere dimensioni di ${filename}: ${e.message}`);
        w = w || 0; h = h || 0;
      }
    }

    images.push({
      filename,
      thumb,
      w,
      h,
      title:       prev.title       || `Opera ${num}`,
      description: prev.description || `Opera ${num} della serie ${existing.title || dirName}`,
      meta:        prev.meta        || '2024 · AI Generative'
    });
  }

  updatedSeries.push({
    id:       seriesId,
    title:    existing.title    || `Series ${roman}`,
    subtitle: existing.subtitle || `Series ${roman} · AI Generative · 2024`,
    images
  });

  const added   = images.filter(i => !existingImgMap[i.filename]).length;
  const removed = Object.keys(existingImgMap).filter(k => !images.find(i => i.filename === k)).length;
  console.log(`${seriesId}: ${files.length} immagini totali (+${added} nuove, -${removed} rimosse)`);
}

manifest.series = updatedSeries;

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log('\n✅ manifest.json aggiornato.');
console.log('   ⚠️  Ricordati di editare titoli/descrizioni in manifest.json per le nuove immagini.');
}

run().catch(err => { console.error(err); process.exit(1); });
