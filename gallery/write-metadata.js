/**
 * write-metadata.js
 * Scrive metadata di paternità (EXIF/IPTC/XMP) in tutti i jpg + webp pubblicati,
 * SENZA ricompressione (lossless, via exiftool).
 *
 * Le informazioni vengono lette da manifest.json:
 *   - autore/contatti da `about` (fallback su valori di default)
 *   - titolo/serie/meta di ogni opera da `series[].images[]`
 *
 * Usage:
 *   node write-metadata.js              → tutte le serie
 *   node write-metadata.js series-1     → solo una serie
 *   node write-metadata.js --check images/series-1/01.jpg   → leggi i tag di un file
 *
 * Requisiti: npm install (dipendenza: exiftool-vendored)
 * Eseguire DOPO watermark.py (il watermark riscrive i pixel e azzera i metadata).
 */

const fs = require('fs');
const path = require('path');
const { exiftool } = require('exiftool-vendored');

const ROOT = __dirname;
const MANIFEST = path.join(ROOT, 'manifest.json');

const YEAR = new Date().getFullYear();

async function main() {
  const args = process.argv.slice(2);

  // --check: stampa i metadata di un file e esci
  if (args[0] === '--check') {
    if (!args[1]) { console.error('Uso: node write-metadata.js --check <file>'); process.exit(1); }
    const tags = await exiftool.read(path.resolve(ROOT, args[1]));
    const keys = ['Artist', 'Copyright', 'Creator', 'Rights', 'Title', 'ObjectName',
      'Description', 'CopyrightNotice', 'By-line', 'WebStatement', 'UsageTerms'];
    for (const k of keys) if (tags[k]) console.log(`${k}: ${JSON.stringify(tags[k])}`);
    await exiftool.end();
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const about = manifest.about || {};
  const seo = manifest.seo || {};

  const AUTHOR = (about.name || 'Andrea Spinazzola').replace(/\n/g, ' ');
  const EMAIL = about.email || 'spinaster@gmail.com';
  const SITE = (seo.canonical || 'https://new-media-design.it/gallery/');
  const COPYRIGHT = `© ${YEAR} ${AUTHOR}. All rights reserved.`;
  const TERMS = `For licensing or prints contact ${EMAIL}`;

  const targetSeries = args.length ? args : null;
  const series = (manifest.series || []).filter(s => !targetSeries || targetSeries.includes(s.id));
  if (!series.length) { console.error('Nessuna serie selezionata/trovata.'); process.exit(1); }

  let written = 0, missing = 0;

  for (const s of series) {
    console.log(`\n${s.id} (${s.title || ''})`);
    for (const img of s.images || []) {
      const title = img.title || '';
      const desc = [s.title, img.meta].filter(Boolean).join(' · ');

      const tags = {
        // EXIF
        Artist: AUTHOR,
        Copyright: COPYRIGHT,
        // IPTC
        'By-line': AUTHOR,
        CopyrightNotice: COPYRIGHT,
        ObjectName: title,
        'Caption-Abstract': desc,
        // XMP (sopravvive meglio, unico standard scrivibile anche nei webp)
        Creator: AUTHOR,
        Rights: COPYRIGHT,
        Title: title,
        Description: desc,
        UsageTerms: TERMS,
        WebStatement: SITE,
      };

      // full-size jpg + thumb webp
      const files = [img.filename, img.thumb].filter(Boolean);
      for (const rel of files) {
        const file = path.join(ROOT, rel);
        if (!fs.existsSync(file)) { console.log(`  ! mancante: ${rel}`); missing++; continue; }
        const isWebp = /\.webp$/i.test(file);
        // IPTC/EXIF non standard nei webp → solo XMP
        const t = isWebp
          ? { Creator: AUTHOR, Rights: COPYRIGHT, Title: title, Description: desc, UsageTerms: TERMS, WebStatement: SITE }
          : tags;
        await exiftool.write(file, t, { writeArgs: ['-overwrite_original'] });
        written++;
      }
      process.stdout.write(`  ✓ ${title}\n`);
    }
  }

  console.log(`\nFatto: ${written} file scritti${missing ? `, ${missing} mancanti` : ''}.`);
  await exiftool.end();
}

main().catch(async err => { console.error(err); await exiftool.end(); process.exit(1); });
