/**
 * export-social.js — M12
 * Genera da manifest.json i contenuti Instagram-ready per @humanfrequency.project:
 *
 *   social/<serie>-<nn>.jpg   → 1080×1350 (4:5), opera intera su fondo passe-partout
 *   social/<serie>-<nn>.txt   → caption pronta: titolo, serie·luogo·anno, riga storia
 *                               da completare, CTA, hashtag a rotazione + geo tag
 *
 * Usage:
 *   node export-social.js                  → tutte le opere
 *   node export-social.js series-1         → solo una serie
 *   node export-social.js --bg black       → passe-partout scuro (default: white)
 *   node export-social.js --force          → rigenera anche i file esistenti
 *
 * NOTE:
 *   - Mai pubblicare i 3000px: questo export è l'UNICA versione per i social.
 *   - La cartella social/ VA pushata nel repo: la Graph API scarica i media
 *     da URL pubblico (raw.githubusercontent) — vedi publish-instagram.js.
 *   - I .txt sono di consultazione; le caption operative stanno in
 *     social-queue.json (build-queue.js + stories.json).
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'social');
const W = 1080, H = 1350;            // 4:5 — formato feed che occupa più schermo
const QUALITY = 90;
const PAD = 54;                      // passe-partout minimo (5% di 1080)

// ── Hashtag (da docx/SOCIAL-KIT.md) — 3 set a rotazione ──
const HASHTAG_SETS = [
  '#fineart #fineartprints #blackandwhite #monochrome #bnw_greatshots #visualart #contemporaryart #artcollector #limitededition #printsforsale',
  '#humanstories #portraiture #visualnarrative #documentaryart #peopleoftheworld #monochromatic #bnwmood #artoftheday #emergingartist',
  '#artprint #wallart #fineartcollector #blackandwhiteart #figurativeart #artforsale #interiorart #gicleeprint #editionprint',
];

const CTA = 'Limited edition prints — link in bio';

function geoTag(meta) {
  // "São Paulo · 1989" → "#saopaulo"
  if (!meta) return '';
  const city = meta.split('·')[0].trim();
  if (!city) return '';
  const slug = city.normalize('NFD').replace(/[̀-ͯ]/g, '') // rimuovi accenti
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  return slug ? '#' + slug : '';
}

function caption(img, series, idx) {
  const tags = HASHTAG_SETS[idx % HASHTAG_SETS.length];
  const geo = geoTag(img.meta);
  return `${img.title || ''}
${[series.title, img.meta].filter(Boolean).join(' · ')}

[storia: 1-3 righe — la sensazione dietro l'immagine, mai il medium]

${CTA}
.
.
.
${tags}${geo ? ' ' + geo : ''}
`;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const bgIdx = args.indexOf('--bg');
  const bgName = bgIdx >= 0 ? args[bgIdx + 1] : 'white';
  const bg = bgName === 'black' ? { r: 13, g: 13, b: 13 } : { r: 255, g: 255, b: 255 };
  const seriesFilter = args.filter(a => /^series-/.test(a));

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let made = 0, skipped = 0, counter = 0;
  for (const s of manifest.series || []) {
    if (seriesFilter.length && !seriesFilter.includes(s.id)) continue;
    console.log(`\n${s.id} (${s.title || ''})`);

    for (const img of s.images || []) {
      const base = path.parse(img.filename).name;
      const slug = `${s.id}-${base}`;
      const jpgOut = path.join(OUT_DIR, slug + '.jpg');
      const txtOut = path.join(OUT_DIR, slug + '.txt');
      const src = path.join(ROOT, img.filename);
      const idx = counter++;

      if (!fs.existsSync(src)) { console.log(`  ! mancante: ${img.filename}`); continue; }
      if (fs.existsSync(jpgOut) && !force) { skipped++; continue; }

      // Opera intera dentro il 4:5, passe-partout uniforme
      await sharp(src)
        .resize(W - PAD * 2, H - PAD * 2, { fit: 'inside', withoutEnlargement: false })
        .extend({ top: 0, bottom: 0, left: 0, right: 0 })
        .toBuffer()
        .then(buf => sharp(buf).metadata().then(m =>
          sharp({ create: { width: W, height: H, channels: 3, background: bg } })
            .composite([{ input: buf, left: Math.round((W - m.width) / 2), top: Math.round((H - m.height) / 2) }])
            .jpeg({ quality: QUALITY, chromaSubsampling: '4:4:4' })
            .toFile(jpgOut)
        ));

      fs.writeFileSync(txtOut, caption(img, s, idx));
      console.log(`  ✓ ${slug}.jpg + .txt`);
      made++;
    }
  }

  console.log(`\nFatto: ${made} generati, ${skipped} già esistenti (usa --force per rigenerare).`);
  console.log('Prossimo passo: completa la riga [storia] nei .txt, poi programma in Meta Business Suite.');
}

main().catch(err => { console.error(err); process.exit(1); });
