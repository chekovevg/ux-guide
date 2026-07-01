---
name: verification-report
description: Verify changes in the Pathway / Wynde Next.js guide and report evidence. Use after implementation, before claiming work is complete, when preparing a commit, or when diagnosing whether lint, typecheck, tests, build, or visual behavior still pass.
---

# Verification Report

## Check Selection

- Documentation-only changes: inspect diff; no app checks required unless docs affect tooling.
- TypeScript, React, content model, or route changes: run `npm run typecheck` and `npm test`.
- Style, component, or navigation changes: run `npm run lint`; add `npm run build` for broad changes.
- Visual UX changes: run the app when needed and verify desktop/mobile behavior with screenshots or browser inspection.
- Token generation changes: run `npm run tokens`, then verify resulting CSS changes are intentional.

## Workflow

1. Identify changed files.
2. Choose relevant checks from the list above.
3. Run checks from the repository root.
4. If a check fails, summarize the exact failure and whether it was fixed.
5. State remaining risk honestly.

## Output

Use this shape:

```text
Changed files:
Checks:
Results:
Risks / not checked:
Confidence:
```
