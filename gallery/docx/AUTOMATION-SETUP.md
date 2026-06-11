# AUTOMATION-SETUP.md — Setup pubblicazione automatica Instagram

> I 5 passi che SOLO tu puoi fare (richiedono la tua identità). Tempo totale: ~1 ora.
> Fatto questo, il sistema pubblica da solo: contenuti pre-scritti, cron su GitHub Actions, zero gestione.

---

## Passo 1 — Profilo Instagram professionale (10 min)

1. App Instagram → profilo `@humanfrequency.project` → menu ☰ → **Impostazioni e privacy**
2. **Tipo di account e strumenti** → **Passa a un account professionale** → **Creator** → categoria **Artist/Arte**
3. Completa il profilo (da `docx/SOCIAL-KIT.md`): bio, foto profilo, link `https://new-media-design.it/gallery/`

## Passo 2 — Pagina Facebook collegata (10 min)

L'API funziona SOLO con un account IG collegato a una Pagina FB.

1. facebook.com → **Pagine** → **Crea nuova Pagina**
   - Nome: `Human Frequency` · Categoria: `Artist`
   - (la Pagina può restare vuota, serve solo da "ancora" tecnica)
2. Instagram → **Impostazioni** → **Centro gestione account** → collega la Pagina
   (oppure: dalla Pagina FB → Impostazioni → Account collegati → Instagram)

## Passo 3 — App sviluppatore Meta (15 min)

1. Vai su **developers.facebook.com** → login col tuo account Facebook
2. **My Apps** → **Create App**
   - Use case: **Other** → tipo: **Business**
   - Nome app: `HumanFrequency Publisher` (qualsiasi, è interno)
3. Nella dashboard dell'app → **Add product** → **Instagram** → Set up
4. **App settings → Basic**: annota **App ID** e **App Secret** (👁 per mostrarlo)

⚠️ L'app resta in **Development mode**: va benissimo. L'App Review di Meta serve solo
per pubblicare per conto di ALTRI; per il tuo stesso account (tu = admin dell'app) non serve.

## Passo 4 — Token di accesso long-lived (15 min)

1. Dalla dashboard app → **Tools** → **Graph API Explorer**
2. In alto a destra: seleziona la tua app
3. **Permissions** — aggiungi:
   - `instagram_basic` (o `instagram_business_basic` se proposto)
   - `instagram_content_publish` (o `instagram_business_content_publish`)
   - `pages_show_list`
   - `business_management`
4. **Generate Access Token** → autorizza con il tuo account FB → seleziona la Pagina Human Frequency
5. Copia il token (breve durata) e scambialo con uno long-lived (60 giorni):
   apri nel browser (sostituisci i 3 valori):
   ```
   https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN_BREVE
   ```
   → la risposta contiene `access_token`: è il **token long-lived** (lo script lo rinnoverà da solo)
6. Recupera l'**Instagram User ID**: sempre nel browser
   ```
   https://graph.facebook.com/v21.0/me/accounts?access_token=TOKEN_LONG_LIVED
   ```
   → prendi l'`id` della Pagina, poi:
   ```
   https://graph.facebook.com/v21.0/PAGE_ID?fields=instagram_business_account&access_token=TOKEN_LONG_LIVED
   ```
   → `instagram_business_account.id` = **IG_USER_ID** (un numero lungo)

## Passo 5 — Secrets su GitHub (5 min)

1. github.com → repo `NewMediaDesign/new-media-design.github.io` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Crea questi 4 secrets:

| Nome | Valore |
|------|--------|
| `IG_USER_ID` | il numero del passo 4.6 |
| `IG_ACCESS_TOKEN` | il token long-lived del passo 4.5 |
| `META_APP_ID` | App ID (passo 3.4) |
| `META_APP_SECRET` | App Secret (passo 3.4) |

---

## Cosa succede dopo (parte mia, zero lavoro tuo)

- `social-queue.json`: coda con TUTTE le opere, caption pre-scritte (lancio incluso)
- `publish-instagram.js`: pubblica il prossimo contenuto in coda via Graph API, rinnova il token, aggiorna la coda
- `.github/workflows/publish-social.yml`: cron lun-mer-ven 18:00 — gira nel cloud GitHub, PC spento ok
- Reel automatici: generati con ffmpeg (Ken Burns + testo) dentro la Action
- Le immagini social vengono pushate nel repo Pages (URL pubblici, requisito API)

**Limiti da sapere (onesti):** i Reel via API non possono usare l'audio della libreria di Instagram (musica trend = solo manuale, resterà l'eccezione opzionale); le Stories interattive restano manuali; il token va rinnovato dallo script ogni run (automatico) ma se non si pubblica nulla per >60 giorni scade e va rigenerato a mano (passo 4).

**Quando hai finito i 5 passi, dimmelo: attivo il motore.**
