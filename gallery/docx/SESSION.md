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
