# Accesso slide con GitHub Pages + Formspree

Questa versione usa solo file statici pubblicati su GitHub Pages e Formspree per raccogliere le richieste di accesso.

## Cosa succede con il piano gratuito Formspree

1. Lo studente apre la pagina `index.html`.
2. Compila nome, cognome, email e consenso.
3. Il form invia i dati a Formspree: `https://formspree.io/f/xwvdllkq`.
4. Formspree salva la submission nel tuo account.
5. Lo studente viene mandato a `thanks.html`.
6. La pagina `thanks.html` mostra il pulsante per aprire le slide.

Con il piano gratuito Formspree non viene inviata automaticamente una email allo studente con il link. L'autoresponse richiede un piano Formspree a pagamento.

## Link pubblico di registrazione

```text
https://new-media-design.it/slide_access_form/
```

## Link diretto alle slide

```text
https://new-media-design.it/slide_access_form/courses/nmd-gen-ai-generativa/nmd-gen-ai-generativa-standalone.html
```

## Limite importante

Questa soluzione raccoglie i dati e mostra il link dopo la registrazione, ma non protegge davvero il file HTML. Chi riceve o copia il link puo inoltrarlo. Per un primo corso va bene; per accessi revocabili, log reali e sessioni servira un backend.

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
