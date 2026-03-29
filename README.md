<div align="center">

# Press Review Tool

**MediaMatter** — real-time music press aggregation, AI-assisted classification, and pro exports for labels and artists.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Neon](https://img.shields.io/badge/Neon-Postgres-00E599?style=for-the-badge&logo=neon&logoColor=white)](https://neon.tech/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![Perplexity](https://img.shields.io/badge/Perplexity-Search-20B8CD?style=for-the-badge)](https://www.perplexity.ai/)
[![Anthropic Claude](https://img.shields.io/badge/Anthropic-Claude-D4A574?style=for-the-badge)](https://www.anthropic.com/)

<br/>

[Features](#features) · [Quick start](#quick-start) · [Environment](#environment) · [Operations](#operations-and-ai-keys) · [Security](#security)

</div>

---

## Features

| Area | Details |
|------|---------|
| **Search** | Perplexity-backed retrieval with fallbacks; **post-ranking** by match to artist/album (tokens + phrase overlap, light URL cleanup) — no fake “relevance” labels. |
| **Classification** | Optional Anthropic Claude enrichment; automatic heuristic fallback if the API is unavailable. |
| **Exports** | PDF, Excel, CSV, JSON from saved searches. |
| **Auth & billing** | Clerk authentication; Stripe subscriptions (Pro / Business) with plan sync. |
| **Fair use** | Monthly search limits by tier; Free-tier guardrails by identity (normalized email) and IP. |

Architecture: **Next.js App Router** (server routes + Neon Postgres), **Clerk** middleware on protected routes, **Stripe** webhooks for subscription state.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint    # ESLint
npm run build   # production build
```

---

## Environment

Copy **`.env.example`** → **`.env.local`**. Minimum categories:

| Group | Purpose |
|--------|---------|
| **Clerk** | Publishable + secret keys, URLs, webhook secret for user sync. |
| **Neon** | `DATABASE_URL` (serverless Postgres). |
| **Perplexity** | `PERPLEXITY_API_KEY` — primary search backend. |
| **Anthropic** | `ANTHROPIC_API_KEY` — optional categorization (see below). |
| **Stripe** | Secret, webhook secret, price IDs, publishable key. |
| **App** | `NEXT_PUBLIC_APP_URL` (URL canonico del sito, **senza** slash finale — usato per Open Graph / Twitter e link assoluti), optional `FREE_ACCOUNTS_PER_IP_LIMIT`. |
| **Email (feedback)** | Optional `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — copia notifiche a developer@toskyrecords.com (vedi `.env.example`). |

### Resend (403 “Domain not verified”)

Se le email falliscono con **403** e messaggio tipo *Verify toskyrecords.com or update your from domain*:

1. In **[Resend](https://resend.com)** → **Domains** aggiungi `toskyrecords.com`, inserisci i record **DNS** (SPF/DKIM) che Resend mostra e attendi lo stato **Verified**.
2. Fino ad allora imposta `RESEND_FROM_EMAIL` a un mittente già consentito da Resend, ad es. `Press Review Tool <onboarding@resend.dev>` (vedi `.env.example`).
3. Solo dopo la verifica del dominio potrai usare `customercare@toskyrecords.com` o altro indirizzo sul tuo dominio.

### Social previews (Open Graph / Twitter / Vercel checks)

- Imposta **`NEXT_PUBLIC_APP_URL`** in produzione al dominio pubblico reale (es. `https://press-review-tool.labeltools.toskyrecords.com`). Senza questo valore, `metadataBase` e gli URL di `og:image` / `twitter:image` possono puntare al dominio `.vercel.app` o risultare errati nei tool di anteprima.
- Il progetto espone immagini generate (`/opengraph-image`, `/twitter-image`) e meta tag `twitter:card=summary_large_image`, `og:image`, ecc. nel layout root (`app/layout.tsx`).
- Per validare: Vercel **Deployment → Checks** oppure condividi l’URL della **home** `/` (route pubblica). Route protette (es. `/dashboard` senza sessione) possono mostrare titoli diversi o redirect: non usarle come URL di test per OG.

---

## Operations and AI keys

- **Perplexity** powers live search; keep `PERPLEXITY_API_KEY` valid in production.
- **Anthropic (Claude)** is used for richer categorization. Billing is **separate** from end-user Pro/Business plans:
  - Top up credits in the **[Anthropic Console](https://console.anthropic.com/)** (API), not only the consumer chat product.
  - If the key is disabled, rotated, or out of credits, the app **falls back** to heuristic labels so searches still complete.
- After rotating or re-enabling an API key in the provider dashboard, **redeploy** or update the env var on Vercel so runtime picks up the change.

---

## Security

See **[SECURITY.md](./SECURITY.md)** for dependency review, operational checklist, and reporting. Manual smoke tests: **[docs/VERIFICATION.md](./docs/VERIFICATION.md)**.

---

<div align="center">

**Press Review Tool** by **MediaMatter** (creative training & consulting) — contact: **developer@toskyrecords.com**

<br/>

**MediaMatter**

</div>
