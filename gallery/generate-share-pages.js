/**
 * generate-share-pages.js
 * Per ogni opera genera:
 *   1. share/og/<serie>-<nn>.jpg — immagine og 1200px (i crawler social la usano per l'anteprima)
 *   2. share/<serie>-<nn>.html  — pagina statica con og: tags dedicati + redirect
 *      al deep link index.html#photo=<serie>/<nn>
 *
 * Perché: i crawler di WhatsApp/Facebook/LinkedIn non eseguono JS, quindi le
 * anteprime devono esistere come HTML statico. Il bottone Share nel museum
 * condivide questi URL.
 *
 * Usage:  node generate-share-pages.js          (rigenera tutto)
 * Incluso in `npm run publish-images`. Eseguire build-seo.js DOPO (sitemap).
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MANIFEST = path.join(ROOT, 'manifest.json');
const SHARE_DIR = path.join(ROOT, 'share');
const OG_DIR = path.join(SHARE_DIR, 'og');
const OG_WIDTH = 1200;
const OG_QUALITY = 84;

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const seo = manifest.seo || {};
const site = manifest.site || {};
const BASE = (seo.canonical || 'https://new-media-design.it/gallery/').replace(/\/?$/, '/');
const AUTHOR = ((manifest.about || {}).name || site.name || 'Andrea Spinazzola').replace(/\n/g, ' ');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function pageHtml({ title, desc, ogImgUrl, pid, slug }) {
  const deepLink = '../#photo=' + pid;
  const pageUrl = BASE + 'share/' + slug + '.html';
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: title,
    creator: { '@type': 'Person', name: AUTHOR, url: BASE },
    image: ogImgUrl,
    url: pageUrl,
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${esc(title)} — ${esc(AUTHOR)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:title" content="${esc(title)} — ${esc(AUTHOR)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${ogImgUrl}">
  <meta property="og:image:width" content="${OG_WIDTH}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${esc(site.name || AUTHOR)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <meta http-equiv="refresh" content="0; url=${deepLink}">
  <style>body{background:#0d0d0d;color:#888;font:12px/1.6 monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
</head>
<body>
  <p><a href="${deepLink}" style="color:#aaa">${esc(title)} — ${esc(AUTHOR)}</a></p>
  <script>location.replace('${deepLink}');</script>
</body>
</html>
`;
}

async function main() {
  if (!fs.existsSync(OG_DIR)) fs.mkdirSync(OG_DIR, { recursive: true });

  let pages = 0;
  for (const s of manifest.series || []) {
    for (const img of s.images || []) {
      const base = path.parse(img.filename).name;          // "05"
      const sid = s.id;                                     // "series-1"
      const pid = `${sid}/${base}`;                         // deep link id
      const slug = `${sid}-${base}`;                        // nome file share
      const srcFile = path.join(ROOT, img.filename);
      if (!fs.existsSync(srcFile)) { console.warn(`  ! mancante: ${img.filename}`); continue; }

      // 1 — og image 1200px (rigenerata solo se mancante)
      const ogFile = path.join(OG_DIR, slug + '.jpg');
      if (!fs.existsSync(ogFile)) {
        await sharp(srcFile)
          .resize(OG_WIDTH, null, { withoutEnlargement: true })
          .jpeg({ quality: OG_QUALITY })
          .toFile(ogFile);
      }

      // 2 — pagina share
      const title = img.title || `${s.title} ${base}`;
      const desc = [s.title, img.meta, AUTHOR].filter(Boolean).join(' · ');
      const ogImgUrl = BASE + 'share/og/' + slug + '.jpg';
      fs.writeFileSync(path.join(SHARE_DIR, slug + '.html'),
        pageHtml({ title, desc, ogImgUrl, pid, slug }));
      pages++;
    }
  }
  console.log(`✓ ${pages} pagine share generate in share/ (+ og images in share/og/)`);
  console.log('  Esegui ora: node build-seo.js (aggiorna la sitemap)');
}

main().catch(err => { console.error(err); process.exit(1); });
