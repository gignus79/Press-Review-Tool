# ADMIN CHECKPOINT (Internal)

> Internal status snapshot for maintainers only.
> Last update: 2026-03-26

## Product State
- App status: production-ready baseline
- Public URL: `https://press-review-tool.labeltools.toskyrecords.com`
- Core flows verified:
  - Google login
  - Search execution + categorization
  - Export workflow (PDF/XLSX/CSV/JSON)
  - Stripe checkout (Pro/Business)
  - Pricing plan visibility + manage subscription

## Recent Stabilization Notes
- Relevance sorting added (ascending/descending) on results UI.
- Default theme set to dark mode.
- Feedback moved to dedicated popup route (`/feedback-popup`).
- Sign-in/sign-up force redirect to dashboard.
- Header logo click points to `https://toskyrecords.com`.
- Tier reconciliation hardened (Clerk ID migration fallback by email + Stripe checks).
- IP escalation bug mitigated by counting only active/trialing subscriptions as paid.

## Known Technical Debt / Risks
- `npm audit --omit=dev` still reports vulnerabilities through `jspdf` -> `dompurify` chain.
- Full migration from `jspdf` to server-safe PDF engine is recommended for long-term hardening.
- Middleware deprecation warning (`middleware` -> `proxy`) remains pending.

## Operational Checklist Before New Changes
1. `npm run lint`
2. `npm run build`
3. `npm audit --omit=dev` (see `SECURITY.md` / `docs/VERIFICATION.md`)
4. Verify `/pricing` tier and `/dashboard` counters with test paid account.
5. Verify Clerk webhook delivery success after auth changes.
6. **Anthropic API**: credits and key live in [Anthropic Console](https://console.anthropic.com/) (API billing, not chat-only). After disable/re-enable or rotate keys, update Vercel env and redeploy.

## Documentation
- Root **`README.md`**: stack badges, setup, AI key operations.
- **`SECURITY.md`**: reporting, architecture notes, audit hygiene.
- **`docs/VERIFICATION.md`**: smoke-test checklist.

## Contacts
- Product/Dev: `developer@toskyrecords.com`
