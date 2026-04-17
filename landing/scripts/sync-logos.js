#!/usr/bin/env node
/**
 * sync-logos.js  —  Sincronizza i loghi con data/content.json
 *
 * Uso:  node scripts/sync-logos.js
 *
 * • Legge tutti i file immagine in assets/images/loghi/
 * • Aggiunge automaticamente i nuovi file (con nome auto-derivato dal filename)
 * • Rimuove le voci di file che non esistono più
 * • Preserva l'ordine manuale già presente in content.json
 * • Per assegnare un nome preciso a un nuovo logo, aggiungilo a NAME_MAP
 */

const fs   = require('fs');
const path = require('path');

// ── Mappa filename → nome visualizzato ───────────────────────────────────────
// Aggiungi qui le voci per i nuovi loghi se il nome auto-generato non è corretto
const NAME_MAP = {
  'loghi_gallery_0000_hb':        'Hugo Boss',
  'loghi_gallery_0001_tods':      "Tod's",
  'loghi_gallery_0002_prada':     'Prada',
  'loghi_gallery_0003_guess':     'Guess',
  'loghi_gallery_0004_swa':       'SWA',
  'loghi_gallery_0005_msc':       'MSC Cruises',
  'loghi_gallery_0006_bulgari':   'Bulgari',
  'loghi_gallery_0007_wd':        'WD',
  'loghi_gallery_0008_conde':     'Condé Nast',
  'loghi_gallery_0009_vanity':    'Vanity Fair',
  'loghi_gallery_0010_wired':     'Wired',
  'loghi_gallery_0011_gq':        'GQ',
  'loghi_gallery_0012_rcs':       'RCS',
  'loghi_gallery_0013_cairo':     'Cairo Editore',
  'loghi_gallery_0014_mondadori': 'Mondadori',
  'loghi_gallery_0015_sky':       'Sky',
  'loghi_gallery_0016_ied':       'IED',
  'loghi_gallery_0017_sgiulia':   'S. Giulia',
  'loghi_gallery_0018_naba':      'NABA',
  'loghi_gallery_0019_ilas':      'ILAS',
  'loghi_gallery_0020_adobe':     'Adobe',
  'loghi_gallery_0021_ferrero':   'Ferrero',
  'loghi_gallery_0022_bticino':   'BTicino',
  'loghi_gallery_0023_whirl':     'Whirlpool',
  'loghi_gallery_0024_parmalat':  'Parmalat',
};

// ── File da ignorare nella cartella loghi ────────────────────────────────────
const EXCLUDE = new Set([
  'NMD_50_BLACK.svg',
]);

// ── Percorsi ─────────────────────────────────────────────────────────────────
const ROOT        = path.join(__dirname, '..');
const LOGHI_DIR   = path.join(ROOT, 'assets', 'images', 'loghi');
const CONTENT     = path.join(ROOT, 'data', 'content.json');
const LOGO_PREFIX = 'assets/images/loghi/';
const IMG_EXTS    = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

// ── 1. Scansiona la cartella ──────────────────────────────────────────────────
const found = fs.readdirSync(LOGHI_DIR)
  .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()) && !EXCLUDE.has(f))
  .sort();

const foundPaths = new Set(found.map(f => LOGO_PREFIX + f));

// ── 2. Leggi content.json ─────────────────────────────────────────────────────
const content  = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));
const existing = Array.isArray(content.clients) ? content.clients : [];

// ── 3. Merge ──────────────────────────────────────────────────────────────────
// a) Parti dall'ordine esistente, rimuovi file che non ci sono più
const merged  = existing.filter(c => foundPaths.has(c.logo));
const removed = existing.filter(c => !foundPaths.has(c.logo));

// b) Aggiungi i nuovi file non ancora presenti
const mergedPaths = new Set(merged.map(c => c.logo));
const added = [];

for (const file of found) {
  const logoPath = LOGO_PREFIX + file;
  if (!mergedPaths.has(logoPath)) {
    const base = path.basename(file, path.extname(file));
    const name = NAME_MAP[base] || autoName(base);
    merged.push({ name, logo: logoPath });
    added.push(name);
  }
}

// ── 4. Nome auto-derivato dal filename ────────────────────────────────────────
function autoName(base) {
  return base
    .replace(/^loghi_gallery_\d+_/i, '') // rimuove prefisso numerato
    .replace(/[-_]/g, ' ')               // underscore/trattini → spazio
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
}

// ── 5. Scrivi content.json ────────────────────────────────────────────────────
content.clients = merged;
fs.writeFileSync(CONTENT, JSON.stringify(content, null, 2) + '\n', 'utf8');

// ── 6. Report ─────────────────────────────────────────────────────────────────
console.log('\n── sync-logos ──────────────────────────────');
if (added.length)   added.forEach(n   => console.log(`  + aggiunto:  ${n}`));
if (removed.length) removed.forEach(c => console.log(`  - rimosso:   ${c.name}`));
if (!added.length && !removed.length) console.log('  ✓ nessuna modifica');
console.log(`\n  Totale: ${merged.length} logo(s) in data/content.json`);
console.log('────────────────────────────────────────────\n');
