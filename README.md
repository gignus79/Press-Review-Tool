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

| Piano   | Prezzo   | Ricerche/mese | Export              |
|---------|----------|---------------|---------------------|
| Free    | €0       | 5             | PDF, JSON           |
| Pro     | €7,99/mo | 50            | PDF, Excel, JSON, CSV |
| Business| €19,99/mo| 200           | Tutti + API access  |

## Setup

1. Copia `.env.example` in `.env.local`
2. Configura le variabili (Clerk, Perplexity, Neon, Stripe)
3. Crea le tabelle su Neon: esegui `scripts/init-db.sql` nel SQL Editor di Neon
4. Crea prodotti e prezzi su Stripe (Pro €7,99/mo, Business €19,99/mo)
5. Configura webhook Stripe: `POST /api/stripe/webhook`
6. Configura webhook Clerk: `POST /api/webhooks/clerk` (evento `user.created`)

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
