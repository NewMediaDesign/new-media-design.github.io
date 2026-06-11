# ROADMAP.md — Audit completo & Milestone

> Data: 2026-06-11 · Basato su audit di `index.html` (2141 righe), `manifest.json`, struttura repo, SESSION.md (15 sessioni), FIX.md (15 fix)

---

## PARTE 1 — AUDIT

### 1.1 Problemi CRITICI (bloccano gli obiettivi sharing/vendita)

#### A. Le anteprime di condivisione NON funzionano (og: tags iniettati via JS)
I meta tag `og:title`, `og:description`, `og:image` sono vuoti nell'HTML e vengono popolati da JavaScript dopo il fetch del manifest (`initFromManifest`). **I crawler di WhatsApp, Facebook, LinkedIn, Telegram, X non eseguono JavaScript**: quando qualcuno condivide il link del sito, l'anteprima esce senza immagine e senza descrizione. Questo va risolto prima di qualsiasi strategia social.
→ Soluzione: og: tags **statici** scritti direttamente nell'HTML (+ pagine share per-immagine, vedi M10).

#### B. Nessun deep-link per singola immagine
Esiste solo `#work / #series / #about / #contact`. Non si può condividere il link di UNA foto specifica. Per lo sharing serve un URL per immagine (es. `#photo=series-1/05`) che apra direttamente PhotoSwipe su quella foto.

#### C. I 3000px sono scaricabili — DECISIONE CONSAPEVOLE, non bug *(rivisto 2026-06-11)*
I file pubblicati sono scaricabili da chiunque (manifest pubblico, blocco tasto destro cosmetico). **Decisione del progetto: va bene così.** Lo zoom 1:1 sui pixel è la tesi stessa del progetto; i master di stampa (6000px) restano offline, quindi i 3000px online sono già il livello "display". Il rischio residuo (repost senza credito, stampa casalinga) è economicamente irrilevante per un progetto che fa da marketing alla consulenza GenAI, e chi compra una stampa fine-art compra l'oggetto (carta, edizione, certificato), non i pixel.
→ Mitigazione (M8): tracciabilità invece di blocco — metadata IPTC/EXIF + watermark invisibile, entrambi automatizzati. **No C2PA / etichette AI**: scelta di posizionamento del progetto (l'opera è frutto di processo e intelletto dell'autore; il progetto contesta proprio la dicotomia generativo/reale).

#### D. SEO immagini = zero (rendering via canvas)
Gallery e hero disegnano le foto dentro `<canvas>`: per Google Images il sito **non contiene nessuna immagine**. Per un portfolio fotografico è la perdita SEO più grave possibile. Nessun `alt`, nessun `<img>` indicizzabile, nessun structured data.

### 1.2 Problemi IMPORTANTI

