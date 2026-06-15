# TaxPilot AI Frontend

A modern Next.js + TypeScript + Tailwind starter for an AI-powered Indian tax filing assistant.

## Key UX idea

The flagship interaction is **Explain Every Number**. Every tax value should expose:
- Source document
- Source field
- Formula
- Confidence score
- Plain-English explanation
- User verification state

## UX Blueprint

### User journey
1. Land: understand value and trust posture.
2. Sign up: minimal onboarding.
3. Upload: Form 16, AIS, 26AS, salary slips.
4. Extraction review: verify every number before analysis.
5. Tax analysis: income, deductions, liability, refund, risks.
6. Regime comparison: old vs new with recommendation.
7. Filing assistant: ITR form, checklist, mistakes, final review.
8. Settings: consent, privacy, data deletion.

### Information architecture
- Public: Landing, Login, Sign up
- Workspace: Dashboard, Upload, Review, Analysis, Regime Comparison, Filing Assistant
- Account: Profile, Settings

### Responsive strategy
- Mobile: stacked cards, bottom-friendly actions, large tap targets.
- Tablet: two-column cards, horizontal comparison tables.
- Desktop: persistent sidebar, content grid, right-side explanation drawer.

### Accessibility
- Semantic headings and navigation
- Keyboard-focus rings
- Dialog semantics for explanation drawer
- Minimum 44px tap targets
- Plain-English labels and visible status text

## Run

```bash
npm install
npm run dev
```

## Suggested next implementation steps
- Add ShadCN CLI-generated primitives.
- Connect upload to backend document-processing API.
- Replace mock data in `lib/mock-tax-data.ts`.
- Add auth/session handling.
- Add audit trail for every user-edited tax value.
