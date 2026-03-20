# Press Review Tool v3

Rassegne stampa complete per artisti. Ricerca intelligente con Perplexity API, categorizzazione AI, export professionale.

## Stack

- **Next.js 16** (App Router)
- **Clerk** (auth)
- **Neon** (Postgres)
- **Perplexity Search API** (ricerca web)
- **Anthropic Claude** (categorizzazione, opzionale)
- **Stripe** (piani a pagamento)
- **Vercel** (deploy)

## Piani

| Piano   | Prezzo   | Ricerche/mese | Export                    |
|---------|----------|---------------|---------------------------|
| Free    | €0       | 5             | PDF, Excel, JSON, CSV     |
| Pro     | €7,99/mo | 50            | Stesso export, più ricerche |
| Business| €19,99/mo| 200           | Tutti + API access        |

## Setup

1. Copia `.env.example` in `.env.local`
2. Configura le variabili (Clerk, Perplexity, Neon, Stripe)
3. **Database:** la prima volta che l’app usa Neon, crea automaticamente le tabelle (`users`, `searches`, `usage_tracking`). Puoi comunque eseguire `scripts/init-db.sql` a mano se preferisci.
4. Crea prodotti e prezzi su Stripe (Pro €7,99/mo, Business €19,99/mo)
5. Configura webhook Stripe: `POST /api/stripe/webhook`
6. **Webhook Clerk** (Dashboard → Webhooks → Add endpoint):
   - **URL** (sostituisci con il tuo dominio):  
     `https://TUO_PROGETTO.vercel.app/api/webhooks/clerk`  
     In locale usa un tunnel (es. ngrok): `https://xxxx.ngrok-free.app/api/webhooks/clerk`
   - **Eventi**: `user.created` (e opzionalmente `user.updated`)
   - Copia il **Signing secret** in `CLERK_WEBHOOK_SECRET` (`.env.local` / Vercel)

```bash
npm install
npm run dev
```

## Deploy su Vercel

1. Connetti il repo GitHub
2. Aggiungi le variabili d'ambiente
3. Deploy automatico su push a `main`

## Brand

Tosky Records® — Brand kit 2026. Colori, font Prompt, pill buttons.

---

© 2026 LABELTOOLS — Powered by Tosky Records®
