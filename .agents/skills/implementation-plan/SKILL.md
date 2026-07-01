---
name: implementation-plan
description: Turn a request for this Pathway / Wynde Next.js guide into a small implementation plan before coding. Use for UI changes, content/data changes, navigation work, Figma implementation, refactors, tests, or any request where scope and verification should be explicit.
---

# Implementation Plan

## Workflow

1. Inspect the relevant files first; use `repo-discovery-map` when the affected area is not obvious.
2. Restate the goal in one sentence.
3. Define scope in and scope out.
4. List the files expected to change.
5. Describe the implementation steps as a short sequence.
6. Define verification: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, and/or visual checks.
7. Name assumptions and missing inputs, especially Figma frames, final copy, or asset gaps.

## Guardrails

- Keep the plan small enough to complete in one session.
- Do not propose new dependencies unless the current repo cannot solve the task reasonably.
- Do not rewrite guide content unless the user asked for content changes.
- Do not mix in the separate banking Pathway project context.

## Output

Use this shape:

```text
Goal:
Scope:
Files:
Plan:
Verification:
Risks / assumptions:
```
