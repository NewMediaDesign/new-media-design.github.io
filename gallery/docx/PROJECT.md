# Andrea Spinazzola — Art Gallery Website
## Project Reference Document

---

## Identità del progetto

| Campo | Valore |
|-------|--------|
| **Artista** | Andrea Spinazzola |
| **Tipo** | Portfolio / Art Gallery online |
| **URL live** | https://new-media-design.github.io/gallery |
| **GitHub Org** | NewMediaDesign |
| **Repository** | `NewMediaDesign/new-media-design.github.io` |
| **Branch** | `main` |
| **Sottocartella repo** | `/gallery/` |
| **Clone locale** | `/tmp/new-media-design.github.io/` |

---

## Stack tecnico

| Componente | Tecnologia |
|-----------|------------|
| **Linguaggio** | HTML5 + CSS3 + Vanilla JS (ES6+) |
| **Framework** | Nessuno — single file `index.html` |
| **Rendering immagini** | PhotoSwipe v5.4.4 (bundlato in `lib/`) |
| **Tema** | CSS custom properties + localStorage |
| **Font** | Hanken Grotesk + Space Mono (Google Fonts) |
| **Form backend** | Formspree (`https://formspree.io/f/xgonqrbv`) |
| **Deploy** | GitHub Pages (push su main → live in ~1 min) |
| **Configurazione galleria** | `manifest.json` |

---

## File principali

```
Art_Gallery/
├── index.html              ← FILE PRINCIPALE (tutto il CSS/JS è qui dentro)
├── manifest.json           ← Configura serie e immagini della galleria
├── update-manifest.js      ← Script Node.js: rigenera manifest da immagini in disco
├── generate-thumbs.js      ← Script Node.js: genera thumbnail WebP 600px via sharp
├── lib/
│   ├── photoswipe.css      ← PhotoSwipe v5.4.4 CSS (bundlato localmente)
│   └── photoswipe.umd.min.js ← PhotoSwipe v5.4.4 JS (bundlato localmente)
├── images/
│   ├── AS_BW_PORTRAIT_02.png   ← Foto About
│   ├── series-1/               ← Amerika — 19 immagini (01-20, manca 14)
│   │   ├── 01.jpg … 20.jpg
│   │   └── thumbs/01.webp … 20.webp
│   └── series-2/               ← Pulse — 25 immagini (01-25)
│       ├── 01.jpg … 25.jpg
│       └── thumbs/01.webp … 25.webp
├── CLAUDE.md               ← Istruzioni sessione per Claude Code
└── docx/                   ← Documentazione di progetto
    ├── PROJECT.md          ← Questo file
    ├── SESSION.md          ← Log sessioni
    ├── FIX.md              ← Registro bug risolti
    └── CONTENT.md          ← Checklist contenuti da fornire
```

---

## Architettura CSS — Z-index layer

| Layer | Z-index | Elemento |
|-------|---------|----------|
| Hero background | 0 | `.hero` |
| Gallery / Contact / About overlay | 200 | `.gallery-overlay` `.contact-overlay` `.about-overlay` |
| Header principale | 900 | `header#mainHeader` |
| Mobile menu overlay | 950 | `#mobMenu` |
| Museum (PhotoSwipe) | 100000 | `.pswp` (default PhotoSwipe) |
| Header durante museum | 100001 | `header.museum-open` |

---

## CSS Custom Properties (tema)

```css
/* Light (default) */
--bg: #ffffff
--fg: #111111
--fg2: #888888      /* testo secondario */
--fg3: #cccccc      /* testo terziario */
--border: #e4e4e4
--h: 48px           /* altezza header */

/* Dark */
--bg: #0d0d0d
--fg: #efefef
--fg2: #666666
--fg3: #2a2a2a
--border: #1e1e1e
```

---

## Sezioni (overlay) implementate

| Sezione | ID | Stato | Note |
|---------|----|-------|------|
| **Hero** | `#heroSection` | ✅ Live | Slideshow canvas auto-cycle (dots nascosti), solo hero series |
| **Work (Gallery)** | `#galleryOverlay` | ✅ Live | Masonry 3 col, tutte le serie mescolate (44 img) |
| **Museum (viewer)** | PhotoSwipe v5 | ✅ Live | Zoom, pan, swipe, passepartout, frecce a zona |
| **About** | `#aboutOverlay` | ✅ Live | Foto + bio, layout split |
| **Contact** | `#contactOverlay` | ✅ Live | Form Formspree, validazione |
| **Series** | `#seriesOverlay` | ✅ Live | Grid card serie → click apre solo quella serie |

---

## Navigazione — funzioni JS principali

```js
navigateTo(section)   // apre una sezione ('work','series','about','contact') o null per home
setSection(section)   // applica lo stato visivo (aggiunge/rimuove .active)
goHome()              // chiude tutto, torna alla hero
closeMuseum()         // chiude il museum viewer
loadAllSeries()       // carica tutte le serie in IMAGES (gallery completa)
loadSeries(id)        // carica solo una serie (da card serie)
openMuseum(idx)       // apre PhotoSwipe all'indice idx in IMAGES
```

`navigateTo(null)` / `goHome()` → home (hero).
Escape chiude in ordine: museum → overlay attivo → home.
`popstate` gestisce back/forward browser.
`singleSeriesMode`: true quando si visualizza una singola serie (no loop, Back → Series page).

---

## manifest.json — struttura

```json
{
  "site": { "name": "Andrea Spinazzola", "project": "Human Frequency", "hero": { "seriesId": "series-1", "interval": 5000 } },
  "about": { "photo": "...", "name": "...", "bio": "...", "instagram": "...", "linkedin": "..." },
  "seo": { "title": "...", "description": "...", "ogImage": "..." },
  "series": [
    {
      "id": "series-1", "title": "Amerika", "subtitle": "Human Frequency · 2026",
      "images": [
        { "filename": "images/series-1/01.jpg", "thumb": "images/series-1/thumbs/01.webp", "title": "The Witness", "description": "Amerika", "meta": "Salvador · 1997" }
      ]
    },
    {
      "id": "series-2", "title": "Pulse", "subtitle": "Human Frequency · 2026",
      "images": [
        { "filename": "images/series-2/01.jpg", "thumb": "images/series-2/thumbs/01.webp", "title": "Iron", "description": "Pulse", "meta": "Copacabana · 1996" }
      ]
    }
  ]
}
```

**Serie attive:** Amerika (19 img), Pulse (25 img) — 44 immagini totali.

**Per aggiungere immagini:**
1. Copia JPG in `images/series-N/`
2. `node generate-thumbs.js series-N` (genera thumbnail WebP 600px)
3. `node update-manifest.js` (aggiorna manifest preservando metadata)
4. Edita `manifest.json` — aggiungi/aggiorna titoli e descrizioni

---

## Workflow deploy

```bash
# 1. Modifica index.html in locale
# 2. Copia nel repo clonato
cp "g:/____DEVELOPER/Art_Gallery/index.html" /tmp/new-media-design.github.io/gallery/index.html

# 3. Commit e push
cd /tmp/new-media-design.github.io
git add gallery/
git commit -m "descrizione"
git push origin main
# → Live su GitHub Pages in ~60 secondi
```
