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

[Overview](#overview) · [Capabilities](#capabilities) · [Quick start](#quick-start) · [Configuration](#configuration) · [Security](#security) · [License](#license)

</div>

---

## Overview

**Press Review Tool** is a web application for **music industry teams** who need curated press coverage: reviews, interviews, news, and more—aggregated from the open web, ranked for relevance to an artist or release, and exported for decks and archives.

It is part of the **LabelTools** suite and ships as a subscription product (**Free**, **Pro**, **Business**) with usage limits and feature tiers enforced server-side.

---

## Capabilities

| Area | What you get |
|------|----------------|
| **Search** | Live retrieval via Perplexity with fallbacks; post-ranking aligned to artist/album (token and phrase signals, URL-aware cleanup)—transparent scoring, not vanity “relevance” badges. |
| **Languages** | Result language presets include English, Italian, Spanish, French, and **Multilingual** (default)—use multilingual when you need global coverage without excluding non-English sources. |
| **Classification** | Optional **Anthropic Claude** enrichment for content types; heuristic fallback if the API is unavailable or out of credits. |
| **Exports** | **PDF**, **Excel**, **CSV**, **JSON** from saved searches; email delivery for PDF where configured. |
| **Access & billing** | **Clerk** authentication; **Stripe** subscriptions with webhook-driven plan sync. |
| **Fair use** | Monthly search quotas by tier; Free-tier safeguards using normalized identity and IP-based guardrails. |

**Stack (high level):** [Next.js](https://nextjs.org/) App Router (React 19, TypeScript), server routes, [Neon](https://neon.tech/) Postgres, hosted on [Vercel](https://vercel.com/).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in secrets (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # production build
```

---

## Configuration

Copy **`.env.example`** to **`.env.local`**. Typical groups:

| Group | Role |
|--------|------|
| **Clerk** | Publishable and secret keys, sign-in URLs, webhook secret for user lifecycle. |
| **Database** | `DATABASE_URL` for Neon (serverless Postgres). |
| **Search** | `PERPLEXITY_API_KEY` — primary search backend. |
| **AI (optional)** | `ANTHROPIC_API_KEY` — categorization; app degrades gracefully without it. |
| **Billing** | Stripe secret, webhook secret, price IDs, publishable key. |
| **App** | `NEXT_PUBLIC_APP_URL` — canonical public URL **without** trailing slash (Open Graph, metadata, absolute links). |
| **Ops** | `FREE_ACCOUNTS_PER_IP_LIMIT` (Free tier), optional `WHITELISTED_EMAILS` (comma/semicolon/newline) for operator-granted Pro-equivalent access without Stripe. |
| **Email** | Optional Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) for feedback notifications. |

---

## Security

See **[SECURITY.md](./SECURITY.md)** for dependency review, operational checklist, and how to report issues. Optional smoke checklist: **[docs/VERIFICATION.md](./docs/VERIFICATION.md)**.

---

## License

This repository is **proprietary**. See **[LICENSE](./LICENSE)** for terms. Access to hosted software is governed by your LabelTools subscription or agreement.

---

<div align="center">

**Press Review Tool** · **MediaMatter** (creative training & consulting)  
Contact: **developer@toskyrecords.com**

<br/>

**MediaMatter**

</div>
