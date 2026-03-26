# Verification checklist

Use this list for smoke testing after deploys or dependency upgrades.

## Automated (local)

| Step | Command | Expected |
|------|---------|----------|
| Lint | `npm run lint` | Exit 0 |
| Typecheck | `npx tsc --noEmit` | Exit 0 |
| Build | `npm run build` | Exit 0, no compile errors |
| Audit | `npm audit --omit=dev` | Review output; address critical when feasible |

## Security review (recurring)

- [ ] No secrets in git history for this release branch.
- [ ] Vercel env: Clerk, Stripe, Neon, Perplexity, Anthropic keys present for the target environment.
- [ ] Stripe webhook URL and signing secret match the deployment URL.
- [ ] Clerk allowed origins / redirect URLs include production domain.

## Functional smoke (manual)

With a **logged-in** test user:

- [ ] **Dashboard** loads; plan/tier reflects subscription or Free.
- [ ] **Search** (`/search`): submit artist/album; results render; loading overlay dismisses.
- [ ] **Anthropic fallback**: if API credits are exhausted, search still completes (heuristic categories).
- [ ] **History** (`/history`): prior searches listed when applicable.
- [ ] **Export**: download at least one format (e.g. PDF) for a saved search.
- [ ] **Pricing** (`/pricing`): upgrade CTA works in test/live mode as configured.
- [ ] **Sign out / sign in**: session persists as expected.

## Free-tier guardrails (optional)

- [ ] Free user at search limit receives 429 + correct UI copy (not raw JSON).

Record date and outcome in your release notes when completing this checklist.
