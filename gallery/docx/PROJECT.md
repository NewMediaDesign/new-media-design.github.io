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
| **Rendering immagini** | HTML5 Canvas API |
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
├── images/
│   ├── AS_BW_PORTRAIT_02.png   ← Foto About
│   └── series-1/
│       ├── 01.jpg
│       ├── 02.jpg
│       ├── 03.jpg
│       └── 04.jpg
└── docx/                   ← Documentazione di progetto (questa cartella)
    ├── PROJECT.md          ← Questo file
    ├── SESSION.md          ← Log sessioni
    └── CONTENT.md          ← Checklist contenuti da fornire
```

---

## Architettura CSS — Z-index layer

| Layer | Z-index | Elemento |
|-------|---------|----------|
| Hero background | 0 | `.hero` |
| Gallery / Contact / About overlay | 200 | `.gallery-overlay` `.contact-overlay` `.about-overlay` |
| Museum (viewer foto) | 800 | `.museum` |
| Header principale | 900 | `header#mainHeader` |
| Cursore custom | 9999 | `.custom-cursor` |

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
| **Hero** | `#heroSection` | ✅ Live | Slideshow canvas, dot nav, swipe touch |
| **Work (Gallery)** | `#galleryOverlay` | ✅ Live | Grid 12 colonne, canvas hover |
| **Museum (viewer)** | `#museum` | ✅ Live | Zoom, pan, swipe, arrow nav |
| **About** | `#aboutOverlay` | ✅ Live | Foto + bio, layout split |
| **Contact** | `#contactOverlay` | ✅ Live | Form Formspree, validazione |
| **Series** | `#navSeries` | ⏳ Placeholder | Non ancora implementato |

---

## Navigazione — funzioni JS principali

```js
openGallery()  / closeGallery()   // nav Work
openAbout()    / closeAbout()     // nav About
openContact()  / closeContact()   // nav Contact
openMuseum(i)  / closeMuseum()    // click foto in gallery
```

Ogni `openX()` chiude il museo se aperto. Escape chiude in ordine: museum → gallery → contact → about.

---

## manifest.json — struttura

```json
{
  "site": { "name": "Andrea Spinazzola", "hero": { "seriesId": "series-1", "interval": 5000 } },
  "series": [{
    "id": "series-1",
    "title": "Human Frequency",
    "subtitle": "Series I — Faces · AI Generative · 2024",
    "images": [
      { "filename": "images/series-1/01.jpg", "title": "Opera 01", "description": "...", "meta": "2024 · AI Generative" }
    ]
  }]
}
```

Per aggiungere immagini: metti i file in `images/series-1/` e aggiorna `manifest.json` (o esegui `node update-manifest.js`).

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
