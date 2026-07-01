---
name: focused-implementation
description: Implement a scoped change in the Pathway / Wynde UX Research Guide with a minimal diff. Use after a plan is approved or when the user gives a clear direct implementation request for components, routes, content mapping, styles, tests, or project documentation.
---

# Focused Implementation

## Workflow

1. Confirm the target files from the request or plan.
2. Read the existing implementation before editing.
3. Reuse existing components, CSS variables, content structures, and assets.
4. Edit with the smallest coherent patch.
5. Keep content separate from layout where the repo already does so.
6. Preserve accessibility: semantic HTML, aria labels, keyboard behavior, visible focus, and responsive behavior.
7. Run or queue the verification checks that match the change.

## Guardrails

- Do not add dependencies without explicit approval.
- Do not touch `.env*`, auth, billing, deployment, or production configuration without explicit approval.
- Do not make unrelated refactors.
- Do not generate random illustrations or new visual systems unless requested.
- Do not alter core guide copy unless requested.

## Final Notes

When done, report changed files, checks run, risks, and remaining work. If a check fails, keep the evidence visible and fix it when it is in scope.
