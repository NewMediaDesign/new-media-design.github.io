# NMD Portfolio — Andrea Spinazzola

## Struttura

```
nmd-portfolio/
├── index.html              — pagina unica con overlay gallery
├── css/
│   ├── base.css            — variabili CSS, reset, font
│   ├── layout.css          — struttura pagina (hero, sezioni, footer)
│   └── gallery.css         — overlay gallery e slideshow
├── js/
│   ├── content.js          — popola la pagina da content.json
│   └── gallery.js          — gestisce overlay, tab, slideshow
├── data/
│   └── content.json        — UNICO FILE DA EDITARE per testi e dati gallery
└── assets/
    ├── images/
    │   ├── portraits/      — foto profilo (portrait-bw.png)
    │   ├── virtual-models/ — vm-01.jpg … vm-05.jpg
    │   ├── adv-campaign/   — adv-01.jpg … adv-05.jpg
    │   ├── virtual-try-on/ — vto-01.jpg … vto-05.jpg
    │   └── texture-fabric/ — tf-01.jpg … tf-05.jpg
    ├── fonts/              — font locali (opzionale, fallback Google Fonts)
    └── icons/              — favicon, icone

## Come aggiungere immagini

1. Metti le immagini nelle cartelle corrispondenti con i nomi indicati sopra
2. In content.json aggiorna il campo "image" di ogni slide se usi nomi diversi
3. Le immagini mancanti mostrano automaticamente un placeholder

## Come modificare i contenuti

Tutto il testo (servizi, numeri, clienti, contatti, caption gallery)
è in data/content.json — nessun HTML da toccare.

## Avvio locale

```bash
# qualsiasi server statico, es:
npx serve .
# oppure con Python:
python3 -m http.server 8080
```
