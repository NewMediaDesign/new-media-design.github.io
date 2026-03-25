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
