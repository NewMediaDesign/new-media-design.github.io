/**
 * build-queue.js
 * Costruisce/aggiorna social-queue.json: la coda di pubblicazione Instagram.
 *
 * - Primi 9 item = griglia di lancio (docx/LAUNCH-POSTS.md), inclusi 2 reel e
 *   il manifesto marcati "manual" (il robot li salta, si fanno a mano)
 * - Poi tutte le opere rimanenti come post singoli, alternando le serie
 * - Caption composte da: titolo + serie·meta + storia (stories.json) + CTA +
 *   hashtag a rotazione + geo tag
 * - NON DISTRUTTIVO: gli item già presenti in coda (per id) vengono preservati
 *   con il loro status; aggiunge solo i nuovi (es. nuove serie)
 *
 * Usage: node build-queue.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const QUEUE_FILE = path.join(ROOT, 'social-queue.json');

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const stories = JSON.parse(fs.readFileSync(path.join(ROOT, 'stories.json'), 'utf8'));

const CTA = 'Limited edition prints — link in bio';
const HASHTAG_SETS = [
  '#fineart #fineartprints #blackandwhite #monochrome #bnw_greatshots #visualart #contemporaryart #artcollector #limitededition #printsforsale',
  '#humanstories #portraiture #visualnarrative #documentaryart #peopleoftheworld #monochromatic #bnwmood #artoftheday #emergingartist',
  '#artprint #wallart #fineartcollector #blackandwhiteart #figurativeart #artforsale #interiorart #gicleeprint #editionprint',
];

// ── indice opere per pid ──
const works = {}; // pid -> {pid, slug, title, meta, seriesTitle}
for (const s of manifest.series || []) {
  for (const img of s.images || []) {
    const base = path.parse(img.filename).name;
    const pid = `${s.id}/${base}`;
    works[pid] = {
      pid,
      slug: `${s.id}-${base}`,
      title: img.title || '',
      meta: img.meta || '',
      seriesTitle: s.title || '',
      seriesId: s.id,
    };
  }
}

function geoTag(meta) {
  if (!meta) return '';
  const city = meta.split('·')[0].trim();
  const slug = city.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return slug ? '#' + slug : '';
}

function captionFor(pid, hashIdx) {
  const w = works[pid];
  const story = stories[pid] || '';
  const tags = HASHTAG_SETS[hashIdx % HASHTAG_SETS.length];
  const geo = geoTag(w.meta);
  return [
    w.title,
    [w.seriesTitle, w.meta].filter(Boolean).join(' · '),
    '',
    story,
    '',
    CTA,
    '.', '.', '.',
    tags + (geo ? ' ' + geo : ''),
  ].join('\n');
}

// ── griglia di lancio (ordine = pubblicazione) ──
const LAUNCH = [
  { id: 'launch-1', type: 'image', pids: ['series-1/01'] },
  {
    id: 'launch-2', type: 'carousel', pids: ['series-1/03', 'series-1/05', 'series-1/10', 'series-1/06'],
    caption: `Quiet — four moments from Amerika\n\nSilence · São Paulo · 1989\nStill · Buenos Aires · 1986\nThe Veil · Recife · 1982\nLast Bus · Belo Horizonte · 1993\n\nThe loudest places hide the stillest people.\n\n${CTA}\n.\n.\n.\n${HASHTAG_SETS[1]} #saopaulo #buenosaires`,
  },
  { id: 'launch-3', type: 'image', pids: ['series-2/03'] },
  { id: 'launch-4', type: 'reel', pids: ['series-2/10'], status: 'manual', note: 'Reel Ken Burns — vedi docx/LAUNCH-POSTS.md post 4' },
  { id: 'launch-5', type: 'image', pids: ['series-3/09'] },
  {
    id: 'launch-6', type: 'carousel', pids: ['series-2/08', 'series-2/12', 'series-2/22'],
    caption: `One city, three frequencies — Havana\n\nThe Wait · 2003\nSonata · 2005\nThe Dancer · 1995\n\nSome cities don't pose. They perform.\n\n${CTA}\n.\n.\n.\n${HASHTAG_SETS[2]} #havana #cuba`,
  },
  { id: 'launch-7', type: 'image', pids: ['series-1/16'] },
  { id: 'launch-8', type: 'reel', pids: ['series-2/13'], status: 'manual', note: 'Reel Look Closer — vedi docx/LAUNCH-POSTS.md post 8' },
  { id: 'launch-9', type: 'manifesto', pids: [], status: 'manual', note: 'Claim tipografico su nero — vedi docx/LAUNCH-POSTS.md post 9' },
];

// ── coda esistente (preserva status) ──
let queue = [];
if (fs.existsSync(QUEUE_FILE)) queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
const existing = new Set(queue.map(i => i.id));

let added = 0;
let hashIdx = 0;

function push(item) {
  if (existing.has(item.id)) return;
  queue.push(item);
  existing.add(item.id);
  added++;
}

// 1 — lancio
for (const l of LAUNCH) {
  push({
    id: l.id,
    type: l.type,
    pids: l.pids,
    files: l.pids.map(pid => 'social/' + works[pid].slug + '.jpg'),
    caption: l.caption || (l.pids[0] ? captionFor(l.pids[0], hashIdx++) : ''),
    status: l.status || 'pending',
    ...(l.note ? { note: l.note } : {}),
  });
}

// 2 — tutte le opere rimanenti, serie alternate (round-robin deterministico)
const usedInLaunch = new Set(LAUNCH.flatMap(l => l.pids));
const bySeries = {};
for (const pid of Object.keys(works)) {
  if (usedInLaunch.has(pid)) continue;
  (bySeries[works[pid].seriesId] = bySeries[works[pid].seriesId] || []).push(pid);
}
const seriesIds = Object.keys(bySeries).sort();
let exhausted = false;
for (let round = 0; !exhausted; round++) {
  exhausted = true;
  for (const sid of seriesIds) {
    const pid = (bySeries[sid] || [])[round];
    if (!pid) continue;
    exhausted = false;
    push({
      id: works[pid].slug,
      type: 'image',
      pids: [pid],
      files: ['social/' + works[pid].slug + '.jpg'],
      caption: captionFor(pid, hashIdx++),
      status: 'pending',
    });
  }
}

fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + '\n');
const pending = queue.filter(i => i.status === 'pending').length;
const manual = queue.filter(i => i.status === 'manual').length;
const published = queue.filter(i => i.status === 'published').length;
console.log(`✓ social-queue.json: ${queue.length} item totali (+${added} nuovi) — ${pending} in coda, ${published} pubblicati, ${manual} manuali`);
console.log(`  A 3 post/settimana: ~${Math.ceil(pending / 3)} settimane di pubblicazione autonoma`);
