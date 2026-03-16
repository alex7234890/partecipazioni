# 💍 Partecipazioni Matrimonio — Matteo & Clio

Sito web per le partecipazioni di matrimonio di **Matteo Filippelli** e **Clio Righetti**.

**Stack:** Next.js (App Router) · Supabase · Tailwind CSS · Framer Motion · Vercel

---

## Struttura del progetto

```
├── config/
│   └── wedding.js            ← Dati del matrimonio (date, location, timeline)
├── src/
│   ├── app/
│   │   ├── invite/[slug]/    ← Pagina invito personalizzata per ospite
│   │   ├── dashboard/        ← Pannello di controllo sposi (protetto)
│   │   └── login/            ← Accesso area sposi
│   ├── components/           ← Componenti UI
│   └── lib/
│       ├── supabase.js       ← Client Supabase lato browser
│       └── supabaseServer.js ← Client Supabase lato server (per Auth)
├── supabase/
│   ├── schema.sql            ← Schema database (eseguibile nell'SQL Editor)
│   └── functions/
│       └── send-reminder/    ← Edge Function per email promemoria
└── public/
    ├── monogram.png          ← Monogramma MC
    └── couple.jpg            ← Foto degli sposi
```

---

## Setup passo-passo

### 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Scegli una regione europea (es. Frankfurt)
3. Annota la **Project URL** e le **API Keys** dalla sezione *Settings → API*

### 2. Configura le variabili d'ambiente

```bash
cp .env.local.example .env.local
```

Apri `.env.local` e compila:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Crea il database

Nel tuo progetto Supabase:

1. Vai su **SQL Editor**
2. Clicca **New query**
3. Incolla il contenuto di `supabase/schema.sql`
4. Clicca **Run** ▶

Questo crea la tabella `guests` con RLS configurato.

### 4. Crea l'utente sposi

1. Nel pannello Supabase vai su **Authentication → Users**
2. Clicca **Add user → Create new user**
3. Inserisci email e password degli sposi
4. Questo sarà l'account per accedere alla Dashboard

### 5. Personalizza il config

Modifica `config/wedding.js` con:
- Data del matrimonio
- Orario cerimonia
- Nome e indirizzo delle location
- URL Google Maps

### 6. Avvia in locale

```bash
npm install
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

### 7. Deploy su Vercel

```bash
# Con Vercel CLI
npx vercel

# Oppure collega il repository da vercel.com
```

Aggiungi le variabili d'ambiente in **Vercel → Project → Settings → Environment Variables**.

---

## Come gestire gli ospiti

### Aggiungere un ospite dalla Dashboard

1. Vai su `/dashboard` (accedi con le credenziali sposi)
2. Nella sezione **Aggiungi ospite** inserisci nome e cognome
3. Lo slug viene generato automaticamente (es. `marco-rossi`)
4. Il link personalizzato sarà: `https://il-tuo-sito.vercel.app/invite/marco-rossi`
5. Copia il link e invialo all'ospite via WhatsApp, email, ecc.

### Aggiungere ospiti direttamente su Supabase

In **Table Editor → guests** puoi inserire righe manualmente:

| Campo | Esempio |
|-------|---------|
| `name` | Marco Rossi |
| `slug` | marco-rossi |

Il link ospite sarà automaticamente `/invite/marco-rossi`.

### Monitorare le risposte

Dalla Dashboard puoi vedere:
- Stato RSVP di ogni ospite
- Allergie e intolleranze
- Messaggi per gli sposi
- Filtri per stato (confermati, declinati, in attesa)
- Esportazione CSV
- Invio promemoria agli ospiti senza risposta

---

## Email promemoria (opzionale)

Per inviare email automatiche agli ospiti che non hanno risposto:

1. Crea un account su [resend.com](https://resend.com)
2. Ottieni la API Key
3. Aggiungi `RESEND_API_KEY` nelle variabili d'ambiente di Vercel
4. Deploy l'Edge Function Supabase:

```bash
npx supabase functions deploy send-reminder
npx supabase secrets set RESEND_API_KEY=re_...
npx supabase secrets set WEDDING_URL=https://il-tuo-sito.vercel.app
npx supabase secrets set FROM_EMAIL=noreply@matteoeclio.it
```

> **Nota:** per l'invio email, aggiungi una colonna `email` alla tabella `guests` e modifica la funzione per usarla.

---

## Struttura URL

| URL | Descrizione |
|-----|-------------|
| `/invite/[slug]` | Invito personalizzato per ogni ospite |
| `/login` | Accesso area sposi |
| `/dashboard` | Pannello di controllo sposi |

---

## Tecnologie

- **Next.js** (App Router, JavaScript)
- **Supabase** — Database PostgreSQL, Auth, Edge Functions, RLS
- **Tailwind CSS v4** — Styling utility-first
- **Framer Motion** — Animazioni fluide
- **Vercel** — Deploy e hosting

---

*Con amore, Matteo & Clio* 🌸
