---
name: repo-discovery-map
description: Inspect the Pathway / Wynde UX Research Guide repository before editing. Use for first-pass repo scans, unfamiliar files, locating relevant components/content/styles/tests, checking stack and commands, or preparing context for a planned change without modifying files.
---

# Repo Discovery Map

## Workflow

1. Read `AGENTS.md`, `package.json`, and the directly relevant files for the request.
2. Prefer `rg` / `rg --files` and exclude `node_modules/`, `.next/`, and build artifacts.
3. Identify the relevant route, component, content, style, token, asset, and test files.
4. Note whether Figma context is required for the task. If it is required but unavailable, say so explicitly.
5. Do not edit files while using this skill.

## Project Anchors

- Routes live in `app/`.
- Guide UI components live in `components/guide/`.
- Guide content and navigation live in `content/`.
- Figma-derived CSS variables live in `app/figma-tokens.css`.
- Raw token JSON lives in `figma-tokens/`.
- Local visual assets live in `public/figma/`.

## Output

Return:

- detected task area;
- relevant files and why they matter;
- commands likely needed;
- missing context or risks;
- suggested next action.
