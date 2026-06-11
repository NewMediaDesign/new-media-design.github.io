# HANDOFF-PROMPT.md — Prompt di avvio per la prossima sessione (Claude Code)

> Creato a fine sessione 16 (2026-06-11). Copiare il blocco qui sotto come primo
> messaggio in una sessione Claude Code aperta su g:\____DEVELOPER\Art_Gallery.
> Scopo: eseguire pipeline immagini + deploy/push (non possibile da Cowork:
> sandbox VM non disponibile e credenziali git solo sulla macchina locale).

```
Apri la sessione su questo progetto (cartella di lavoro: g:\____DEVELOPER\Art_Gallery).

CONTESTO
Sito portfolio "Human Frequency" di Andrea Spinazzola (gallery di immagini fine-art),
deployato su GitHub Pages: repo NewMediaDesign/new-media-design.github.io,
sottocartella /gallery/, branch main. Come da CLAUDE.md, leggi PRIMA nell'ordine:
1. docx/SESSION.md — sessione 16 (l'ultima): contiene tutto ciò che è stato fatto
2. docx/FIX.md
3. docx/ROADMAP.md per il quadro generale

Nella sessione 16 (fatta con un altro tool, Cowork) sono stati creati:
- pipeline tracciabilità immagini: watermark.py (watermark invisibile, già applicato
  a series-3/01 e 02), write-metadata.js (EXIF/IPTC via exiftool-vendored)
- SEO e sharing: build-seo.js, generate-share-pages.js, generate-favicons.js,
  deep link #photo= e bottone Share in index.html
- MOTORE PUBBLICAZIONE INSTAGRAM AUTOMATICA: stories.json (56 caption),
  build-queue.js → social-queue.json, publish-instagram.js (Graph API v25.0,
  account @humanfrequency.project), publish-social.yml (GitHub Actions cron).
  I 4 secrets (IG_USER_ID, IG_ACCESS_TOKEN, META_APP_ID, META_APP_SECRET)
  sono GIÀ configurati nel repo GitHub.

COSA DEVI FARE (in quest'ordine, chiedi conferma solo se qualcosa fallisce):
1. npm install (serve exiftool-vendored, sharp c'è già)
   e pip install -r requirements.txt
2. npm run favicons (genera favicon/ — index.html già la referenzia)
3. python watermark.py --all (watermarka le immagini restanti; series-3/01 e 02
   sono già fatte e nel registry — verranno saltate)
4. npm run publish-images (catena: thumbs → metadata → manifest con w/h →
   share pages → SEO statica)
5. node build-queue.js (genera social-queue.json)
6. Deploy: clona/aggiorna /tmp/new-media-design.github.io, copia in gallery/:
   index.html, manifest.json, package.json, tutti gli script .js e .py,
   requirements.txt, stories.json, social-queue.json, watermark-registry.json,
   le cartelle favicon/ share/ social/ docx/ e le immagini/thumbs aggiornate.
   Copia publish-social.yml in .github/workflows/ nella ROOT del repo (non in gallery/).
   Commit unico e push su main.
7. NON lanciare il workflow GitHub Actions: lo avvio io a mano dalla tab Actions
   (pubblica un post reale su Instagram).
8. Aggiorna docx/SESSION.md (sessione 17) con quanto fatto, sia in locale che nel repo.

VINCOLI
- Non modificare la logica degli script: sono già testati/revisionati. Se uno
  script dà errore, correggi il minimo indispensabile e documenta in FIX.md.
- watermark-registry.json va committato E conservato: senza di esso il watermark
  non è verificabile.
- La cartella social/ VA pushata (la Graph API scarica i media da
  raw.githubusercontent). I master 6000px non esistono in questo repo e nulla
  sopra i 3000px deve mai entrarci.
```

## Promemoria per l'utente (non per Claude)
- Prima del primo "Run workflow": completare bio + foto profilo IG (docx/SOCIAL-KIT.md)
- Il primo run pubblica "The Witness" — post reale su @humanfrequency.project
- Se il run fallisce: copiare il log dell'errore e incollarlo nella sessione per il fix
