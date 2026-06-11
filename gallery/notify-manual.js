/**
 * notify-manual.js
 * Promemoria per le azioni manuali della coda social.
 *
 * Trova gli item 'manual' "in scadenza" — quelli che nella coda precedono
 * il prossimo item 'pending' — e per ciascuno apre una Issue GitHub
 * (una sola volta: se un'issue con quell'id esiste già, anche chiusa, salta).
 * GitHub invia l'email di notifica al proprietario del repo.
 *
 * Pensato per girare in GitHub Actions dopo publish-instagram.js.
 * Richiede: gh CLI autenticata (GH_TOKEN) + permesso issues:write nel workflow.
 * Nessuna dipendenza npm.
 */

const { execFileSync } = require('child_process');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'social-queue.json');
const REPO = process.env.GITHUB_REPOSITORY || 'NewMediaDesign/new-media-design.github.io';

const queue = require(QUEUE_FILE);

// "In scadenza" = manuali che vengono prima del prossimo pending nella coda
const firstPending = queue.findIndex(i => i.status === 'pending');
const horizon = firstPending === -1 ? queue.length : firstPending;
const due = queue.slice(0, horizon).filter(i => i.status === 'manual');

if (due.length === 0) {
  console.log('Nessuna azione manuale in scadenza.');
  process.exit(0);
}

for (const item of due) {
  const count = execFileSync('gh', [
    'issue', 'list', '--repo', REPO, '--state', 'all',
    '--search', `in:title ${item.id}`, '--json', 'number', '--jq', 'length',
  ], { encoding: 'utf8' }).trim();

  if (count !== '0') {
    console.log(`${item.id}: issue già esistente, salto.`);
    continue;
  }

  const files = (item.files || [])
    .map(f => `- https://raw.githubusercontent.com/${REPO}/main/gallery/${f}`)
    .join('\n') || '- (nessun file in coda: vedi LAUNCH-POSTS.md)';

  const body = [
    `È il momento di pubblicare **${item.id}** (${item.type}) su @humanfrequency.project.`,
    '',
    `Istruzioni e specifiche complete: [docx/LAUNCH-POSTS.md](https://github.com/${REPO}/blob/main/gallery/docx/LAUNCH-POSTS.md)`,
    '',
    'File sorgente:',
    files,
    '',
    'Caption pronta da incollare:',
    '```',
    item.caption || '(caption in LAUNCH-POSTS.md)',
    '```',
    '',
    'Quando hai pubblicato, chiudi questa issue. ✅',
  ].join('\n');

  execFileSync('gh', [
    'issue', 'create', '--repo', REPO,
    '--title', `📣 Tocca a te: pubblica ${item.id} (${item.type})`,
    '--body', body,
  ], { stdio: 'inherit' });
  console.log(`${item.id}: issue creata.`);
}
