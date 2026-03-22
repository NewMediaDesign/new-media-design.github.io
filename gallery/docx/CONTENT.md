# Content Checklist — Andrea Spinazzola Gallery

Tutto il contenuto che deve essere fornito dall'artista per completare il sito.
Aggiornare questo file man mano che i contenuti vengono consegnati.

**⚠️ IMPORTANTE:** Da questa sessione, tutto il contenuto si aggiorna SOLO in `manifest.json`.
Non serve più toccare `index.html` per aggiornare testi, bio, link o immagini.

---

## Sezione About

| Contenuto | Stato | Note |
|-----------|-------|------|
| Foto ritratto | ✅ | `images/AS_BW_PORTRAIT_02.png` |
| Testo bio | ⏳ Da aggiornare | In `manifest.json` → `about.bio` |
| Email reale | ⏳ Da aggiornare | In `manifest.json` → `about.email` |
| Handle Instagram | ⏳ Da aggiornare | In `manifest.json` → `about.instagram` e `about.instagramHandle` |
| Altri link social | ⏳ Opzionale | Richiederebbe modifica al codice |

**Come aggiornare** — modificare `manifest.json`:
```json
"about": {
  "photo": "images/AS_BW_PORTRAIT_02.png",
  "name": "Andrea\nSpinazzola",
  "bio": "Tua bio qui...",
  "email": "tua@email.com",
  "instagram": "https://instagram.com/tuohandle",
  "instagramHandle": "@tuohandle"
}
```

---

## Sezione Gallery (Work)

| Contenuto | Stato | Note |
|-----------|-------|------|
| Serie 1 — 19 immagini | ✅ | `images/series-1/01-20.jpg` (manca 14) |
| Thumbnail WebP | ✅ | `images/series-1/thumbs/` — auto-generati |
| Titoli opere serie 1 | ⏳ Da aggiornare | In `manifest.json` → `series[0].images[N].title` |
| Descrizioni opere serie 1 | ⏳ Da aggiornare | In `manifest.json` → `series[0].images[N].description` |
| Serie 2, 3, ... | ⏳ Futuro | Vedi workflow sotto |

**Workflow per aggiungere nuove immagini:**
```bash
# 1. Copia i JPG nella cartella
# Per serie 1:  images/series-1/
# Per serie 2:  images/series-2/  (crearla se non esiste)

# 2. Genera thumbnail
node generate-thumbs.js series-1

# 3. Aggiorna manifest (scaffolda le nuove entries)
node update-manifest.js

# 4. Edita manifest.json → aggiorna title/description per le nuove immagini

# 5. Copia nel repo e pusha
cp index.html manifest.json /tmp/new-media-design.github.io/gallery/
cp -r images/series-1/thumbs /tmp/new-media-design.github.io/gallery/images/series-1/
cd /tmp/new-media-design.github.io
git add gallery/
git commit -m "feat: add new images"
git push
```

**Come aggiornare titoli/descrizioni** — modificare `manifest.json`:
```json
{
  "filename": "images/series-1/01.jpg",
  "thumb": "images/series-1/thumbs/01.webp",
  "title": "TITOLO OPERA",
  "description": "Descrizione dell'opera",
  "meta": "2024 · AI Generative"
}
```

---

## Sezione Hero

| Contenuto | Stato | Note |
|-----------|-------|------|
| Immagini slideshow | ✅ | Usa le stesse di series-1 |
| Titolo serie | ✅ | "Human Frequency" (da manifest.json) |
| Sottotitolo serie | ✅ | "Series I — Faces · AI Generative · 2024" |

---

## Sezione Contact (Form)

| Contenuto | Stato | Note |
|-----------|-------|------|
| Backend Formspree | ✅ | ID: `xgonqrbv` |
| Email destinatario | ⏳ Verificare | Configurato su Formspree dashboard |

---

## Sezione Series (nav)

| Contenuto | Stato | Note |
|-----------|-------|------|
| Funzionalità Series | ✅ | Implementata — mostra grid di tutte le serie |
| Serie 1 visibile | ✅ | Appare automaticamente da manifest.json |
| Serie 2, 3, ... | ⏳ Futuro | Aggiungi cartella `images/series-2/` + lancia workflow |

---

## SEO / Meta

| Contenuto | Stato | Note |
|-----------|-------|------|
| Title tag | ✅ | Da manifest `seo.title` |
| Meta description | ⏳ Da aggiornare | In `manifest.json` → `seo.description` |
| og:image | ⏳ Da aggiornare | In `manifest.json` → `seo.ogImage` |
| Favicon | ⏳ Mancante | File `.ico` + tag `<link rel="icon">` in index.html |

**Come aggiornare SEO** — modificare `manifest.json`:
```json
"seo": {
  "title": "Andrea Spinazzola",
  "description": "Breve descrizione per Google/social (max 160 caratteri)",
  "ogImage": "images/series-1/01.jpg"
}
```

---

## Note generali

- Tutti i testi nel sito sono in **inglese** (scelta attuale)
- Il sito supporta **light e dark mode**
- Le immagini gallery vengono renderizzate su **Canvas** — nessun tasto destro/salva
- Gallery usa **thumbnail WebP 600px** (~60KB), museum usa **JPG 3000px** on demand (zoom)
