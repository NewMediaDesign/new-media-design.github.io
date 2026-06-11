# Session Log — Andrea Spinazzola Gallery

Documento di tracciamento sessioni. Aggiornare ad ogni sessione di lavoro.

---

## Come ripristinare una sessione

1. Leggi l'**ultima sessione** in fondo a questo file per capire dov'eravamo
2. Leggi `PROJECT.md` per l'architettura completa
3. Leggi `CONTENT.md` per i contenuti ancora da fornire
4. Il file di lavoro principale è `g:\____DEVELOPER\Art_Gallery\index.html`
5. Il repo clonato per il deploy è `/tmp/new-media-design.github.io/`
   - Se la cartella non esiste più: `git clone https://github.com/NewMediaDesign/new-media-design.github.io.git /tmp/new-media-design.github.io`

---

## Sessione 1 — 2026-03 (prima sessione)

**Obiettivo iniziale:** Check errori codice + push su GitHub

**Cosa è stato fatto:**
- Analisi e correzione bug su `gallery (2).html` (versione originale base64)
- Ripristino `index.html` dalla versione originale dopo modifiche errate
- Ottimizzazione completa del codice (13 punti approvati dall'utente):
  - Fix `position:fixed` sul museo (era `relative`, non funzionava come overlay)
  - Fix double click listener sulle gallery items
  - Fix bug GRID array (mostrava solo 2 immagini su 4)
  - Fix caption aggiornata prima dell'animazione (ora aggiornata dopo)
  - Tema light/dark con persistenza localStorage + no-flash on load
  - Debounce resize hero canvas (150ms)
  - Touch swipe su hero e museum
  - Escape key chiude overlay in ordine corretto
  - Validazione email form contatti
- **Migrazione immagini base64 → manifest.json** (file da 1.8MB → 43KB)
  - Creato `manifest.json` con struttura serie/immagini
  - Creato `update-manifest.js` per rigenazione automatica
  - Immagini in `images/series-1/01-04.jpg`
- Push iniziale su `NewMediaDesign/new-media-design.github.io`

**Commit chiave:**
- `1f8b089` — refactor: migrate from embedded base64 to manifest.json

---

## Sessione 2 — 2026-03-21

**Obiettivo:** Fix sezione Contact + Implementazione sezione About

**Problema 1 — Contact: pulsante chiusura**
- Problema: il bottone Back nella `contact-header` era nascosto dal `header` principale (z-index 200 vs 900)
- Soluzione finale: X button (`contact-close`) posizionato `absolute` in alto a destra del box form
- Il form ora è racchiuso in un box con bordo sottile (`border: 1px solid var(--border)`)

**Problema 2 — Light mode white-on-white**
- Problema: chiudere contact rimuoveva classe `solid` dall'header anche se altri overlay erano aperti
- Soluzione: guard su `closeContact()`, `closeGallery()`, `closeAbout()` — rimuovono `solid` solo se nessun altro overlay è aperto

**Problema 3 — Menu Contact non funzionava dal Museum**
- Problema: `openContact()` non chiudeva il museo (z-index 800 > 200)
- Soluzione: `openContact()` e `openGallery()` ora chiamano `closeMuseum()` se il museo è aperto

**Sezione About — implementata da zero:**
- Overlay full-screen con stessa animazione di gallery/contact
- Layout split: foto sinistra (42%), contenuto testo destra
- Mobile: stacked (foto sopra, testo sotto)
- Foto: `images/AS_BW_PORTRAIT_02.png`
- Bio, email link, Instagram link
- `navAbout` collegato a `openAbout()` / `closeAbout()`
- Escape key aggiornato per includere aboutOverlay

**Commit chiave:**
- `49468af` — fix: contact back button position and light mode header visibility
- `ba6fc16` — fix: red debug button + museum nav + header solid guards
- `87b2fec` — fix: move contact close button to top-right of form container
- `00c5f69` — feat: box contact form with minimal X close button
- `834d2c3` — feat: add About section with photo/bio layout
- `5553da5` — feat: wire About photo and fix menu completeness

**Stato al termine della sessione:**
- ✅ Tutto deployato su GitHub Pages
- ✅ 4 menu funzionanti: Work, About, Contact (Series = placeholder)
- ⏳ Vedere CONTENT.md per contenuti ancora da aggiornare

---

## Sessione 3 — 2026-03-21

**Obiettivo:** Masonry gallery, navigazione menu, performance mobile, sistema documentazione

---

**1 — Sistema documentazione sessioni**
- Creata cartella `docx/` con tre file: `PROJECT.md`, `SESSION.md`, `CONTENT.md`
- Pushata anche nel repo GitHub per persistenza
- Creata memoria persistente Claude Code in `C:\Users\spina\.claude\projects\...`

---

**2 — Gallery: da grid fisso a masonry con shuffle**
- Rimosso grid CSS hardcoded per 4 immagini
- Nuovo sistema: 3 colonne su desktop, 2 su mobile (flex columns)
- 3 altezze casuali (220/320/440px desktop, 180/260/360px mobile)
- Distribuzione bilanciata per colonne (algoritmo shortest-column-first)
- Immagini rimescolate casualmente ad ogni apertura gallery
- Aggiunto bottone shuffle (icona frecce incrociate) nella series bar con animazione spin

---

**3 — Nuove immagini series-1**
- Da 4 a 19 immagini (01–20, manca 14)
- `manifest.json` aggiornato con tutte le entry
- Immagini pushate su GitHub: `images/series-1/05-20.jpg`

---

**4 — UX: link home + Back nel museo**
- "Andrea Spinazzola" in header → ora è un button che chiude tutto e torna alla hero
- Museum: aggiunto bottone "Back" in alto a sinistra (sostituisce spacer), chiude il museum e torna alla gallery
- La X rimane a destra come alternativa

---

**5 — Fix navigazione menu (refactor completo)**
- **Problema**: overlay multipli a z-index:200 si sovrapponevano; passare da una sezione all'altra non funzionava
- **Soluzione**: migrazione da logica JS `.open` a **CSS `:target`** nativo
  - I nav link ora usano `href="#galleryOverlay"`, `href="#aboutOverlay"`, `href="#contactOverlay"`
  - Il browser gestisce show/hide degli overlay nativamente tramite `:target`
  - JS gestisce solo side-effects: header solid, hero timer start/stop, nav active state
  - `goHome()` usa `history.pushState` per pulire l'hash senza aggiungere history entry
  - `hashchange` event listener unico per tutti gli aggiornamenti di stato
- Eliminati: `openGallery`, `closeGallery`, `openAbout`, `closeAbout`, `openContact`, `closeContact` (6 funzioni → 1)

---

**6 — Performance: lazy loading + load bar**
- **Problema**: tutte le 19 immagini caricate al primo load → mobile bloccato
- `initFromManifest`: crea Image objects senza `src` (nessun download al boot)
- Al boot si caricano SOLO le prime 2 immagini (hero)
- `buildGalleryGrid`: `IntersectionObserver` con `rootMargin: 400px` — ogni immagine si carica solo quando sta per entrare nel viewport
- `goToSlide`: carica l'immagine target + precarica silenziosamente la successiva
- `openMuseum`: precarica i-1, i, i+1 prima di renderizzare
- `ensureImg(i, cb)`: funzione utility centralizzata per il lazy loading
- **Load bar**: barra animata 2px in cima (indeterminata, stile GitHub), appare mentre immagini scaricano, scompare da sola

---

**Commit chiave sessione 3:**
- `f95fc4e` — feat: add 15 new images to series-1 (05-20, skip 14)
- `f0f4e0f` — docs: add session/project/content documentation system
- `2903dc5` — feat: masonry layout with random shuffle
- `73e2a62` — feat: home link on name + Back button in museum
- `b3583b3` — fix: rewrite nav logic with goHome()
- `371a120` — refactor: replace JS overlay toggling with CSS :target navigation
- `bda00d6` — perf: lazy loading + load bar indicator

**Ultimo commit:** `bda00d6` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Gallery masonry con shuffle casuale e bottone re-shuffle
- ✅ 19 immagini in serie (manifest aggiornato)
- ✅ Navigazione menu funzionante via CSS :target
- ✅ Lazy loading attivo — mobile nettamente più veloce
- ✅ Load bar discreta durante caricamento immagini
- ✅ Museum con Back button
- ✅ "Andrea Spinazzola" = link home

**Pending / prossima sessione:**
- Aggiornare testi About (bio, email reale, Instagram handle)
- Implementare sezione Series (attualmente placeholder)
- Valutare ottimizzazione immagini lato server (WebP, thumbnails)
- Meta description, favicon, og:image per SEO

---

## Sessione 4 — 2026-03-22

**Obiettivo:** Fix mobile + Roadmap completa M1-M6

**Fix mobile (inizio sessione):**
- Bug critico: `const galleryOverlay` dichiarata due volte → SyntaxError che uccideva tutto il JS su iOS Safari
- Fix iOS Safari hashchange: aggiunto `navigateTo()` con `setTimeout(updateNav, 0)` come fallback
- Fix IntersectionObserver: cambiato root da viewport a `galleryWall` per container `position:fixed`

**M1 — Content Layer:**
- Sezione `about` e `seo` aggiunte a manifest.json
- index.html legge tutto l'About da manifest (niente hardcoded)
- Meta tag SEO iniettati dinamicamente

**M3 — Image Pipeline:**
- Installato `sharp` (npm), creato `generate-thumbs.js`
- 19 thumbnail WebP 600px generati: 39MB → 1.1MB (~60KB/img)
- Gallery usa thumbnail, museum usa full-size 3000px on demand

**M4 — Automation:**
- `update-manifest.js` riscritto: non-distruttivo, multi-serie, preserva metadata esistenti

**M5 — Series Section:**
- Overlay `#seriesOverlay` con grid di card serie
- `navSeries` ora funzionante, `loadSeries(id)` permette cambio serie runtime

**M6 — SEO:**
- Meta description, og:image, og:title, og:type nel `<head>`

**Commit chiave:**
- `88c04ef` — fix: resolve duplicate const SyntaxError + iOS Safari nav + IntersectionObserver root
- `5eb40d4` — feat: M1-M6 — content layer, thumbnails, series section, SEO

**Workflow per aggiungere nuove immagini:**
1. Copia JPG in `images/series-N/`
2. `node generate-thumbs.js series-N`
3. `node update-manifest.js`
4. Edita `manifest.json` — aggiorna titoli/descrizioni
5. Copia nel repo + git push

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon
- Test multi-serie quando disponibile serie-2

---

## Sessione 5 — 2026-03-22

**Obiettivo:** Fix freeze deterministico alla 17ª immagine + loading indicators + stabilità generale

---

**1 — Shimmer skeleton + museum spinner**
- Aggiunto CSS `@keyframes shimmer` su `.g-item.loading::after` per placeholder animato durante caricamento thumbnail
- Aggiunto spinner CSS (`#museumSpinner`) centrato nel museum durante caricamento full-size

---

**2 — OOM / freeze da immagini accumulate**
- Problema: immagini 3000px accumulate in memoria senza mai essere liberate
- Soluzione: `unloadDistantImgs(centerIdx, keepRadius)` — libera img.src per immagini a distanza > `WINDOW_RADIUS=2`
- Sliding window preload (`preloadWindow`): carica current ±1 ±2 in ordine di priorità, come le app di dating

---

**3 — Navigazione: CSS :target → pure JS .active**
- Problema: iOS Safari sopprimeva hashchange per elementi fixed → overlay non si aprivano
- Soluzione: sostituito CSS `:target` con sistema JS puro basato su classi `.active`
- `setSection(section)` / `navigateTo(section)` / `goHome()` gestiscono tutto
- `popstate` listener per back/forward browser
- Eliminata dipendenza da hash URL per la visibilità degli overlay

---

**4 — Fix observer leak**
- `buildGalleryGrid()` ricreava 19 ResizeObserver + 19 IntersectionObserver ad ogni apertura gallery
- Soluzione: build solo al primo open + `_galleryResizeObs[]` / `_galleryIntersectObs[]` per disconnect prima del rebuild

---

**5 — Fix museum: blocchi navigazione, canvas 0x0, callback stale**
- `offCtx.drawImage(mCanvas, 0, 0)` crashava quando il canvas non era ancora stato disegnato → guard + try/catch
- Museum z-index:800 rimaneva aperto quando si navigava ad altre sezioni → `setSection()` chiama `closeMuseum()`
- `mIdx = -1` sentinel: marca museum come "in apertura" prima del primo render, protegge prev/next/swipe
- `slideTarget` guard: ogni `go()` callback verifica di essere ancora l'ultimo target richiesto, quelli stale si annullano
- `closeMuseum()` ora azzera `mImg.onload = null` e `mImg.onerror = null` per evitare callback ghost

---

**6 — Fix freeze deterministico alla 17ª immagine (race condition)**
- Root cause: `unloadDistantImgs` abortiva un download settando `img.src = ''`; il browser accodava un evento abort; `ensureImg` riavviava immediatamente il download e resettava `img._imgError = false`; l'evento abort accodato si scatenava DOPO il riavvio → settava `_imgError = true` sul download fresco → `slideToImage` chiamava `go()` senza aspettare il load → `drawImage` con `naturalWidth=0` → eccezione in `frame` RAF → `slideAnim` mai azzerato → navigazione permanentemente bloccata
- Fix 1: **Generation counter** — `unloadDistantImgs` incrementa `img._gen` prima di azzerare `img.src`; `ensureImg` cattura `gen` all'avvio del download; il listener error ignora se `img._gen !== gen`
- Fix 2: **try/catch in `frame`** — se `drawImage` lancia eccezione, `slideAnim = null` viene comunque eseguito e si richiama `loadMuseumImage` come fallback

---

**Commit chiave:**
- `3380398` — fix: generation counter prevents stale abort events from corrupting image state

**Ultimo commit:** `3380398` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Freeze alla 17ª immagine risolto definitivamente
- ✅ Sliding window memory management (WINDOW_RADIUS=2)
- ✅ Navigazione pure JS, funzionante su iOS Safari
- ✅ Observer leak eliminato
- ✅ Museum robusto: spinner, guard, stale-callback protection

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon .ico reale (attualmente usa WebP come fallback)
- Test multi-serie quando disponibile serie-2

---

---

## Sessione 6 — 2026-03-24

**Obiettivo:** Hamburger menu mobile + responsive navigation

**Problema:** Su mobile (≤540px) la regola CSS `nav a:not(.active){display:none}` nasconde tutti i link non-attivi. L'utente non può navigare verso About, Contact, Series.

**Soluzione pianificata:**
- Aggiungere hamburger button in header (visibile solo su mobile)
- Menu fullscreen overlay mobile con tutti i link di navigazione
- Mantenere: theme toggle sempre visibile, accesso diretto a Work
- JS: toggle menu, chiudi al click su link, chiudi su `navigateTo()`

**Cosa è stato fatto:**
- Rimossa regola `nav a:not(.active){display:none}` (540px) che nascondeva i link su mobile
- Breakpoint cambiato a 768px: su mobile l'intera `<nav>` è nascosta, compare hamburger button
- Hamburger button: icona 3 righe, posizionato tra `<nav>` e `.h-right` nell'header
- Mobile menu fullscreen overlay (`#mobMenu`, z-index:950) con 4 link grandi tipografici
- `MOB_LINKS` map parallela a `NAV_LINKS` per sincronizzare stato `.mob-active`
- `setSection()` aggiorna `.mob-active` sui link del menu mobile
- `navigateTo()` chiude il menu mobile prima di navigare
- `openMuseum()` nasconde hamburger + chiude menu mobile; `closeMuseum()` ripristina hamburger
- Escape key: primo livello chiude menu mobile (poi museum, poi home)

**Commit chiave:**
- (da pushare)

**Pending / prossima sessione:**
- Debug caricamento immagini mobile (dimensione file)
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere
- Favicon .ico reale
- Test multi-serie (serie-2)

## Sessione 7 — 2026-03-25

**Obiettivo:** Museum swipe peek — immagine adiacente visibile durante il drag

**Problema:** `startAdjCanvas(dir)` era definita ma mai chiamata — `adjCanvas` esisteva e disegnava l'immagine vicina ma rimaneva sempre nascosto (`adjDrawn=false`).

**Fix:**
- `mousemove`: quando `isSwipeDragging` e `Math.abs(dx)>8` → `startAdjCanvas(dx>0?-1:1)` (guard `adjInitialized`)
- `touchmove`: quando drag supera 8px → stessa chiamata basata sul segno di `dragOffset`
- `completeSwipe`: aggiunto `_adjReset()` prima di `renderMuseum()` per pulire lo stato

**Commit chiave:**
- `0d33e56` — feat: museum swipe peek — show adjacent image during drag

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon .ico reale
- Test multi-serie (serie-2)

---

## Sessione 8 — 2026-03-25

**Obiettivo:** Sostituzione completo museum viewer canvas → PhotoSwipe v5 + UX polish

---

**1 — Refactor museum: canvas custom → PhotoSwipe v5**
- Rimossi ~430 righe di codice canvas custom (swipe, zoom/pan, crossfade, adj canvas, sliding window)
- Integrato PhotoSwipe v5 da CDN (`photoswipe@5.4.4`)
  - CSS: `dist/photoswipe.css`
  - JS: `dist/umd/photoswipe.umd.min.js` (path corretto — la versione `@5` senza subfolder dava 404)
- `openMuseum(idx)` crea istanza PhotoSwipe con `dataSource` da `IMAGES[]`
- `closeMuseum()` chiama `pswp.close()`
- Swipe, zoom/pan, pinch, keyboard, lazy loading gestiti nativamente dalla libreria

---

**2 — Customizzazione UI PhotoSwipe**
- Back button (top-left) via `uiRegister` con classe `.pswp__button--pswp-back`
- Caption bar (bottom) via `uiRegister` con title/desc/meta dal manifest
- Copyright "© Andrea Spinazzola" posizionato dinamicamente sotto il bordo inferiore-sinistro dell'immagine
- Tema light/dark via CSS custom properties (`--pswp-bg: var(--bg)` ecc.)

---

**3 — Frecce desktop (zona)**
- Frecce visibili solo quando mouse entra nel 22% sinistro / 78% destro del viewport
- Classe `.zone-active` aggiunta/rimossa via `mousemove` su `.pswp`
- Nascoste completamente su touch (`@media(hover:none)`)
- Stile: `<polyline>` singola, `stroke-width: 1.5`, round caps/joins, coordinate per viewBox 32×32

**Fix critico frecce:** `arrowPrevSVGString` accetta solo il contenuto SVG interno (PhotoSwipe crea già `<svg viewBox="0 0 32 32">`), non un tag `<svg>` completo — coordinate aggiornate per il viewBox 32×32.

---

**4 — Passepartout responsivo**
- Funzione `pswpPadding(viewportSize)` invece di valori fissi
- Desktop (≥768px): `left/right = 14% del viewport` (≈200px su 1440px)
- Mobile: `left/right = 20px`
- `top: 48` (top bar), `bottom: 60` (caption bar)

---

**5 — Zoom pixel originali**
- `width: 3000, height: Math.round(3000 * thumbAspect)` — dimensioni full-res stimate con aspect ratio corretto dalla thumbnail caricata
- `secondaryZoomLevel: 1` → click/doppio-tap zooma ai pixel originali (3000px = 1:1)
- `tapAction: 'zoom'`, `doubleTapAction: 'zoom'`

---

**Commit chiave:**
- `c5c4730` — refactor: replace custom canvas museum with PhotoSwipe v5 (-527 righe)
- `b9509b2` — fix: correct PhotoSwipe CDN paths (404 → 200)
- `27e36a0` — feat: passepartout, copyright, arrow zones, zoom on click
- `ae9718c` — fix: arrows SVG polyline 32×32, passepartout 14vw, zoom 100%, copyright position

**Ultimo commit:** `ae9718c` — branch `main`

---

**Stato al termine della sessione:**
- ✅ PhotoSwipe v5 integrato e funzionante
- ✅ Passepartout responsivo (~14vw desktop)
- ✅ Frecce a zona con stile coerente al sito
- ✅ Zoom ai pixel originali (click/doppio-tap)
- ✅ Copyright posizionato dinamicamente sotto l'immagine
- ✅ Caption bar con titolo/desc/meta

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon .ico reale
- Test multi-serie (serie-2)
- Verificare comportamento zoom su mobile (pinch)

---

## Sessione 9 — 2026-03-25

**Obiettivo:** Fix UX PhotoSwipe: passepartout uguale su 4 lati, frecce custom, copyright su zoom, bundle locale

---

**1 — Fix frecce: opzioni errate (bug silenzioso)**
- Problema: `arrowPrevSVGString` / `arrowNextSVGString` non esistono in PhotoSwipe v5 → libreria le ignorava silenziosamente e mostrava le sue frecce di default
- Fix: opzioni corrette sono `arrowPrevSVG` / `arrowNextSVG` e richiedono **tag `<svg>` completo** con `class="pswp__icn"`, `aria-hidden="true"`, `viewBox`, `width`, `height`
- Forma: `<polyline>` singola a chevron `<` / `>`, 50×50px, `stroke-width: 1.2`, round caps
- Nascosta ombra PhotoSwipe di default: `.pswp__icn-shadow { display: none }`

**2 — Fix frecce: sempre visibili (specificità CSS)**
- Problema: PhotoSwipe aggiunge `.pswp--has_mouse` che imposta `opacity: .85` con selettore più specifico del nostro `.pswp__button--arrow`
- Fix: aggiunto `!important` su tutte le regole arrow + duplicato regole con `.pswp--has_mouse` per coprire ogni caso
- Logica zona hover (`.zone-active`) mantiene `!important` per prevalere

**3 — Fix passepartout: funzione vs oggetto**
- Problema: `padding: pswpPadding` passava una funzione — PhotoSwipe v5.4.4 si aspetta un **oggetto plain** `{top, bottom, left, right}` → ignorava il valore, nessun gap
- Fix: `calcPswpPadding()` chiamata all'apertura, ritorna oggetto con gap visivo uguale su 4 lati
- Formula: `p = 3% del viewport width`; `top: p+48`, `bottom: p+52`, `left: p`, `right: p`
  (le barre di 48px e 52px si sommano per mantenere il gap visivo P uguale su tutti i lati)
- Gap finale: ~43px su 1440px (richiesta utente: circa 60px su schermo, poi ridotto a 3%)

**4 — Fix copyright: nascosto su zoom**
- Evento `zoomPanUpdate`: confronta `pswp.currZoomLevel` con `zoomLevels.initial`
- Se zoom > fit+0.01 → `opacity: 0`; se ritorna a fit → `opacity: 0.45` + ricalcola posizione
- Transizione CSS `opacity .25s` per fade fluido
- Opacity di default in CSS = 0 (JS controlla tutto)

**5 — Bundle PhotoSwipe localmente**
- Rimossa dipendenza CDN `cdn.jsdelivr.net` (rischio downtime, privacy visitatori)
- Scaricati in `lib/photoswipe.css` (7KB) e `lib/photoswipe.umd.min.js` (54KB)
- References aggiornate in `index.html` → `href="lib/photoswipe.css"` / `src="lib/photoswipe.umd.min.js"`
- File committati nel repo GitHub Pages

---

**Commit chiave:**
- `90ab987` — fix: arrows !important overrides, equal passepartout all sides, copyright hides on zoom
- `50c1b8d` — fix: passepartout — pass padding as plain object (PhotoSwipe v5 ignores function)
- `2376c32` — feat: bundle PhotoSwipe v5.4.4 locally (no CDN dependency)
- `09cb9cd` — fix: passepartout ~60px (4.2vw), frecce 50px stroke singolo
- `47607e1` — fix: frecce orientamento (solo prev + scaleX flip), gap 3%
- `fa4706e` — fix: frecce custom SVG con arrowPrevSVG/arrowNextSVG (opzioni corrette PhotoSwipe v5)

**Ultimo commit:** `fa4706e` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Passepartout ~3vw uguale su tutti e 4 i lati (formula con offset barre)
- ✅ Frecce custom chevron via `arrowPrevSVG`/`arrowNextSVG` (nome opzione corretto)
- ✅ Frecce visibili solo su hover zone sinistra/destra (non su touch)
- ✅ Copyright nascosto durante zoom, riposizionato al ritorno a fit
- ✅ PhotoSwipe bundlato localmente — zero dipendenze CDN esterne

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon .ico reale
- Test multi-serie (serie-2)

---

## Sessione 10 — 2026-03-25

**Obiettivo:** Fix freccia destra invertita, copyright z-index, cursore mobile, icona shuffle, sistema documentazione bug

---

**1 — Fix freccia next invertita**
- Problema: PhotoSwipe applica `transform: scaleX(-1)` alla `.pswp__icn` della freccia next via CSS — anche con SVG custom `>`, l'icona veniva specchiata e diventava `<`
- Fix: aggiunto `transform: none !important` su `.pswp__button--arrow--next .pswp__icn` in CSS
- `arrowNextSVG` disegna `>` (punta a destra); con `transform: none` non viene specchiato → orientamento corretto
- `stroke-width` ridotto a 1pt

**2 — Fix copyright z-index (sopra/sotto immagine)**
- Problema: copyright appariva sopra l'immagine anche a zoom — `z-index: 2` del copyright era superiore a `z-index: 1` di `.pswp__scroll-wrap` (default PhotoSwipe)
- Tentativo errato: impostare `z-index: 5` su scroll-wrap non risolveva perché il copyright (aggiunto dopo nel DOM) manteneva precedenza
- Fix corretto: copyright `z-index: 0` → inferiore al default `z-index: 1` di scroll-wrap → immagine zoommata copre il copyright naturalmente

**3 — Cursore custom su mobile**
- Problema: il div cursore rimaneva bloccato in posizione su touch (nessun `mousemove` su mobile)
- Fix: doppio gate
  - CSS: `@media(pointer:coarse){ .custom-cursor{ display:none !important; } }` — nascosto su touch
  - JS: `const HAS_MOUSE = window.matchMedia('(pointer: fine)').matches` — i listener mouse sono attaccati solo se c'è un mouse

**4 — Icona shuffle sostituita**
- Sostituita con SVG custom fornito dall'utente (due frecce circolari, stile 21×21px)
- CSS semplificato: rimosse proprietà stroke/fill ereditate dall'SVG esterno, dimensione fissa 16×16px

**5 — Sistema documentazione bug (FIX.md + CLAUDE.md)**
- Creato `docx/FIX.md`: registro persistente di tutti i bug risolti con causa, sintomo, soluzione
- Creato `CLAUDE.md` nella root: istruzioni di avvio sessione — leggere SESSION.md e FIX.md prima di qualsiasi intervento
- Entrambi i file pushati nel repo GitHub

---

**Commit chiave:**
- `f459614` — fix: freccia destra orientamento (transform:none), stroke-width 1
- `1001a61` — docs: add FIX.md bug registry + CLAUDE.md session startup instructions
- `b92034e` — fix: copyright z-index 2 (sotto immagine zoom), font 6px
- `10e95c7` — fix: cursor nascosto su touch, copyright 7px, shuffle icon completa
- `0bb0a02` — feat: shuffle icon custom SVG
- `e13c63a` — fix: copyright z-index 0 (sotto scroll-wrap z-index 1)

**Ultimo commit:** `e13c63a` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Frecce: custom SVG, orientamento corretto, visibili solo su hover zone
- ✅ Copyright: z-index 0, coperto dall'immagine a zoom, 7px
- ✅ Cursore custom: nascosto su mobile, funzionante su desktop
- ✅ Icona shuffle custom SVG
- ✅ FIX.md + CLAUDE.md: sistema documentazione bug attivo

**Pending / prossima sessione:**
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Favicon .ico reale
- Test multi-serie (serie-2)

---

## Sessione 11 — 2026-03-25

**Obiettivo:** Fix mobile (caption, cache, copyright zoom) + polish tipografico hero/caption

---

**1 — Fix cache manifest.json su mobile [FIX-011]**
- Problema: caption immagini su mobile mostravano dati vecchi, anche in incognito e su browser diversi
- Causa: `fetch('manifest.json')` senza cache-busting → CDN GitHub Pages serviva versione cached dall'edge server
- Fix: `fetch('manifest.json?v=' + Date.now())` — timestamp unico rende ogni richiesta un URL mai cached
- Dominio confermato: `new-media-design.it/gallery/`

---

**2 — Fix copyright non si nasconde su zoom [FIX-012]**
- Problema: "© Andrea Spinazzola" restava visibile sopra l'immagine zoommata
- Causa: `pswp.currZoomLevel` non esiste in PhotoSwipe v5 → era `undefined` → confronto sempre `false`
- Fix: `pswp.currSlide.currZoomLevel` (proprietà corretta)

---

**3 — Fix caption meta nascosto su mobile [FIX-013]**
- Problema: località e anno (es. "SÃO PAULO · 1989") non visibili su mobile
- Causa: `@media(max-width:480px){ .pswp-cap-meta{ display:none; } }`
- Fix: rimosso `display:none`, mantenuto solo cambio layout `flex-direction:column`

---

**4 — Hero subtitle: testo e tipografia**
- Testo cambiato: "A visual journey through the possible · 2026" → "A journey through the possible · 2026"
- Font-size hero subtitle aumentato: `clamp(7px,1.8vw,9px)` → `clamp(10px,1.1vw,16px)`
- Rimossa regola fissa mobile `13px` → ora scala fluidamente come il titolo "Human Frequency"

---

**5 — Caption museum: polish tipografico**
- Rimosso "Human Frequency" da tutte le 19 description in `manifest.json` → solo "Amerika" (nome serie)
- Serie (`.pswp-cap-desc`): aggiunto `font-style: italic` — gerarchia: **titolo bold** / *serie italic* / `meta monospace`
- Meta monospace (`.pswp-cap-meta`): `letter-spacing` ridotto da `+0.18em` a `-0.02em` — più compatto e leggibile

---

**6 — Hero subtitle: riduzione corpo e spaziatura**
- Font-size ridotto di 1pt: `clamp(10px,1.1vw,16px)` → `clamp(9px,1vw,15px)`
- Letter-spacing ridotto drasticamente: `.32em` → `-0.02em` (avvicinamento negativo per monospace più editoriale)
- Risultato: testo su una sola riga su tutti i breakpoint

---

**7 — Caption museum: forzata su riga singola**
- `.pswp-caption`: `flex-wrap: wrap` → `flex-wrap: nowrap` — impedisce il wrap degli elementi
- Rimossa media query `@media(max-width:480px)` che forzava `.pswp-cap-body` in `flex-direction:column`
- Risultato: **Silence** · *Amerika* · `SÃO PAULO · 1989` — tutto su una riga, layout editoriale pulito

---

**Commit chiave:**
- `8b86ab6` — fix: cache-bust manifest.json + hero tagline text + mobile font size
- `b2a0a3d` — fix: show caption meta (location/year) on mobile
- `b3a1201` — fix: copyright hides on zoom (currSlide.currZoomLevel) + responsive hero subtitle
- `599304e` — feat: caption — italic series, tight monospace, remove Human Frequency from desc
- `e2605ca` — docs: session 11 + FIX-011/012/013
- `6bdd2e9` — fix: hero subtitle smaller + tighter spacing, caption forced single line

**Ultimo commit:** `6bdd2e9` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Caption complete su mobile e desktop, su riga singola
- ✅ Copyright si nasconde correttamente su zoom (fix `currSlide.currZoomLevel`)
- ✅ manifest.json sempre fresco via cache-buster `?v=Date.now()`
- ✅ Hero subtitle responsive con avvicinamento negativo, tipografia editoriale
- ✅ Tipografia caption: **titolo bold** / *serie italic* / `meta monospace -0.02em`
- ✅ File riformattato dall'editor (prettified CSS/HTML)

**Pending / prossima sessione:**
- Favicon .ico reale
- Test multi-serie (serie-2)
- Valutare letter-spacing monospace anche su altri elementi (series-bar, gallery caption index)

---

## Sessione 12 — 2026-04-01

**Obiettivo:** Fix responsive mobile + stabilità navigazione

---

**1 — Breakpoint mobile 768px completo**
- Aggiunta media query `@media(max-width:768px)` con ridimensionamento testo, padding e layout
- Hero title e subtitle scalano correttamente su schermi piccoli

**2 — Fix pagina bianca su refresh con hash #work**
- Problema: ricaricare la pagina con `#work` nell'URL causava pagina bianca
- Fix: gestione corretta dello stato iniziale al load quando un hash è già presente
- Tipografia hero mobile migliorata

**3 — Hero title mobile + no-cache meta**
- Hero title ridotto del 10% su mobile per evitare overflow
- Aggiunti meta tag `Cache-Control: no-cache, no-store, must-revalidate` + `Pragma: no-cache` + `Expires: 0` nel `<head>` per forzare reload freschi

---

**Commit chiave:**
- `8a7854a` — fix: comprehensive mobile breakpoint 768px — scale text, padding and layout
- `08d102f` — fix: page refresh on #work hash no longer causes blank page + hero mobile typography
- `bf8287f` — fix: hero title 10% smaller on mobile + no-cache meta tags for fresh reloads

**Ultimo commit:** `bf8287f` — branch `main`

---

## Sessione 13 — 2026-04-01

**Obiettivo:** Implementazione serie-2 "Pulse"

---

**1 — Nuova serie: Pulse (series-2)**
- 25 immagini full-size in `images/series-2/` (01-25.jpg)
- 25 thumbnail WebP in `images/series-2/thumbs/` (generati con generate-thumbs.js)
- Manifest aggiornato con serie completa: id `series-2`, titolo "Pulse", subtitle "Human Frequency · 2026"
- Ogni immagine ha titolo, descrizione ("Pulse") e meta (città · anno)

**2 — Contenuti serie-2**
- 25 titoli assegnati: Iron, Behind Bars, The Kiss, The Elder, Departure, Ascent, Grace, The Wait, Three Generations, Oracle, The Wind, Sonata, The Gaze, Highway, Summer, Mother and Daughter, The Fighter, Skull, The Crowd, Joy, Written, The Dancer, Golden Hour, The Frame, Rubble
- Località: Copacabana, São Paulo, Rio de Janeiro, Recife, Belo Horizonte, Buenos Aires, Salvador, Havana, Lima, Fortaleza, Caracas, Bogotá, México DF, Montevideo, Port-au-Prince
- Periodo: 1982–2010

---

**Nota:** Sessione interrotta prima del deploy e dell'aggiornamento documentazione. Completato in sessione 14.

---

## Sessione 14 — 2026-04-02

**Obiettivo:** Deploy series-2 + gallery multi-serie + fix deformazione immagini + UX museum

---

**1 — Deploy series-2 "Pulse"**
- Push completo: 25 jpg + 25 webp thumbs in `images/series-2/`
- `manifest.json` aggiornato con tutte le entry series-2
- Documenti recuperati: SESSION.md (sessioni 12-14), PROJECT.md (struttura aggiornata)

---

**2 — Gallery multi-serie**
- Nuova funzione `loadAllSeries()`: combina tutte le serie in un unico array `IMAGES`
- Hero slideshow limitato alla hero series (series-1, 19 immagini) via `heroSeriesCount`
- Gallery masonry mostra tutte le immagini di tutte le serie mescolate (44 totali)
- Series bar mostra "Human Frequency" con "Amerika · Pulse"
- Bottone hero rinominato "View Series" → "Gallery"

---

**3 — Navigazione serie separate**
- Click su card serie → `loadSeries(seriesId)` carica SOLO quella serie
- `singleSeriesMode = true` → PhotoSwipe `loop: false` (swipe si ferma alla fine)
- Back button in gallery (single mode) → torna alla pagina Series
- Nav "Work" e bottone "Gallery" → resetta sempre a gallery completa (`loadAllSeries()`)
- Mobile menu "Work" → stessa logica di reset

---

**4 — Fix deformazione immagini nel museum [FIX-014]**
- Causa: thumbnail non ancora caricate → aspect ratio fallback 2:3 → PhotoSwipe mostrava immagini deformate
- Fix 1: `openMuseum()` pre-carica TUTTE le thumbnail prima di aprire PhotoSwipe
- Fix 2: event listener `contentLoadImage` aggiorna dimensioni reali + `slide.updateContentSize(true)`

---

**5 — Menu sempre visibile nel museum [FIX-015]**
- Problema: hamburger nascosto nel museum → utente bloccato
- Fix: header con `z-index: 100001` (sopra PhotoSwipe 100000) quando museum è aperto
- Classe CSS `header.museum-open` aggiunta/rimossa su open/destroy

---

**6 — Hero dots nascosti**
- `.hero-dots { display: none }` — hero auto-cycle senza interazione utente
- Codice JS mantenuto per eventuale riattivazione futura

---

**Commit chiave:**
- `6df20f1` — feat: add series-2 "Pulse" (25 images + thumbs) + update docs
- `be1c823` — fix: combine all series in gallery + fix PhotoSwipe image deformation
- `0c92ad5` — feat: separate series navigation + gallery shows all images
- `d7ef6a7` — fix: menu always visible in museum + hide hero dots + preload thumbs

**Ultimo commit:** `d7ef6a7` — branch `main`

---

**Stato al termine della sessione:**
- ✅ Series-2 "Pulse" deployata (25 immagini + thumbs)
- ✅ Gallery mostra tutte le serie mescolate (44 immagini)
- ✅ Serie separate: click card → solo quella serie, no loop, Back → Series
- ✅ Menu (hamburger + nav) sempre accessibile, anche nel museum
- ✅ Hero dots nascosti
- ✅ Fix deformazione immagini (preload thumbnail + contentLoadImage)

**Pending / prossima sessione:**
- Favicon .ico reale
- Verificare comportamento deformazione su mobile (potrebbe servire ulteriore tuning)
- Aggiornare contenuto reale: bio, email, Instagram, titoli opere in manifest.json
- Valutare UX alla fine di una serie (single mode): chiusura automatica o messaggio?

---

## Sessione 15 — 2026-04-10

**Obiettivo:** Aggiunta serie-3 "Apart"

**Cosa è stato fatto:**
- 12 immagini già presenti in `images/series-3/` dall'utente
- Generati 12 thumbnail WebP 600px con `generate-thumbs.js`
- Aggiornato `manifest.json` con `update-manifest.js` (scaffold) + titoli/descrizioni/meta manuali
- Serie: id `series-3`, title `"Apart"`, subtitle `"Human Frequency · 2026"`
- Titoli assegnati dall'analisi visiva delle immagini (ritratti B&W, contesti di marginalità globale):
  01 The Stare / Dhaka · 2003 — 02 Wind / Belém · 1998 — 03 Refuge / Mumbai · 2001
  04 The Wrap / Lagos · 2005 — 05 Longing / Medellín · 1999 — 06 Brothers / Luanda · 2002
  07 The Mask / Salvador · 2007 — 08 The Dreamer / Kinshasa · 2004 — 09 The Matriarch / Port-au-Prince · 2000
  10 The River / Manaus · 1997 — 11 The Shadow / Havana · 2006 — 12 The Smile / Kolkata · 2003
- Nessuna modifica a `index.html` — il codice già gestisce N serie dinamicamente dal manifest
- Deploy: 12 jpg + 12 webp + manifest.json pushati su GitHub Pages

**Commit chiave:**
- `52c6979` — feat: add series-3 "Apart" (12 images + thumbs)

**Ultimo commit:** `52c6979` — branch `main`

**Stato al termine della sessione:**
- ✅ Serie-3 "Apart" live — galleria ora a 56 immagini totali (19 + 25 + 12)
- ✅ Sezione Series mostra 3 card: Amerika · Pulse · Apart

**Pending / prossima sessione:**
- Favicon .ico reale
- Aggiornare contenuto reale: bio, email, Instagram in manifest.json
- Verificare che i titoli/meta di series-3 siano approvati dall'artista

---

## Sessione 16 — 2026-06-11

**Obiettivo:** Audit completo + ROADMAP.md (M7-M14) + implementazione M8 (tracciabilità immagini)

**Cosa è stato fatto:**

**1 — Audit completo + docx/ROADMAP.md**
- Nuovo documento `docx/ROADMAP.md`: audit (4 criticità, 9 importanti, 6 minori), spiegazione sharing/Open Graph, strategia vendita (print-on-demand via creativehub consigliato), strategia Instagram (Meta Business Suite gratis, 75gg anticipo), milestone M7-M14
- Decisione di progetto documentata: i 3000px restano online (lo zoom 1:1 è il concept; master 6000px offline). NO C2PA/etichette AI (posizionamento del progetto). Strategia: tracciabilità invece di blocco

**2 — M8: watermark invisibile (watermark.py)**
- Nuovo script Python batch: `blind_watermark` (DWT-DCT-SVD), payload `AS-<serie>-<nn>` per file
- Registry `watermark-registry.json` (payload + lunghezza bit, necessari per estrazione/verifica) — idempotente, salva dopo ogni file
- Embed via PNG temp → ricodifica JPG q95; verifica automatica post-embed; `--verify <file>`, `--dry-run`, `--force`
- Password nello script (PWD_IMG/PWD_WM): custodire con il registry
- `requirements.txt` aggiunto

**3 — M8: metadata lossless (write-metadata.js)**
- Nuovo script Node con `exiftool-vendored` (binario incluso, funziona su Windows): EXIF/IPTC/XMP senza ricompressione
- Legge autore/©/contatti da manifest (`about`), titolo/serie/meta per opera; jpg = EXIF+IPTC+XMP, webp = solo XMP
- `--check <file>` per leggere i tag scritti
- IMPORTANTE: eseguire DOPO watermark.py (il watermark riscrive i pixel e azzera i metadata)

**4 — M8: w/h nel manifest + index.html**
- `update-manifest.js`: ora legge le dimensioni reali via sharp e scrive `w`/`h` per ogni immagine (preserva quelle esistenti; loop reso async)
- `index.html` → `loadSeries`/`loadAllSeries` propagano `w`/`h`; `openMuseum` usa le dimensioni dal manifest → eliminato il preload di tutte le thumbnail (56 richieste) all'apertura; il vecchio preload resta come fallback se w/h mancano
- `package.json`: dipendenza `exiftool-vendored` + script npm: `thumbs`, `manifest`, `watermark`, `metadata`, `publish-images` (catena completa)

**Da eseguire sulla macchina locale (Claude non ha potuto testare: sandbox VM non disponibile):**
1. `npm install` (installa exiftool-vendored)
2. `pip install -r requirements.txt`
3. Test su UNA immagine: `python watermark.py --dry-run --all`, poi p.es. `python watermark.py series-3`
4. `python watermark.py --verify images/series-3/01.jpg` → deve stampare MATCH
5. `npm run publish-images` (watermark → thumbs → metadata → manifest con w/h)
6. `node write-metadata.js --check images/series-3/01.jpg` → verifica tag
7. Test sito in locale (museum deve aprirsi senza preload e senza deformazioni)
8. Commit + push (incluso watermark-registry.json — backup anche fuori dal repo!)

**Parte 2 della sessione — M7 + M9 + M10 implementate:**

**M7 — Igiene codice:**
- Shuffle gallery: Fisher–Yates al posto di `sort(Math.random)` (biased)
- Honeypot anti-spam nel form contatti (`_gotcha`, finta success per i bot)
- Tagline hero da manifest (`site.tagline`) invece che hardcoded
- Messaggio visibile se il fetch del manifest fallisce (prima: pagina muta)
- Accessibilità gallery: item focusabili da tastiera (role=button, tabindex, Enter/Space, aria-label)
- `generate-favicons.js` + link favicon nel head (png 16/32/180/192/512 da immagine sorgente — DA ESEGUIRE: `npm run favicons`)
- `manifest.json`: aggiunti `site.tagline` e `seo.canonical`
- Payload watermark reso esplicito: `Andrea_Spinazzola_2026_<serie>-<nn>` (PAYLOAD_TEMPLATE in watermark.py); aggiunta opzione `--verify <copia> --as <opera>` per verificare copie esterne

**M9 — SEO statica:**
- `build-seo.js`: inietta tra i marker `SEO:START/END` di index.html i meta statici (title, description, canonical, og:*, twitter:card, JSON-LD Person+WebSite) letti dal manifest — i crawler social non eseguono JS, senza questo le anteprime erano vuote
- Genera `sitemap.xml` (homepage + pagine share) e `robots.txt`

**M10 — Sharing per immagine:**
- Deep link `#photo=<serie>/<nn>`: apre il museum direttamente sull'opera (restoreFromHash); hash sincronizzato su slide change; ripristino `#work` alla chiusura
- Campo `pid` per ogni immagine in IMAGES (photoId da filename)
- Bottone **Share** in PhotoSwipe (bottom-right): `navigator.share` su mobile, copia link su desktop con feedback "Link copied"; condivide l'URL della pagina share
- `generate-share-pages.js`: per ogni opera genera `share/<serie>-<nn>.html` (og: tags dedicati, JSON-LD VisualArtwork, redirect al deep link) + og image 1200px in `share/og/`
- `package.json`: script `favicons`, `share-pages`, `seo`; `publish-images` ora esegue l'intera catena

**Da eseguire sulla macchina locale (oltre ai test M8 sopra):**
1. `npm run favicons` (genera favicon/)
2. `npm run publish-images` (catena completa: watermark → thumbs → metadata → manifest+w/h → share → seo)
3. Test: aprire il sito, museum → bottone Share → copia link → aprirlo in tab nuova (deve aprire l'opera giusta)
4. Dopo il deploy: testare un'anteprima con https://developers.facebook.com/tools/debug/ (Meta Sharing Debugger)

**Parte 3 della sessione — M11 (parziale) + M12:**

- **Profilo Instagram registrato: `@humanfrequency.project`** — strategia ribaltata su decisione utente: il progetto è il brand, l'autore è la firma in calce. manifest.json aggiornato (`about.instagram`, `about.instagramHandle`)
- `docx/SOCIAL-KIT.md`: identità social completa — bio IG, headline/About LinkedIn, 3 set hashtag a rotazione (NO #aiart, NO tag camera-specific: coerenza col gioco percettivo), template caption, checklist M11
- `docx/LAUNCH-POSTS.md`: i 9 post di lancio con caption complete (opere reali dal manifest), specifiche dei 2 Reel, calendario 3 settimane
- `export-social.js` (npm run social): genera da manifest i JPG 1080×1350 (4:5, passe-partout, opera intera) + file .txt caption con hashtag a rotazione e geo tag. La cartella social/ NON va pushata nel repo del sito

**Parte 4 della sessione — Automazione completa pubblicazione Instagram:**

- **Setup Meta completato dall'utente** (docx/AUTOMATION-SETUP.md): Pagina FB "Human Frequency" (ID 1193241227201300), app "HumanFrequency Publisher" con caso d'uso Instagram, token long-lived, IG_USER_ID ottenuto. NB: durante il setup, autorizzazioni aggiunte dal caso d'uso (non dall'Explorer); `pages_read_engagement` mancante → IG_USER_ID recuperato via Business Suite (Impostazioni → Account Instagram)
- **`stories.json`** — 56 micro-storie (caption) pre-scritte, una per opera, voce-progetto
- **`build-queue.js`** — genera `social-queue.json`: 9 item lancio (2 reel + manifesto marcati `manual`) + 47 opere restanti round-robin tra serie; caption composte (storia + hashtag a rotazione + geo tag); non distruttivo
- **`publish-instagram.js`** — pubblica il prossimo `pending` via Graph API v25.0 (image + carousel); auto-rinnovo token long-lived ad ogni run, persistito cifrato in `.ig-token.enc` (AES-256-GCM, chiave = App Secret) → token immortale finché il cron gira; verifica URL pubblico prima della chiamata
- **`publish-social.yml`** — GitHub Actions, cron lun-mer-ven 17:00 UTC + run manuale; va copiato in `.github/workflows/` nel repo (root). Media hostati via raw.githubusercontent (cartella social/ ORA va pushata — nota in export-social.js aggiornata)
- Reel: pubblicabili via API ma senza musica libreria IG → i 2 reel di lancio restano manuali; automazione reel ffmpeg = fase 2

**Chiusura sessione — handoff a Claude Code:**
- Il push non è eseguibile da Cowork (sandbox VM in errore EXDEV + credenziali git solo locali)
- Creato `docx/HANDOFF-PROMPT.md`: prompt pronto per la prossima sessione Claude Code
  che esegue pipeline completa (favicon, watermark --all, publish-images, build-queue) + deploy/push
- La sessione 17 sarà quella di Claude Code (deploy); seguire HANDOFF-PROMPT.md

**Documenti creati in questa sessione (tutti in docx/ salvo indicato):**
- `ROADMAP.md` — audit completo + milestone M7-M14 + strategia sharing/vendita/Instagram
- `SOCIAL-KIT.md` — identità social: handle, bio IG, LinkedIn, hashtag, template caption
- `LAUNCH-POSTS.md` — 9 post di lancio con caption complete + specifiche Reel + calendario
- `AUTOMATION-SETUP.md` — guida setup Meta (completata dall'utente)
- `HANDOFF-PROMPT.md` — prompt per la prossima sessione
- Root: watermark.py, requirements.txt, write-metadata.js, build-seo.js, generate-share-pages.js,
  generate-favicons.js, export-social.js, stories.json, build-queue.js, publish-instagram.js,
  publish-social.yml + modifiche a index.html, manifest.json, package.json, update-manifest.js

**Stato milestone a fine sessione 16:**
- ✅ M7 igiene codice (manca solo: eliminare `gallery (2).html`, eseguire npm run favicons)
- ✅ M8 tracciabilità (watermark testato su series-3/01-02; resto da eseguire con --all)
- ✅ M9 SEO statica (script pronto, da eseguire)
- ✅ M10 sharing (codice in index.html + generatore share pages, da deployare)
- 🔶 M11 social: profilo @humanfrequency.project registrato + setup Meta API completo;
  manca: bio/foto profilo, completamento checklist SOCIAL-KIT
- ✅ M12 automazione: motore completo (engine Graph API + cron); Reel automatici = fase 2
- ⬜ M13 vendita (creativehub) — prossimo grande step
- ⬜ M14 misura

**Pending / sessione 17 (Claude Code, vedi HANDOFF-PROMPT.md):**
- Pipeline completa + deploy/push (passi 1-8 del prompt)
- Utente: bio/foto profilo IG prima del primo Run workflow
- Primo run workflow = pubblica "The Witness" (post reale!)
- Reel di lancio 4 e 8 manuali + manifesto post 9
- `about.email` in manifest ancora vuoto
- M13: storefront creativehub + bottone "Buy print" (ROADMAP.md)

---

## Sessione 17 — 2026-06-11

**Obiettivo:** Esecuzione pipeline completa sessione 16 + deploy (Claude Code, da HANDOFF-PROMPT.md)

**Cosa è stato fatto:**

**1 — Setup ambiente**
- `npm install` (exiftool-vendored già presente) + `pip install -r requirements.txt` (blind-watermark 0.4.4, opencv, numpy, PyWavelets — già installati)

**2 — Favicon**
- `npm run favicons` → generati `favicon/` (16, 32, 180 apple-touch, 192, 512 png)

**3 — Watermark invisibile su tutte le immagini**
- `python watermark.py --all` → **44 embeddati** (series-1: 19, series-2: 25), **12 già nel registry** (series-3 era completa dalla sessione 16, non solo 01-02)
- Tutti i 56 embed con **verify: ok** (payload `Andrea_Spinazzola_2026_<serie>-<nn>`, 215 bit)
- Unico warning innocuo OpenCV (`Unsupported depth image... fallbacked to CV_8U`) durante l'embed via PNG temp
- `watermark-registry.json` aggiornato: 56 entry — committato nel repo + conservare backup esterno

**4 — Pipeline publish-images**
- `npm run publish-images` completata senza errori:
  - watermark: 0 nuovi (56 già nel registry)
  - thumbs: 0 nuove (56 già esistenti — lo script salta le esistenti per design; il watermark è invisibile, le thumb pre-watermark restano visivamente identiche)
  - metadata: **112 file scritti** (56 jpg EXIF/IPTC/XMP + 56 webp XMP)
  - manifest: w/h presenti per tutte le 56 immagini
  - share pages: **56 html** in `share/` + 56 og image 1200px in `share/og/`
  - SEO: blocco statico iniettato in index.html, `sitemap.xml` (57 URL), `robots.txt`
- Verifica metadata: `node write-metadata.js --check images/series-3/01.jpg` → Artist/Copyright/Title/UsageTerms tutti corretti

**5 — Coda social**
- `node build-queue.js` → `social-queue.json`: **52 item** (49 pending, 3 manuali: 2 reel + manifesto) ≈ 17 settimane a 3 post/settimana
- `npm run social` → cartella `social/`: 56 JPG 1080×1350 + 56 .txt caption (necessaria nel repo: la Graph API scarica i media da raw.githubusercontent)

**6 — Deploy**
- Il clone in `/tmp/new-media-design.github.io` era corrotto (residuo Cowork: `.git` con solo `objects/`) → eliminato e riclonato da zero
- Copiati in `gallery/`: index.html, manifest.json, package.json, package-lock.json, tutti gli script .js/.py, requirements.txt, stories.json, social-queue.json, watermark-registry.json, robots.txt, sitemap.xml, favicon/, share/, social/, docx/, images/ (jpg watermarkati + thumbs)
- `publish-social.yml` → `.github/workflows/` nella ROOT del repo
- Commit unico e push su `main`: `533c514` — 369 file (252 nuovi, 117 modificati)
- NON copiati: `gallery (2).html`, Web_Layout.psd, node_modules, .claude

**7 — Post-deploy: secrets + fix workflow (stessa sessione, parte 2)**
- Scoperto che i 4 secrets NON erano configurati nel repo (verificato via `gh api`: 0 secrets ovunque — la nota della sessione 16 era errata). L'utente li ha inseriti (verificati: IG_USER_ID, IG_ACCESS_TOKEN, META_APP_ID, META_APP_SECRET presenti)
- Primo run manuale del workflow → **fallito**: [FIX-016] sharp non si carica (`--omit=optional` esclude i binari nativi) + [FIX-017] "Author identity unknown" nello step `if: always()`. Corretti entrambi in publish-social.yml + bump checkout/setup-node @v4→@v5 (deprecazione Node 20 forzata dal 16/06/2026)
- Secondo run → fallito con Graph API "(#10) Application does not have permission": token senza `instagram_content_publish` [FIX-020]. Scoperti e ripuliti anche: node_modules committato dalla Action (mancava .gitignore) [FIX-018] e `.ig-token.enc` che ha precedenza sul secret [FIX-019]
- Utente ha rigenerato il token con i 5 permessi completi → **terzo run: SUCCESS** 🎉
- **PRIMO POST PUBBLICATO su @humanfrequency.project: "The Witness" (launch-1, series-1/01), media id 18051748256599124** — 2026-06-11 14:55 UTC
- Coda dopo il primo post: 46 image + 2 carousel pending, 2 reel + 1 manifesto manuali. Cron attivo lun-mer-ven 17:00 UTC

**8 — Promemoria automatici per le azioni manuali (notify-manual.js)**
- Problema (utente): i 3 contenuti manuali del lancio (2 reel + manifesto) rischiano di essere dimenticati
- Nuovo script `notify-manual.js`: dopo ogni publish, individua gli item `manual` che nella coda precedono il prossimo `pending` e apre una **Issue GitHub** per ciascuno (dedup: una sola issue per item, anche se chiusa) → GitHub invia l'email di notifica automaticamente. Issue con: link file sorgente raw, caption pronta, link LAUNCH-POSTS.md
- `publish-social.yml`: aggiunto step "Promemoria azioni manuali" (`if: always()`) + permesso `issues: write`
- Timeline lancio: ven 12/06 carousel (auto) → lun 15/06 post 3 (auto) + **email per Reel Oracle** → mer 17/06 Reel Oracle (manuale) → … → mer 24/06 Reel Look Closer → ven 26/06 manifesto
- Decisione utente documentata: NO automazione via login/password IG (rischio ban account nuovo, ToS Meta) — l'API ufficiale resta l'unico canale di pubblicazione automatica; valutare in futuro "fase 2" reel ffmpeg (video auto in social/reels/ + caricamento manuale con musica dall'app)

**9 — Generazione automatica manifesto + video Reel (generate-manifesto.js, generate-reels.js)**
- `generate-manifesto.js` (npm run manifesto): immagine tipografica 1080×1350 del post 9 — claim su #0d0d0d, Hanken Grotesk. NOTA TECNICA: sharp/libvips su Windows ignora i font non installati (fontconfig custom non rispettato) → si usa ffmpeg drawtext con `fontfile=` diretto. Font OFL in `fonts/HankenGrotesk.ttf` (committato)
- `generate-reels.js` (npm run reels): video Reel 1080×1920 30fps H.264 senza audio, Ken Burns + testi temporizzati + chiusura su nero con handle. Due modalità: `letterbox` (opere orizzontali: si parte dall'opera intera) e `cover` (verticali: full-bleed). Generati: `social/reels/launch-4-oracle.mp4` (11.6s) e `launch-8-look-closer.mp4` (14.6s, zoom estremo sull'occhio col testo Look closer/Closer/What do you see?)
- Coda aggiornata: **launch-9 manifesto ora AUTOMATICO** (type image, pending — uscirà ~mer 24/06 dopo launch-7); launch-4/8 restano manuali ma `files` punta ai video pronti → la Issue di promemoria contiene il link di download diretto; l'utente aggiunge solo musica dall'app IG
- Interventi manuali rimasti: SOLO i 2 Reel (musica IG non disponibile via API). Decisione: niente automazione login/password IG (ban risk)
- Verifica: orientamenti misti nelle serie (es. Oracle 3000×2001 orizzontale, The Gaze 2001×3000 verticale) — check di massa 56/56 thumb↔master coerenti, nessun problema

**Commit chiave:**
- `533c514` — feat: M8-M12 — watermark, metadata, SEO statica, share pages, motore Instagram (369 file)
- `fabf273` — fix: workflow Instagram — sharp optional deps + git identity [FIX-016/017]
- `4619ee1` — chore: .gitignore + rimozione node_modules e token cache [FIX-018/019]
- `5df8a7e` — feat: promemoria azioni manuali via Issue GitHub (notify-manual.js)
- `02c3387` — feat: manifesto automatico + video Reel pronti (generate-manifesto/reels.js)

**Stato al termine della sessione:**
- ✅ Sito deployato completo: watermark 56/56, metadata, SEO statica, share pages, favicon, deep link
- ✅ **Motore Instagram FUNZIONANTE**: primo post "The Witness" pubblicato (media id 18051748256599124)
- ✅ Cron attivo lun-mer-ven 17:00 UTC — 49 item in coda ≈ 4 mesi di pubblicazione autonoma
- ✅ Promemoria automatici via Issue GitHub → email per le azioni manuali
- ✅ Manifesto generato e in coda automatica (esce ~mer 24/06)
- ✅ Video dei 2 Reel pronti in social/reels/ — all'utente restano SOLO musica+upload (2 azioni da 5 min)
- 🔑 Secrets configurati e token rigenerato con i 5 permessi completi [FIX-020]

**Pending / prossima sessione:**
- Reel di lancio 4 e 8: caricamento manuale con musica (video già pronti in social/reels/, promemoria automatico via Issue — email lun 15/06 e lun 22/06)
- Test anteprime share con Meta Sharing Debugger dopo il deploy
- `about.email` in manifest: ora presente in UsageTerms (spinaster@gmail.com) — verificare se va esposto anche in About
- M13: storefront creativehub + bottone "Buy print" (ROADMAP.md)
- Eliminare `gallery (2).html` dalla cartella locale (residuo M7)

---

<!-- TEMPLATE NUOVA SESSIONE — copia e incolla qui sotto

## Sessione N — YYYY-MM-DD

**Obiettivo:** ...

**Cosa è stato fatto:**
- ...

**Problemi risolti:**
- ...

**Commit chiave:**
- `hash` — messaggio

**Pending / prossima sessione:**
- ...

-->
