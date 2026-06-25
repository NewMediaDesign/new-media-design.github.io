# Accesso slide con GitHub Pages + Formspree

Questa versione usa solo file statici pubblicati su GitHub Pages e Formspree per raccogliere le richieste di accesso.

## Cosa succede

1. Lo studente apre la pagina `index.html`.
2. Compila nome, cognome, email e consenso.
3. Il form invia i dati a Formspree: `https://formspree.io/f/xwvdllkq`.
4. Formspree salva la submission nel tuo account.
5. Formspree puo inviare una email automatica allo studente con il link alle slide.
6. Dopo l'invio, lo studente vede `thanks.html`.

## Link slide da inserire nell'email Formspree

Quando configuri l'auto-response in Formspree, inserisci il link pubblico alle slide:

```text
https://TUO-DOMINIO/courses/nmd-gen-ai-generativa/nmd-gen-ai-generativa-standalone.html
```

Sostituisci `https://TUO-DOMINIO` con il dominio GitHub Pages o il tuo dominio personale.

## Limite importante

Questa soluzione raccoglie i dati e invia il link, ma non protegge davvero il file HTML. Chi riceve il link puo inoltrarlo. Per un primo corso va bene; per accessi revocabili, log reali e sessioni servira un backend.

## Configurazione Formspree consigliata

Nel pannello Formspree del form `xwvdllkq`:

- abilita le email notifications verso di te;
- abilita l'auto-response verso il campo `email`;
- nel testo dell'auto-response inserisci il link alle slide;
- esporta periodicamente le submission in CSV se vuoi tenere un archivio locale;
- se disponibile nel tuo piano, abilita spam protection o captcha.

## Campi inviati

- `nome`
- `cognome`
- `email`
- `corso`
- `consenso_accesso_slide`
- `consenso_aggiornamenti`

## File usati da GitHub Pages

- `index.html`
- `thanks.html`
- `assets/access.css`
- `assets/access.js`
- `courses/nmd-gen-ai-generativa/nmd-gen-ai-generativa-standalone.html`