| # | Problema | Dettaglio |
|---|----------|-----------|
| 1 | SEO base assente | `title`/`description` via JS (i crawler vedono vuoto); mancano `sitemap.xml`, `robots.txt`, `canonical`, structured data (schema.org `Person` + `VisualArtwork`/`ImageObject`) |
| 2 | Favicon errata | `<link rel="icon" type="image/jpeg" href="...01.webp">` — tipo dichiarato jpeg, file webp, niente `.ico` né `apple-touch-icon` (pending da sessione 5) |
| 3 | Cache completamente disabilitata | Meta `no-cache/no-store` + `manifest.json?v=Date.now()` → ogni visita riscarica tutto. Meglio: cache normale + versioning del manifest con hash del contenuto |
| 4 | Nessun formato intermedio | Il museum serve i JPG full 3000px (~2MB l'uno). Servirebbe un livello 1600–1800px WebP (~200-300KB): più veloce E protegge i master |
| 5 | Accessibilità | Item gallery non raggiungibili da tastiera (div con click, non button/link); nessun `aria-label` sulle opere; `prefers-reduced-motion` ignorato; `user-select:none` globale |
| 6 | Contenuti placeholder | Bio generica, link Instagram/LinkedIn puntano a `instagram.com`/`linkedin.com` (homepage), email mancante (pending da 7 sessioni) |
| 7 | `openMuseum` precarica TUTTE le thumb | Con 56 immagini = 56 richieste prima di aprire il viewer. Meglio leggere aspect ratio dal manifest (aggiungere `w`/`h` ad ogni entry via `update-manifest.js`) — elimina anche la necessità del preload |
| 8 | Google Fonts esterni | FOUT al primo load + chiamata a server Google (GDPR). Self-host con `font-display: swap` |
| 9 | Documentazione non allineata | `PROJECT.md` ferma a 2 serie / 44 immagini (reali: 3 serie / 56); struttura file non menziona series-3 né CONTENT.md aggiornato |

### 1.3 Problemi MINORI

| # | Problema | Fix |
|---|----------|-----|
| 1 | Shuffle biased: `sort(() => Math.random() - 0.5)` | Fisher–Yates |
| 2 | `gallery (2).html` residuo nella root | Eliminare |
| 3 | Subtitle hero hardcoded in JS (`'A journey through the possible · 2026'` riga ~2294) | Spostare nel manifest (`site.tagline`) |
| 4 | Form contatti senza honeypot anti-spam | Campo nascosto + filtro Formspree |
| 5 | Nessun handling errore se manifest fallisce | Mostrare messaggio invece di pagina vuota (ora solo `console.error`) |
| 6 | `node_modules/` nella cartella di lavoro | Verificare che sia in `.gitignore` del repo deploy |

### 1.4 Cosa è già fatto bene
Lazy loading con IntersectionObserver, sliding window memory management, generation counter anti-race, PhotoSwipe bundlato localmente (no CDN), tema light/dark con no-flash, thumbnails WebP, sistema documentazione SESSION/FIX/PROJECT, navigazione pure-JS compatibile iOS Safari. La base tecnica è solida: l'audit sopra è rifinitura + preparazione al salto "da portfolio a canale di vendita".

---

## PARTE 2 — COME FUNZIONA LO SHARING (spiegazione)

### Il principio: si condivide un LINK, mai il file
Quando qualcuno condivide una tua foto su WhatsApp/Facebook/LinkedIn, **non viene inviata l'immagine: viene inviato un URL**. La piattaforma visita quell'URL con un suo robot, legge i meta tag Open Graph nell'HTML e costruisce l'anteprima:

```
og:title       → titolo mostrato nell'anteprima
og:description → sottotitolo
og:image       → immagine di anteprima (ideale: 1200×630px circa)
```

Tre conseguenze pratiche per te:

1. **Lo sharing non espone nulla di nuovo.** L'anteprima usa l'immagine indicata in `og:image`, che decidi tu: una versione 1200px, volendo con un bordo/firma. I 3000px restano accessibili come oggi, per scelta (punto C dell'audit).
2. **Lo sharing è il tuo funnel di vendita, gratis.** Persona vede la foto su IG → arriva al sito → condivide il link dell'opera → un'altra persona apre il link → "Buy print". Ogni condivisione è pubblicità con la TUA anteprima, il TUO titolo, il TUO link.
3. **Oggi sul tuo sito tutto questo è rotto** (audit, punto A): anteprima vuota, nessun link per singola opera.

### Come si implementa sul tuo sito (sintesi tecnica → M10)
GitHub Pages è hosting statico: niente server che genera meta dinamici. La soluzione standard è **generare pagine share statiche** con uno script Node (estensione di `update-manifest.js`):

```
share/series-1-05.html   ← og:tags di QUELLA foto + redirect a index.html#photo=series-1/05
```

Più, dentro PhotoSwipe, un **bottone Share**: su mobile apre il pannello nativo di condivisione (`navigator.share`, la stessa UI di "condividi" delle app), su desktop copia il link. Zero dipendenze esterne.

### Instagram è un caso diverso
Su Instagram non si condividono URL: si **pubblicano file** (post, carousel, reel). Il sito non può "spingere" contenuti su IG da solo; sei tu (o uno scheduler) a caricare le immagini. Il flusso è inverso: IG porta pubblico → il sito (o lo storefront) converte in vendita. Per IG si prepara un export dedicato: JPG 1080×1350 (4:5), sRGB — una versione "social" appositamente ridotta, mai il master.

---

## PARTE 3 — VENDITA: STRATEGIA CONSIGLIATA

### Print-on-demand fine art: il punto di partenza giusto per te
Confronto richiesto (avevi chiesto "consigliami"):

| | Print-on-demand | Gestione diretta |
|---|---|---|
| Logistica | Zero: stampano e spediscono loro | Tutta a tuo carico (stampa, imballo fine-art, spedizioni internazionali, resi) |
| Investimento iniziale | Zero | Stampante/laboratorio + materiali |
| Margine | ~50-70% del prezzo (tolto costo stampa) | Più alto, ma il tuo tempo è un costo |
| Qualità | Giclée certificata (Hahnemühle ecc.) | Dipende da te/laboratorio |
| Edizioni limitate + certificato | Supportate | Gestione manuale |

**Raccomandazione: parti con print-on-demand**, in particolare [creativehub](https://creativehub.io/) (di theprintspace, ~7.000 artisti): stampa giclée su carte Hahnemühle, edizioni limitate con certificato di autenticità, spedizione mondiale da Londra/New York/Berlino, [dropshipping pensato per chi vende da Instagram](https://www.theprintspace.com/dropship-art-prints-instagram/). Passi alla gestione diretta solo più avanti, eventualmente per opere di punta a prezzo alto, quando avrai volumi e dati.

Per i **file digitali**: sconsiglio di venderli all'inizio — cannibalizzano le stampe e sono incopiabili una volta venduti. Se vorrai farlo: Payhip o Gumroad (gratuiti, prendono % sulla vendita), licenza d'uso chiara.

### Vendere "da Instagram": come funziona davvero
Lo Shop tab di Instagram [è stato rimosso nel 2023](https://www.retaildive.com/news/instagram-meta-remove-shopping-tab/640040/); nel 2026 Meta sta spostando il commercio sui **product tag direttamente nei Reel** ([rollout in corso, richiede ≥1.000 follower nei mercati test](https://www.tubefilter.com/2026/04/07/meta-instagram-reels-product-tags-link-in-bio-end/)). Per ora, realisticamente, la vendita da IG per te è:

1. Post/Reel dell'opera con caption che racconta la storia
2. CTA: "Print available → link in bio"
3. Link in bio → pagina del sito (o storefront creativehub) → acquisto
4. Quando raggiungerai 1.000 follower e il rollout arriverà in Italia: product tag nei Reel = link diretto sull'opera

---

## PARTE 4 — INSTAGRAM: TECNICA E STRATEGIA

### 4.1 Setup tecnico (tutto gratis)

1. **Account IG Creator** (categoria: Photographer) — gratuito, sblocca insights e scheduling
2. Collegamento a una **Pagina Facebook** (richiesta per gli strumenti business)
3. **[Meta Business Suite](https://parrotto-websolution.it/meta-business-suite-guida-completa-aggiornata-al-2026/)** — gratuita: programmi post, carousel e Reel fino a **75 giorni in anticipo, 25 post/giorno**, con analytics. È tutto ciò che ti serve: niente tool a pagamento
4. **API Graph di Meta** (automazione spinta, [gratuita ma richiede app dev + review 2-4 settimane](https://developers.facebook.com/docs/instagram-platform/content-publishing/)): sproporzionata per iniziare. Rivalutare a M12+ solo se la programmazione manuale mensile diventa un collo di bottiglia

### 4.2 Automazione realistica del flusso di pubblicazione

Il collo di bottiglia non è pubblicare: è **preparare** i contenuti. L'automazione giusta per te:

- **Script `export-social.js`** (da costruire, M12): legge `manifest.json`, genera per ogni opera un JPG 1080×1350 sRGB con eventuale firma + un file caption pronto (titolo, storia, luogo/anno, hashtag, CTA). Una serie intera diventa contenuti IG-ready con un comando
- **1 sessione al mese** (2-3 ore): scegli 12-15 contenuti generati dallo script, li carichi in Meta Business Suite, li programmi. Il mese è coperto
- **Reel semplici e replicabili**: zoom lento sulla foto (effetto Ken Burns) + 2 righe di testo + audio in tendenza, 7-15 secondi. Si fanno in 10 minuti l'uno con CapCut (gratis) o direttamente in Business Suite

### 4.3 Strategia per chi "non è una persona social"

La buona notizia: per un fotografo fine-art **non serve essere social, serve essere costante**. Il lavoro creativo l'hai già fatto: 56 opere = 6+ mesi di contenuti.

**Posizionamento.** "Human Frequency" è già un brand narrativo: B&W, documentario, umanità nei margini. Il feed deve essere SOLO questo. Coerenza visiva totale: stesso trattamento, stessa famiglia di caption. Su IG i fotografi crescono per riconoscibilità, non per varietà.

**Formati, in ordine di resa nel 2026:**

1. **Reel** (priorità: è ciò che l'algoritmo spinge ai non-follower) — 1-2 a settimana, formato replicabile di cui sopra
2. **Carousel** 3-5 immagini di una serie con micro-narrazione — 1-2 a settimana, genera "salvataggi" (il segnale che l'algoritmo premia di più)
3. **Stories** — dietro le quinte, sondaggi ("quale stampereste?"), repost di chi ti tagga. Bassa fatica, mantengono vivo il rapporto con i follower

**Caption.** La tua forza è la storia dietro lo scatto: luogo, anno, contesto. 3-5 righe, non saggi. Chiusura fissa: "Limited edition prints — link in bio".

**Hashtag.** 5-10 mirati e di nicchia (#fineartphotography #documentaryphotography #blackandwhitephotography #streetphotographyinternational + tag geografici delle foto). Mai 30 generici.

**Crescita organica (15 min/giorno, davvero):** commenti sinceri sotto foto di fotografi affini, risposta a chi commenta da te, submission ai feature account di fotografia B&W/documentaria (ripubblicano col credito: è il canale di crescita più efficiente per la nicchia).

**LinkedIn: ruolo diverso.** Non è vetrina di vendita: è networking professionale (gallerie, art director, curatori, stampa). 1-2 post al mese, più lunghi: il progetto, il processo, una mostra. Stesso materiale, taglio "dietro il lavoro".

**Metriche che contano:** salvataggi e condivisioni (non i like), click sul link in bio, e — unico vero KPI — vendite. Controllo mensile in Business Suite, si replica ciò che funziona.

**Aspettative oneste:** la crescita organica di un account fotografia parte lenta (mesi, non settimane). L'obiettivo dei primi 6 mesi non è "successo": è 1.000 follower veri (soglia product tag), un feed solido che fa da portfolio vivo, e le prime stampe vendute a sconosciuti.

---

## PARTE 5 — MILESTONE

> Continuano la numerazione M1-M6 (sessione 4). Ordine = dipendenze: prima si protegge e si sistemano le fondamenta, poi si condivide, poi si vende, poi si automatizza.

### M7 — Igiene & fondamenta *(1 sessione)*
- Favicon reale (.ico + png 192/512 + apple-touch-icon) — pending da 7 sessioni
- Contenuti reali in manifest: bio, email, handle Instagram/LinkedIn veri
- Approvazione titoli/meta series-3
- Eliminare `gallery (2).html`; fix shuffle (Fisher–Yates); subtitle hero nel manifest; honeypot form; messaggio d'errore se manifest fallisce
- Aggiornare PROJECT.md (3 serie, 56 img, struttura attuale)

### M8 — Tracciabilità immagini (metadata + watermark invisibile) *(1-2 sessioni)*
*(Rivisto: i 3000px restano online — lo zoom sui pixel è il concept del progetto. Niente C2PA. Strategia: ogni copia in circolazione deve essere riconducibile all'autore.)*

- **Metadata IPTC/EXIF automatici** in tutti i file pubblicati: script batch con `exiftool` che legge autore/©/contatto/titolo opera dal `manifest.json` e li scrive in jpg + webp. Si integra nel workflow esistente (dopo `generate-thumbs.js`, prima del push)
- **Watermark invisibile automatizzato**: script Python batch (`watermark.py`) nella stessa pipeline. Opzioni open source, entrambe blind (non serve l'originale per la verifica):
  - [TrustMark](https://github.com/adobe/trustmark) (Adobe, open source, MIT-style) — robusto a compressione/resize, risoluzione arbitraria, decodifica anche via JS. Nota: è SOLO un watermark con payload arbitrario (es. "AS-2026-s1-05"), NON un'etichetta AI/C2PA
  - [invisible-watermark](https://github.com/ShieldMnt/invisible-watermark) (dwtDctSvd) — più leggero, meno robusto a manipolazioni pesanti
  - Flusso: `node generate-thumbs.js` → `python watermark.py series-N` → `exiftool -@ copyright.args` → push. Un comando wrapper unico (`npm run publish-images`)
- Aggiungere `w`/`h` di ogni immagine nel manifest (elimina il preload di tutte le thumb in `openMuseum` + fix definitivo aspect ratio)
- Valutare firma/bordo discreto solo sulle versioni social export
- (Opzionale) rimuovere i blocchi contextmenu/dragstart: non fermano nessuno e penalizzano i visitatori legittimi

### M9 — SEO & indicizzazione *(1 sessione)*
- og: tags e description **statici** nell'HTML (script che li inietta nel file al deploy, dato che i contenuti stanno nel manifest)
- `sitemap.xml` + `robots.txt` (generati da script dal manifest)
- Structured data JSON-LD: `Person` (artista) + `ImageObject`/`VisualArtwork` per opera
- Alt text per ogni opera (campo `alt` nel manifest); valutare `<img>` reali al posto dei canvas in gallery (o almeno `<noscript>` con immagini per i crawler)
- Self-host dei font

### M10 — Sharing per immagine *(1-2 sessioni)* ← lo "step successivo" richiesto
- Deep link `#photo=<serie>/<n>`: apre PhotoSwipe direttamente sull'opera; aggiornamento hash su change
- Bottone **Share** nella UI PhotoSwipe: `navigator.share` su mobile (pannello nativo), copy-link su desktop
- Script `generate-share-pages.js`: per ogni opera genera `share/<serie>-<n>.html` con og: tags dedicati (og:image 1200px con eventuale firma) + redirect al deep link
- Test anteprime con i debugger ufficiali (Meta Sharing Debugger, LinkedIn Post Inspector)

### M11 — Setup canali social *(1 sessione, in parallelo a M9-M10)*
- IG Creator account + Pagina Facebook + Meta Business Suite
- Bio IG: chi sei / cosa fai / CTA + link (pagina `/links` sul sito, evita Linktree: il traffico resta tuo)
- Profilo LinkedIn aggiornato col progetto
- Primi 9-12 post programmati (la griglia iniziale deve già presentarsi come un portfolio)

### M12 — Automazione contenuti *(1-2 sessioni)*
- Script `export-social.js`: da manifest → JPG 1080×1350 sRGB + caption file (storia + hashtag + CTA) per ogni opera
- Template Reel replicabile (Ken Burns + testo) documentato in docx/
- Routine mensile documentata: 1 sessione batch → 12-15 contenuti programmati in Business Suite
- (Futuro, solo se serve: Meta Graph API per pubblicazione programmatica)

### M13 — Vendita *(1-2 sessioni + setup account)*
- Account creativehub: upload master, definizione edizioni limitate, prezzi, certificati
- Bottone/link **"Buy print"** nella caption bar di PhotoSwipe e nelle pagine share → opera corrispondente sullo storefront
- Pagina "Prints" sul sito (o sezione in About): formati, carte, edizioni, spedizione
- Quando ≥1.000 follower + rollout Italia: product tag nei Reel

### M14 — Misura & iterazione *(continuativa)*
- Check mensile: insights IG (salvataggi, condivisioni, reach non-follower), click link in bio, vendite
- Raddoppiare sui formati che funzionano; rivedere prezzi/opere in evidenza ogni trimestre

---

## Fonti (ricerca 2026-06-11)

- [Meta — Content Publishing API](https://developers.facebook.com/docs/instagram-platform/content-publishing/) · [Guida Instagram Graph API 2026](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/) · [Stato API Instagram 2026](https://storrito.com/resources/Instagram-API-2026/)
- [Rimozione Shop tab Instagram](https://www.retaildive.com/news/instagram-meta-remove-shopping-tab/640040/) · [Product tag nei Reel, 2026](https://www.tubefilter.com/2026/04/07/meta-instagram-reels-product-tags-link-in-bio-end/) · [Meta: "era of link in bio is over"](https://www.retaildive.com/news/era-of-link-in-bio-is-finally-over-instagram-reels-meta/815630/)
- [creativehub](https://creativehub.io/) · [theprintspace — dropship da Instagram](https://www.theprintspace.com/dropship-art-prints-instagram/) · [theprintspace IT](https://www.theprintspace.com/it/)
- [Meta Business Suite — guida 2026](https://parrotto-websolution.it/meta-business-suite-guida-completa-aggiornata-al-2026/) · [Programmare post/Reel](https://metricool.com/scheduling-instagram-posts/)
