/**
 * publish-instagram.js
 * Pubblica su Instagram (@humanfrequency.project) il prossimo item della coda
 * social-queue.json via Meta Graph API. Pensato per girare in GitHub Actions.
 *
 * Cosa fa ad ogni run:
 *   1. Carica il token: da .ig-token.enc (cifrato, committato) se esiste,
 *      altrimenti dal secret IG_ACCESS_TOKEN
 *   2. Lo RINNOVA (long-lived, +60 giorni) e lo risalva cifrato →
 *      il token non scade mai finché il cron gira
 *   3. Prende il primo item 'pending' (salta i 'manual'), pubblica
 *      (image o carousel), marca 'published' con timestamp e media id
 *
 * Env richieste: IG_USER_ID, IG_ACCESS_TOKEN, META_APP_ID, META_APP_SECRET
 * Opzionale: MEDIA_BASE_URL (default: raw.githubusercontent del repo Pages)
 *
 * Le immagini devono essere già committate e pushate (la Action lo fa prima
 * di chiamare questo script) — l'API Meta le scarica da URL pubblico.
 *
 * Requisiti: Node 18+ (fetch nativo). Nessuna dipendenza.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const QUEUE_FILE = path.join(ROOT, 'social-queue.json');
const TOKEN_FILE = path.join(ROOT, '.ig-token.enc');
const V = 'v25.0';
const G = 'https://graph.facebook.com/' + V;

const IG_USER_ID = process.env.IG_USER_ID;
const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const MEDIA_BASE = (process.env.MEDIA_BASE_URL ||
  'https://raw.githubusercontent.com/NewMediaDesign/new-media-design.github.io/main/gallery/').replace(/\/?$/, '/');

if (!IG_USER_ID || !APP_ID || !APP_SECRET) {
  console.error('Env mancanti: servono IG_USER_ID, META_APP_ID, META_APP_SECRET (+ IG_ACCESS_TOKEN al primo run)');
  process.exit(1);
}

// ── token cifrato su file (AES-256-GCM, chiave derivata dall'App Secret) ──
const KEY = crypto.createHash('sha256').update(APP_SECRET).digest();

function saveToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({
    iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), data: enc.toString('hex'),
  }));
}

function loadToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    try {
      const { iv, tag, data } = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
      const d = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(iv, 'hex'));
      d.setAuthTag(Buffer.from(tag, 'hex'));
      return Buffer.concat([d.update(Buffer.from(data, 'hex')), d.final()]).toString('utf8');
    } catch (e) {
      console.warn('Token file illeggibile, uso il secret:', e.message);
    }
  }
  if (!process.env.IG_ACCESS_TOKEN) {
    console.error('Nessun token: né .ig-token.enc né IG_ACCESS_TOKEN');
    process.exit(1);
  }
  return process.env.IG_ACCESS_TOKEN;
}

// ── Graph API helpers ──
async function api(method, endpoint, params) {
  const url = new URL(`${G}/${endpoint}`);
  if (method === 'GET') Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, method === 'GET' ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Graph API ${endpoint}: ${json.error.message} (code ${json.error.code})`);
  return json;
}

async function refreshToken(token) {
  try {
    const r = await api('GET', 'oauth/access_token', {
      grant_type: 'fb_exchange_token', client_id: APP_ID, client_secret: APP_SECRET, fb_exchange_token: token,
    });
    saveToken(r.access_token);
    console.log('✓ token rinnovato (+60 giorni)');
    return r.access_token;
  } catch (e) {
    console.warn('Rinnovo token fallito, uso quello corrente:', e.message);
    return token;
  }
}

async function waitContainer(id, token, tries = 30) {
  for (let i = 0; i < tries; i++) {
    const r = await api('GET', id, { fields: 'status_code', access_token: token });
    if (r.status_code === 'FINISHED') return;
    if (r.status_code === 'ERROR') throw new Error(`Container ${id} in ERROR`);
    await new Promise(res => setTimeout(res, 5000));
  }
  throw new Error(`Container ${id} non pronto dopo ${tries} tentativi`);
}

async function verifyPublicUrl(url) {
  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) throw new Error(`Media non raggiungibile (${res.status}): ${url} — è stato pushato?`);
}

async function publishImage(item, token) {
  const imageUrl = MEDIA_BASE + item.files[0];
  await verifyPublicUrl(imageUrl);
  const c = await api('POST', `${IG_USER_ID}/media`, {
    image_url: imageUrl, caption: item.caption, access_token: token,
  });
  await waitContainer(c.id, token);
  const pub = await api('POST', `${IG_USER_ID}/media_publish`, { creation_id: c.id, access_token: token });
  return pub.id;
}

async function publishCarousel(item, token) {
  const children = [];
  for (const f of item.files) {
    const imageUrl = MEDIA_BASE + f;
    await verifyPublicUrl(imageUrl);
    const c = await api('POST', `${IG_USER_ID}/media`, {
      image_url: imageUrl, is_carousel_item: 'true', access_token: token,
    });
    await waitContainer(c.id, token);
    children.push(c.id);
  }
  const carousel = await api('POST', `${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL', children: children.join(','), caption: item.caption, access_token: token,
  });
  await waitContainer(carousel.id, token);
  const pub = await api('POST', `${IG_USER_ID}/media_publish`, { creation_id: carousel.id, access_token: token });
  return pub.id;
}

// ── main ──
async function main() {
  let token = loadToken();
  token = await refreshToken(token);

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  const item = queue.find(i => i.status === 'pending' && (i.type === 'image' || i.type === 'carousel'));

  if (!item) { console.log('Coda vuota: nessun item pending pubblicabile. (I "manual" si fanno a mano.)'); return; }

  console.log(`Pubblico: ${item.id} (${item.type}) — ${item.pids.join(', ')}`);
  const mediaId = item.type === 'carousel'
    ? await publishCarousel(item, token)
    : await publishImage(item, token);

  item.status = 'published';
  item.publishedAt = new Date().toISOString();
  item.mediaId = mediaId;
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + '\n');

  const left = queue.filter(i => i.status === 'pending').length;
  console.log(`✓ PUBBLICATO (media id ${mediaId}). Restano ${left} item in coda.`);
}

main().catch(err => { console.error('ERRORE:', err.message); process.exit(1); });
