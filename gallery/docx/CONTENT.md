# Content Checklist — Andrea Spinazzola Gallery

Tutto il contenuto che deve essere fornito dall'artista per completare il sito.
Aggiornare questo file man mano che i contenuti vengono consegnati.

---

## Sezione About

| Contenuto | Stato | Note |
|-----------|-------|------|
| Foto ritratto | ✅ | `images/AS_BW_PORTRAIT_02.png` |
| Testo bio | ⏳ Da aggiornare | Placeholder attuale nel codice |
| Email reale | ⏳ Da aggiornare | Nel codice: `andrea@spinazzola.com` |
| Handle Instagram | ⏳ Da aggiornare | Nel codice: link generico a instagram.com |
| Altri link social | ⏳ Opzionale | Aggiungere se necessario |

**Come aggiornare la bio nel codice** — cercare in `index.html`:
```html
<p class="about-bio">Visual artist working at the intersection...</p>
```

**Come aggiornare i link** — cercare in `index.html`:
```html
<a class="about-link" href="mailto:andrea@spinazzola.com">
<a class="about-link" href="https://instagram.com" target="_blank">
```

---

## Sezione Gallery (Work)

| Contenuto | Stato | Note |
|-----------|-------|------|
| Serie 1 — immagini (4 foto) | ✅ | `images/series-1/01-04.jpg` |
| Titoli opere serie 1 | ⏳ Da aggiornare | Ora: "Opera 01", "Opera 02"... |
| Descrizioni opere serie 1 | ⏳ Da aggiornare | Ora: testi placeholder |
| Serie 2, 3, ... | ⏳ Futuro | Aggiungere in manifest.json |

**Come aggiungere nuove immagini a una serie:**
1. Metti le foto in `images/series-1/` (o nuova cartella `images/series-2/`)
2. Aggiorna `manifest.json` con i nuovi filename, titoli, descrizioni
3. Oppure esegui `node update-manifest.js` per auto-scansione
4. Push al repo

**Come aggiornare titoli/descrizioni** — modificare `manifest.json`:
```json
{
  "filename": "images/series-1/01.jpg",
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
| Funzionalità Series | ⏳ Da progettare | Attualmente placeholder disabilitato |
| Concept / struttura | ⏳ Da definire | Lista di tutte le serie? Archivio? |

---

## SEO / Meta

| Contenuto | Stato | Note |
|-----------|-------|------|
| Title tag | ✅ | "Andrea Spinazzola" |
| Meta description | ⏳ Mancante | Da aggiungere in `<head>` |
| Favicon | ⏳ Mancante | Da aggiungere |
| og:image (social preview) | ⏳ Mancante | Immagine per condivisione social |

---

## Note generali

- Tutti i testi nel sito sono in **inglese** (scelta attuale)
- Il sito supporta **light e dark mode** — verificare che le foto funzionino bene in entrambe
- Le immagini vengono renderizzate su **Canvas** (non `<img>` tag) nella gallery e nel museo
