# AGENTS.md

## Project

Pathway / Wynde UX Research Guide is a docs-like Next.js guide for UX research and unmoderated testing. The current project is the Wynde UX Research Guide branch only; do not mix it with any separate banking, underbanked, cardholder, or Taglish Pathway context.

The product audience is UX/UI designers, UX researchers, product managers, and small product teams. The interface should feel practical, readable, modular, and visually polished.

<!-- LAZYWEB:ROUTER:BEGIN - managed by Lazyweb; delete this block to opt out -->
## Use Lazyweb by default for product UI work

Before designing, critiquing, or changing any product UI - screens, flows,
landing pages, onboarding, paywalls, pricing, checkout, dashboards, settings
- use Lazyweb first instead of answering from training data. Pull real
evidence with the lazyweb_* tools (lazyweb_search for the exact screen, or
lazyweb_get_workflows to pick a mode), or invoke the matching /lazyweb skill
when local skills are installed. When unsure whether a UI request qualifies,
use Lazyweb. Skip it only for backend/CLI/infra work, prose editing, or
non-product visuals.
<!-- LAZYWEB:ROUTER:END -->

## Stack

- Frontend: Next.js App Router, React, TypeScript
- Styling: Tailwind CSS plus Figma-derived CSS tokens
- Content: static TypeScript/JSON guide data under `content/`
- Assets: local Figma exports under `public/figma/`
- Package manager: npm
- Backend/database: none in the current prototype

## Commands

- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start built app: `npm run start`
- Tests: `npm test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Generate design tokens: `npm run tokens`

## Folder Map

- `app/` - Next.js routes, layout, global CSS, generated token CSS
- `components/guide/` - guide shell, navigation, article rendering, mobile chrome, ToC
- `content/` - guide data, navigation structure, content tests
- `.agents/skills/` - project-specific Codex workflows for discovery, planning, implementation, verification, review, and handoff
- `figma-tokens/` - raw token JSON exported from Figma
- `public/figma/` - SVG logos, covers, diagrams, and other local visual assets
- `scripts/` - token and Figma-token inspection scripts

## Project Skills

- `repo-discovery-map` - inspect relevant files and map the repo before editing
- `implementation-plan` - turn a request into a small implementation plan
- `focused-implementation` - implement only the approved or clearly requested scope
- `verification-report` - run checks and report evidence, risks, and confidence
- `anti-ai-slop-review` - review UI/content for generic AI-looking output and weak product fit
- `session-handoff` - produce a compact summary for a future Codex session

## Known Figma References

Use these known frames for the current Wynde guide work when Figma context is needed:

- Mobile contents trigger / contents section: `https://www.figma.com/design/314E0PxdPGZBO124xOAELq/-?node-id=366-3295&m=dev`
- Related mobile state: `https://www.figma.com/design/314E0PxdPGZBO124xOAELq/-?node-id=360-2692&m=dev`
- Related mobile state: `https://www.figma.com/design/314E0PxdPGZBO124xOAELq/-?node-id=560-4741&m=dev`
- Related mobile state: `https://www.figma.com/design/314E0PxdPGZBO124xOAELq/-?node-id=546-3990&m=dev`

## Working Rules

- Inspect the relevant files before editing.
- Keep changes small, focused, and consistent with existing patterns.
- Do not add dependencies without explicit approval.
- Do not touch `.env*`, tokens, auth, billing, deployment, or production config without explicit approval.
- Do not rewrite core guide content unless the task explicitly asks for copy or content changes.
- Do not introduce unrelated refactors while fixing a specific issue.
- Prefer existing components, data structures, CSS classes, and Figma tokens before adding abstractions.
- Preserve the current static guide architecture unless the user explicitly requests a larger migration.
- If Figma is connected or selected, treat it as the visual source of truth; treat the repo as the source of truth for routing, data, code style, and reusable components.

## Design Rules

- Maintain a docs-like reading experience: desktop sidebar, in-page ToC, mobile navigation, clear active states, and readable article layout.
- Keep long-form content comfortable to scan and read: strong hierarchy, restrained line length, generous spacing, clear lists, callouts, checklists, and templates.
- Use assets from `public/figma/` and tokens from `app/figma-tokens.css` / `figma-tokens/` before creating new visual language.
- Do not generate random illustrations or decorative visuals unless the task explicitly asks for them.
- Avoid generic AI-looking UI. The result should feel like a careful product/design case, not a template.
- Preserve accessibility basics: semantic HTML, meaningful headings, visible focus, keyboard behavior, aria labels for navigation and dialogs, reduced-motion support, and responsive layouts without page-level horizontal scroll.

## Verification

- For code changes, run the narrowest relevant checks first.
- For component, routing, or data-model changes, prefer `npm run typecheck`, `npm test`, and `npm run lint`.
- For broad UI or build-sensitive changes, also run `npm run build`.
- If checks cannot be run, explain why and name the remaining risk.
- For visual work, verify desktop and mobile behavior manually or with browser screenshots when a dev server is available.

## Definition Of Done

- The requested behavior or documentation change is complete.
- No unrelated files are changed.
- No dead code or temporary debug output remains.
- Relevant checks pass, or failures are documented with evidence.
- The final response includes changed files, checks run, risks or assumptions, and confidence from 1-10 when useful.
