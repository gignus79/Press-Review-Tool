# Security

## Reporting

If you discover a vulnerability, email **developer@toskyrecords.com** with steps to reproduce. Do not open a public issue for undisclosed security bugs.

## Architecture (high level)

| Layer | Notes |
|--------|--------|
| **Auth** | Clerk handles sessions; `middleware.ts` protects non-public routes and APIs (except webhooks). |
| **Webhooks** | Stripe and Clerk endpoints must use verified signatures (`STRIPE_WEBHOOK_SECRET`, `CLERK_WEBHOOK_SECRET`). |
| **Data** | Postgres on Neon; use TLS connection strings in production. |
| **Secrets** | API keys only in server env (Vercel / `.env.local`), never in client bundles. |

## Dependency & build verification

Run regularly (e.g. before releases):

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Address high/critical `npm audit` findings when upstream fixes exist; some transitive issues (e.g. PDF stack) may require larger upgrades — track in the repo.

## Operational checklist

1. **Environment**: No production secrets committed; `.env.local` gitignored.
2. **Clerk**: Production instance + HTTPS-only cookies; webhook endpoint reachable and returning 2xx.
3. **Stripe**: Live keys and webhook signing secret for production; test mode isolated in preview if needed.
4. **AI providers**: Keys scoped to least privilege; rotate on compromise; Anthropic credits monitored in Console.

## Last automated verification

| Check | Result |
|--------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm audit --omit=dev` | Review output — **jspdf → dompurify** chain may report moderate/critical issues; upgrading `jspdf` major may be required for a clean audit. |

Re-run the commands after dependency bumps. For manual QA, see **[docs/VERIFICATION.md](./docs/VERIFICATION.md)**.
