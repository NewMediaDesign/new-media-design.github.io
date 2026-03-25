# FIX.md — Bug Registry

Documento di riferimento per bug risolti nel progetto.
**Leggere sempre questo file prima di qualsiasi intervento su bug o errori.**
Se il bug è già presente qui, applicare direttamente la soluzione documentata.

---

## [FIX-001] PhotoSwipe CDN 404

**Sintomo:** Il museum viewer non si apre. Console: 404 su photoswipe.css o photoswipe.umd.min.js.

**Causa:** Path CDN errato. `photoswipe@5/dist/photoswipe.umd.min.js` non esiste.

**Soluzione:** Usare path completo con versione pinned e sottocartella `umd/`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.css">
<script src="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/umd/photoswipe.umd.min.js"></script>
```
**Nota:** I file sono ora bundlati localmente in `lib/` — questo problema non si ripresenterà finché i file locali esistono.

---

## [FIX-002] PhotoSwipe arrow SVG — opzione con nome sbagliato

**Sintomo:** Le frecce del museum viewer mostrano le icone di default di PhotoSwipe invece di quelle custom. Nessun errore in console.

**Causa:** Le opzioni `arrowPrevSVGString` e `arrowNextSVGString` **non esistono** in PhotoSwipe v5. La libreria le ignora silenziosamente.

**Soluzione:** Usare i nomi corretti `arrowPrevSVG` e `arrowNextSVG`. Il valore deve essere un **tag `<svg>` completo** con gli attributi obbligatori:
```js
arrowPrevSVG: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32" width="32" height="32"><polyline points="21 6 11 16 21 26" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
arrowNextSVG: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 32 32" width="32" height="32"><polyline points="11 6 21 16 11 26" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
```
**Attributi obbligatori SVG:** `aria-hidden="true"`, `class="pswp__icn"`, `viewBox`, `width`, `height`.

---

## [FIX-003] PhotoSwipe arrow next — orientamento invertito

**Sintomo:** La freccia destra (next) punta a sinistra invece che a destra.

**Causa:** PhotoSwipe applica automaticamente `transform: scaleX(-1)` all'icona della freccia next via CSS — indipendentemente dal fatto che si passi un SVG custom. Il custom SVG `>` viene specchiato e diventa `<`.

**Soluzione:** Aggiungere in CSS `transform: none !important` per la next arrow, così il flip non viene applicato:
```css
.pswp__button--arrow--next .pswp__icn { transform: none !important; }
```
Il custom `arrowNextSVG` deve già puntare nella direzione corretta (`>`).

---

## [FIX-004] PhotoSwipe arrow — sempre visibili (specificità CSS)

**Sintomo:** Le frecce appaiono sempre visibili quando il mouse è sul viewer, invece di comparire solo nelle zone hover sinistra/destra.

**Causa:** PhotoSwipe aggiunge la classe `.pswp--has_mouse` al root element e imposta `opacity: .85` con selettore `.pswp--has_mouse .pswp__button--arrow` — che ha specificità più alta del nostro `.pswp__button--arrow { opacity: 0 }`.

**Soluzione:** Usare `!important` e duplicare le regole con `.pswp--has_mouse`:
```css
.pswp__button--arrow,
.pswp--has_mouse .pswp__button--arrow {
  opacity: 0 !important;
  pointer-events: none !important;
}
.pswp__button--arrow.zone-active,
.pswp--has_mouse .pswp__button--arrow.zone-active {
  opacity: .45 !important;
  pointer-events: auto !important;
}
```

---

## [FIX-005] PhotoSwipe padding — funzione ignorata

**Sintomo:** Il passepartout non appare. Le immagini toccano tutti e 4 i bordi del viewer.

**Causa:** PhotoSwipe v5.4.4 si aspetta per l'opzione `padding` un **oggetto plain** `{top, bottom, left, right}`. Se si passa una funzione, la libreria la ignora silenziosamente e usa padding 0.

**Soluzione:** Calcolare il padding prima dell'apertura e passare un oggetto:
```js
function calcPswpPadding() {
  const vw = window.innerWidth;
  const p  = vw >= 768 ? Math.round(vw * 0.03) : 20;
  return { top: p + 48, bottom: p + 52, left: p, right: p };
}
// Nell'istanza PhotoSwipe:
padding: calcPswpPadding(),  // chiamata come funzione, non passata come riferimento
```
**Formula:** `p` = gap visivo uguale su tutti i lati. `+48` e `+52` compensano top bar e caption bar in modo che il gap visivo rimanga uniforme.

---

## [FIX-006] PhotoSwipe uiRegister — `position: absolute` non funziona su elemento custom

**Sintomo:** Un elemento registrato via `pswp.ui.registerElement()` non si posiziona correttamente con `position: absolute`.

**Causa:** Se si usa `html: '<div class="mia-classe">...</div>'`, la classe viene applicata al `div` interno — non all'elemento container `el` creato da PhotoSwipe. La proprietà `position: absolute` su `el` non ha effetto perché `el` non ha la classe.

**Soluzione:** Usare il parametro `className` di `registerElement` per applicare la classe direttamente su `el`:
```js
pswp.ui.registerElement({
  name: 'pswp-copyright',
  className: 'pswp-copyright',  // applicato su el → position:absolute funziona
  html: '© Andrea Spinazzola',
  // ...
});
```
CSS: `.pswp-copyright { position: absolute; ... }` — ora si applica correttamente su `el`.

---

## [FIX-007] PhotoSwipe — ombra/outline default sulle icone

**Sintomo:** Le icone freccia e close mostrano un'ombra/bordo di default che non corrisponde al design del sito.

**Causa:** PhotoSwipe aggiunge un elemento `.pswp__icn-shadow` per rendere le icone visibili sia su sfondi chiari che scuri.

**Soluzione:**
```css
.pswp__icn-shadow { display: none !important; }
```

---

## [FIX-008] PhotoSwipe arrow next — icona specchiata anche con SVG custom

**Sintomo:** La freccia destra (next) punta a sinistra anche dopo aver fornito `arrowNextSVG` con un `>` correttamente orientato.

**Causa:** PhotoSwipe applica via CSS `transform: scaleX(-1)` alla `.pswp__icn` della freccia next — indipendentemente dal fatto che si usi l'SVG di default o uno custom. Il `>` fornito viene specchiato → diventa `<`.

**Soluzione:** Aggiungere in CSS con `!important` per bloccare il flip:
```css
.pswp__button--arrow--next .pswp__icn { transform: none !important; }
```
`arrowNextSVG` deve già disegnare `>` (orientato a destra).

**Nota:** Questo è diverso da [FIX-003] che documentava il problema di orientamento precedente. Entrambi i fix devono essere presenti.

---

## [FIX-009] PhotoSwipe copyright — z-index sopra immagine

**Sintomo:** Il testo copyright rimane visibile sopra l'immagine quando si zooma, invece di essere coperto dall'immagine.

**Causa:** PhotoSwipe imposta `z-index: 1` su `.pswp__scroll-wrap` per default. Il copyright registrato via `registerElement` con `appendTo: 'root'` veniva aggiunto dopo lo scroll-wrap nel DOM. Con `z-index: 2` (o qualsiasi valore > 1), il copyright era sopra l'immagine.

**Soluzione:** Impostare `z-index: 0` sul copyright — inferiore al default `z-index: 1` di `.pswp__scroll-wrap`:
```css
.pswp-copyright { z-index: 0; }
```
A zoom normale il copyright è posizionato appena sotto il bordo dell'immagine (non si sovrappongono). A zoom, l'immagine cresce e copre il copyright naturalmente per via dello z-index.

**Errore da evitare:** Impostare `z-index: 5` su `.pswp__scroll-wrap` non risolve, perché il copyright (aggiunto dopo nel DOM) mantiene precedenza sullo stacking context.

---

## [FIX-010] Cursore custom bloccato su mobile

**Sintomo:** Su dispositivi touch (mobile/tablet), il div del cursore custom rimane bloccato in una posizione fissa sullo schermo, perché su mobile non esiste `mousemove`.

**Causa:** Il cursore è implementato con un div che segue il mouse via `mousemove`. Su touch non viene mai spostato → rimane dove era l'ultima volta.

**Soluzione:** Doppio gate CSS + JS:
```css
@media(pointer: coarse) { .custom-cursor { display: none !important; } }
```
```js
const HAS_MOUSE = window.matchMedia('(pointer: fine)').matches;
// Attaccare i listener solo se c'è un mouse
if (HAS_MOUSE) {
  hit.addEventListener('mousemove', ...);
  hit.addEventListener('mouseenter', ...);
  // ...
}
```
`pointer: fine` = mouse/trackpad. `pointer: coarse` = dito/touch.

---

## [FIX-011] manifest.json cached su mobile (CDN GitHub Pages)

**Sintomo:** Le didascalie delle immagini su mobile mostrano dati vecchi (titoli/descrizioni non aggiornati), anche dopo aver pulito la cache del browser, usato incognito e cambiato browser. Su desktop tutto è aggiornato correttamente.

**Causa:** `fetch('manifest.json')` senza parametri di cache-busting. GitHub Pages usa un CDN con edge server distribuiti. Il browser desktop e il browser mobile possono colpire edge server diversi con tempi di invalidazione cache diversi. Anche in incognito, il CDN serve la versione cached dal suo edge, non dal browser.

**Soluzione:** Aggiungere un timestamp come query parameter per rendere ogni richiesta un URL unico mai cached:
```js
// prima:
fetch('manifest.json')

