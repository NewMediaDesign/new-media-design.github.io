/**
 * build-seo.js
 * Genera la SEO statica del sito a partire da manifest.json:
 *   1. Inietta in index.html (tra i marker SEO:START / SEO:END) i meta tag statici:
 *      title, description, canonical, og:*, twitter:card, JSON-LD (Person + WebSite)
 *      → i crawler social NON eseguono JS: senza questo blocco le anteprime di
 *        condivisione escono vuote.
 *   2. Genera sitemap.xml (homepage + pagine share, se esistono)
 *   3. Genera robots.txt
 *
 * Usage:  node build-seo.js
 * Eseguire dopo ogni modifica a manifest.json (incluso in `npm run publish-images`).
 * Idempotente: riscrive solo il blocco tra i marker.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INDEX = path.join(ROOT, 'index.html');
const MANIFEST = path.join(ROOT, 'manifest.json');
const SHARE_DIR = path.join(ROOT, 'share');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const seo = manifest.seo || {};
const about = manifest.about || {};
const site = manifest.site || {};

const BASE = (seo.canonical || 'https://new-media-design.it/gallery/').replace(/\/?$/, '/');
const TITLE = seo.title || site.name || 'Andrea Spinazzola';
const DESC = seo.description || '';
const OG_IMG = new URL(seo.ogImage || '', BASE).href;
const AUTHOR = (about.name || site.name || 'Andrea Spinazzola').replace(/\n/g, ' ');

const sameAs = [about.instagram, about.linkedin].filter(Boolean);

const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': BASE + '#artist',
      name: AUTHOR,
      url: BASE,
      description: about.bio || DESC,
      ...(about.photo ? { image: new URL(about.photo, BASE).href } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      '@type': 'WebSite',
      name: TITLE,
      url: BASE,
      author: { '@id': BASE + '#artist' },
      description: DESC,
    },
  ],
};

const block = `<!-- SEO:START — blocco generato da build-seo.js (i valori statici servono ai crawler, che non eseguono JS) -->
  <title>${esc(TITLE)}</title>
  <meta name="description" id="metaDesc" content="${esc(DESC)}">
  <link rel="canonical" href="${BASE}">
  <meta property="og:title" id="ogTitle" content="${esc(TITLE)}">
  <meta property="og:description" id="ogDesc" content="${esc(DESC)}">
  <meta property="og:image" id="ogImage" content="${OG_IMG}">
  <meta property="og:url" content="${BASE}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name || AUTHOR)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
  <!-- SEO:END -->`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// 1 — index.html
let html = fs.readFileSync(INDEX, 'utf8');
const re = /<!-- SEO:START[\s\S]*?SEO:END -->/;
if (!re.test(html)) {
  console.error('Marker SEO:START/SEO:END non trovati in index.html');
  process.exit(1);
}
html = html.replace(re, block);
fs.writeFileSync(INDEX, html);
console.log('✓ index.html — blocco SEO statico aggiornato');

// 2 — sitemap.xml (homepage + pagine share per-opera, se generate)
const urls = [BASE];
if (fs.existsSync(SHARE_DIR)) {
  for (const f of fs.readdirSync(SHARE_DIR).filter(f => f.endsWith('.html')).sort()) {
    urls.push(BASE + 'share/' + f);
  }
}
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(`✓ sitemap.xml — ${urls.length} URL`);

// 3 — robots.txt
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}sitemap.xml\n`);
console.log('✓ robots.txt');
