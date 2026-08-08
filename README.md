# AppuntiUni — marketplace di appunti universitari

Sito per comprare e vendere appunti universitari, costruito con **Next.js 15 (App
Router)**, **Supabase** (auth, database Postgres con RLS, storage privato) e
pronto per il deploy su **Vercel**.

Il ruolo dell'account (**acquirente** o **venditore**) si sceglie al momento
della registrazione e determina quale dashboard viene mostrata. Esiste inoltre
un ruolo **amministratore**, che non è auto-assegnabile: viene concesso da un
admin esistente (il primo si crea da SQL, vedi sotto).

---

## Funzionalità

**Acquirente**
- Catalogo pubblico con ricerca (titolo, materia, corso, docente), filtri per
  ateneo, tipo di materiale, prezzo massimo e "solo gratis", più ordinamento per
  data o prezzo
- Scheda appunto con copertina, tutti i dettagli, copie vendute e appunti
  correlati dello stesso corso
- Acquisto di un set di appunti (pagamento simulato in questa versione)
- Dashboard `/dashboard/acquisti`: libreria degli acquisti, totale speso, download
- Download tramite **link firmato e temporaneo** (60 secondi): i file non sono mai pubblici

**Venditore**
- Dashboard `/dashboard/venditore`: annunci, vendite per singolo annuncio, incasso
- Caricamento guidato in tre passaggi — file, dettagli, prezzo — con anteprima
  del nome e del peso del file scelto e scorciatoie di prezzo
- Campi dell'annuncio: tipo di materiale (appunti, riassunti, esercizi, slide,
  formulario, tesi), corso, ateneo, docente, anno accademico, pagine, lingua,
  descrizione e **copertina** facoltativa
- Modifica di prezzo e dettagli dopo la pubblicazione
  (`/dashboard/venditore/<id>/modifica`)
- Stato dell'annuncio: in revisione → pubblicato / rifiutato (con motivo)
- Storico vendite in `/dashboard/venditore/vendite`

**Amministratore**
- Dashboard `/dashboard/admin`: statistiche (utenti, venditori, appunti, acquisti, volume vendite)
- Moderazione: approva, rifiuta o elimina qualsiasi annuncio
- `/dashboard/admin/utenti`: elenco utenti e cambio ruolo (acquirente / venditore / admin)

---

## Come funziona la sicurezza

Tutto passa dalle policy **Row Level Security** di Postgres, non solo dai
controlli lato UI:

- `profiles`: ognuno vede solo il proprio profilo; gli admin vedono tutti. Il
  campo `role` può essere modificato **solo da un admin** — ci pensa il trigger
  `guard_role_change`, che annulla ogni altro tentativo di cambio ruolo.
- Registrarsi con `role = 'admin'` non funziona: il trigger `handle_new_user`
  accetta solo `buyer` o `seller` e ripiega su `buyer`.
- `notes`: nel catalogo pubblico si vedono solo gli annunci `approved`; il
  venditore vede i propri, l'admin tutti. Solo chi ha ruolo `seller`/`admin` può
  inserire annunci, e solo a proprio nome.
- `purchases`: il trigger `validate_purchase` forza l'importo al prezzo reale
  dell'appunto, blocca l'acquisto di annunci non approvati e l'auto-acquisto; il
  vincolo `unique(note_id, buyer_id)` evita i doppioni.
- **Storage**: il bucket `notes` è privato. Un venditore può scrivere solo nella
  cartella `<suo-uid>/`, e la lettura è concessa solo a proprietario, acquirente
  o admin. I download avvengono con URL firmati generati lato server. Le
  copertine stanno in un bucket separato e pubblico (`note-previews`): sono
  immagini pensate per essere viste da chiunque nel catalogo.
- I dati pubblici dei venditori (nome e ateneo, mai l'email) sono esposti dalla
  vista `sellers_public`; il numero di copie vendute passa dalla vista
  aggregata `note_stats`, che non rivela chi ha comprato.

---

## Setup

### 1. Progetto Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Apri **SQL Editor → New query**, incolla il contenuto di
   [`supabase/schema.sql`](supabase/schema.sql) ed esegui. Lo script crea
   tabelle, trigger, policy RLS, le viste pubbliche e i bucket `notes`
   (privato) e `note-previews` (copertine). Lo script è idempotente: rieseguilo
   anche per **aggiornare** un database creato con una versione precedente —
   aggiunge le colonne mancanti senza toccare i dati esistenti.
3. In **Authentication → URL Configuration** imposta il *Site URL*
   (`http://localhost:3000` in locale, l'URL Vercel in produzione) e aggiungi
   `<site-url>/auth/callback` tra i *Redirect URLs*.
4. Se vuoi provare subito senza confermare le email, disattiva
   *Authentication → Providers → Email → Confirm email*.

### 2. Avvio in locale

```bash
npm install
cp .env.example .env.local   # inserisci URL e anon key del progetto
npm run dev                  # http://localhost:3000
```

Le variabili necessarie (Project Settings → API):

| Variabile | Valore |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave pubblica `anon` |
| `NEXT_PUBLIC_SITE_URL` | origine del sito (per i link di conferma email) |

> La `service_role` key non serve e **non va** messa nel progetto: l'app usa solo
> la chiave anon, con le RLS a fare da guardia.

### 3. Creare il primo account admin

Registrati normalmente dal sito, poi nel **SQL Editor** di Supabase esegui:

```sql
select public.promote_to_admin('tua.email@esempio.it');
```

Da quel momento quell'account vede `/dashboard/admin` e può promuovere altri
utenti direttamente dall'interfaccia (`/dashboard/admin/utenti`).

### 4. Deploy su Vercel

1. Importa il repository su [vercel.com/new](https://vercel.com/new) (Next.js
   viene rilevato in automatico).
2. In **Settings → Environment Variables** aggiungi le tre variabili sopra,
   con `NEXT_PUBLIC_SITE_URL` uguale al dominio Vercel.
3. Deploy. Ricordati di aggiungere lo stesso dominio nei *Redirect URLs* di
   Supabase.

---

## Pagamenti

L'acquisto è **simulato**: la riga in `purchases` viene scritta subito e il file
diventa scaricabile. Per collegare un pagamento reale basta intervenire in
`src/app/actions/purchases.ts`: al posto dell'`insert` si apre una sessione di
checkout (es. Stripe) e la riga in `purchases` si scrive dal webhook di
pagamento confermato. Il resto dell'app — permessi, download firmati, dashboard
— non cambia.

---

## Struttura

```
src/
  app/
    page.tsx                     landing + ultimi appunti
    appunti/                     catalogo e scheda appunto
    login/  registrazione/       autenticazione (scelta ruolo in registrazione)
    auth/callback/               conferma email / magic link
    dashboard/
      acquisti/                  dashboard acquirente
      venditore/                 dashboard venditore (+ nuovo, vendite)
      admin/                     dashboard admin (+ utenti)
    actions/                     server actions: auth, notes, purchases, admin
  components/                    navbar, card appunto
  lib/                           client Supabase, helper auth/ruoli, tipi
  middleware.ts                  refresh sessione + protezione /dashboard
supabase/schema.sql              schema, trigger, policy RLS, bucket storage
legacy/                          vecchia demo "DNA Helix Decoder" di questo repo
```

## Comandi

```bash
npm run dev     # sviluppo
npm run build   # build di produzione
npm run start   # server di produzione
```