// dopo:
fetch('manifest.json?v=' + Date.now())
```
Il server ignora il parametro `?v=`, ma il CDN e il browser lo trattano come un URL diverso → nessuna cache possibile.

**Nota:** Questo impedisce QUALSIASI caching del manifest. Per siti ad alto traffico si potrebbe usare un hash del contenuto invece del timestamp, ma per un portfolio personale il trade-off è accettabile.

---

## [FIX-012] PhotoSwipe copyright — non si nasconde su zoom (proprietà inesistente)

**Sintomo:** Il testo "© Andrea Spinazzola" rimane visibile sopra l'immagine quando si zooma con click/doppio-tap. Il copyright appare in mezzo all'immagine zoommata invece di essere coperto.

**Causa:** Il codice usava `pswp.currZoomLevel` per confrontare il livello di zoom corrente con il livello fit. **Questa proprietà non esiste** in PhotoSwipe v5 — il livello di zoom è su `pswp.currSlide.currZoomLevel`. Quindi `pswp.currZoomLevel` era sempre `undefined`, il confronto `undefined > number` era sempre `false`, e il copyright non veniva mai nascosto.

**Soluzione:**
```js
// prima (non funziona — proprietà inesistente):
if (pswp.currZoomLevel > fitLevel + 0.01) {

// dopo (proprietà corretta su currSlide):
if (pswp.currSlide.currZoomLevel > fitLevel + 0.01) {
```

**Errore da evitare:** Non confondere le proprietà dell'istanza `pswp` con quelle dello slide. In PhotoSwipe v5, molte proprietà di stato (zoom, dimensioni, posizione) sono su `pswp.currSlide`, non su `pswp`.

---

## [FIX-013] PhotoSwipe caption meta — nascosto su mobile (CSS display:none)

**Sintomo:** La caption delle immagini nel museum su mobile mostra solo titolo e serie, ma non la località e l'anno (es. "SÃO PAULO · 1989"). Su desktop la caption è completa.

**Causa:** Una regola CSS nascondeva intenzionalmente il meta su schermi piccoli:
```css
@media(max-width:480px){ .pswp-cap-meta{ display:none; } }
```

**Soluzione:** Rimuovere `display:none` dal meta, mantenendo solo il cambio di layout:
```css
@media(max-width:480px){ .pswp-cap-body{flex-direction:column;gap:4px;} }
```

---

