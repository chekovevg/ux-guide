# Interactive guide fixes design

Date: 2026-07-20

## Problem and outcome

The Wynde UX Research Guide already has a strong docs-style reading shell, but its interactive behavior does not yet match its visual polish. Search does not cover full article text, checklist blocks look completed without being operable, modal navigation leaks focus into the page, and several responsive and content-structure details weaken accessibility and comprehension.

The outcome is a more useful guide that remains static and backend-free: readers can search the full localized guide, use checklists as lightweight working tools, and navigate dialogs, tables, and page contents consistently across modern Chrome, Safari, and Firefox at WCAG 2.2 AA quality.

## Actors and scenarios

- UX designers, researchers, product managers, and small product teams use the guide while preparing or reviewing research work.
- A reader searches for a specific term, method, or example without knowing its chapter.
- A reader works through a preparation checklist over one or more visits in the same browser.
- A keyboard or assistive-technology user opens search or mobile navigation and expects modal focus behavior.
- A mobile reader compares tabular guidance without losing the surrounding article context.

## Evidence map

### User-supplied facts

- Search must cover chapter titles, headings, and full body text.
- Checklists were intended to add useful interactivity, not decorative or truncated functionality.
- The current product is a static Next.js guide without a backend.

### External evidence

- Notion treats a checkbox as an operable to-do state, not decoration: https://www.notion.com/help/writing-and-editing-basics
- GitHub task lists use clickable checkboxes and communicate completed-task counts: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-tasklists
- Microsoft Learn associates cross-content progress with a profile and learning-plan system, which is intentionally outside this guide's scope: https://learn.microsoft.com/en-us/training/support/plans
- WAI modal dialogs move focus inside, contain the tab sequence, support Escape, and restore focus: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WCAG 2.2 requires at least 4.5:1 contrast for normal text: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

### Assumptions

- Checklist progress only needs to persist in the current browser; account sync and cross-device progress are unnecessary.
- Search results can be computed from the existing static localized content without a new dependency.
- Modern Chrome, Safari, and Firefox are the supported browser family.

### Evidence gap

Lazyweb tools were not available in the invocation. The design therefore uses inspected local artifacts, user decisions, and the external functional references above.

## Concept direction

Name: **Quiet working guide**

- **Practical:** every interactive control performs a task that matters while using the guide.
- **Local:** checklist state is browser-local and clearly avoids account or sync expectations.
- **Reversible:** checked items can be unchecked and the entire block can be reset.
- **Calm:** progress is communicated with text and restrained state changes, without points, streaks, confetti, or completion pressure.
- **Readable:** interaction cannot reduce body-text contrast, article measure, or semantic structure.

## Functional benchmarks and adaptation

### Checklist

Retained rule: a checkbox represents an editable binary task state, and a task group communicates completion count.

Adaptation: use native checkboxes, a completed-count label, browser-local persistence, and a reset action. Do not copy account-level planning, assignment, or gamification features.

### Search

Retained rule: search results explain where a match lives and why it matched.

Adaptation: group results by chapter, section, and text fragment; show localized hierarchy and a short excerpt; keep the implementation static and dependency-free.

### Modal behavior

Retained rule: a surface marked modal must behave modally for keyboard and assistive-technology users.

Adaptation: centralize focus entry, focus containment, Escape close, background inertness, and trigger-focus restoration for desktop search, mobile search, and mobile navigation.

## Named wireframes

### Checklist — untouched

```text
Checklist title                                   0 of 7

[ ] First preparation criterion
[ ] Second preparation criterion
[ ] Third preparation criterion
```

- Reset is absent because no state has changed.
- If the checklist title is identical to the chapter H1, the duplicate internal heading is omitted.

### Checklist — in progress

```text
Checklist title                                   3 of 7

[x] First preparation criterion
[ ] Second preparation criterion
[x] Third preparation criterion

Reset
```

- Completed text remains readable and is only subtly muted.
- The checkbox and its full text label form one activation target.

### Checklist — complete

```text
Checklist title                                   7 of 7
All items checked

[x] First preparation criterion
...

Reset
```

- Completion feedback is textual and compact; no celebration animation is used.

### Search — empty

```text
[ Search the guide...                                      Esc ]

Suggested chapters
Chapter title
Chapter title
```

### Search — populated

```text
[ respondent sample                                      Esc ]

Chapters
Audience and sample
  Match found in chapter content

Sections
Audience and sample > How many respondents are needed?

Text matches
Audience and sample > How many respondents are needed?
  ...increase the respondent sample when recordings may...
```

- Matching text is visually emphasized without relying on color alone.
- Every result navigates to the chapter or the nearest section anchor.

### Mobile table

```text
Problem                          Solution       More →
-------------------------------------------------------
cell text                        cell text
```

- A restrained edge cue indicates horizontal continuation.
- The local scroll region receives an accessible name when it overflows.

## Architecture and component boundaries

### Search index

- Add a pure content-index builder that accepts localized guide chapters and returns searchable records.
- Records contain locale, chapter slug/title, optional section id/title, result type, normalized searchable text, and display excerpt source.
- Chapter records search title plus chapter body text.
- Section records search heading plus all descendant block text.
- Text-fragment records are derived from paragraphs, lists, callouts, checklist items, quotes, tables, and toggle content.
- Search matching remains case-insensitive substring matching for this scope. Results are ranked by exact title match, title prefix, title substring, then body match.
- Limit visible results to 3 chapters, 5 sections, and 8 text fragments. Use excerpts of at most 160 characters, deduplicate records within each group, and make the result area scroll vertically when needed.

### Checklist state

- Keep `ArticleChecklist` responsible for presentation and native checkbox behavior.
- Pass a stable storage key derived from locale, chapter slug, and block id.
- Store checked item indexes as versioned JSON in `localStorage`.
- Render the server and initial client state unchecked, then restore saved state after mount to avoid hydration mismatch.
- Ignore malformed or out-of-range stored values and fall back to an empty state.
- Reset removes the persisted entry and clears the block. Returning every checkbox to unchecked also removes the persisted entry.

### Modal focus behavior

- Add a small reusable hook or component rather than duplicating focus logic.
- On open, remember the trigger and focus the preferred element inside the dialog.
- Apply `inert` to the application content outside the active modal.
- Contain `Tab` and `Shift+Tab` within the dialog.
- Escape closes the modal and focus returns to its trigger.
- All required controls, including a visible close control, remain descendants of the dialog.

### Content structure

- Preserve existing guide copy.
- Extend callout/example rendering to accept structured paragraphs or items when the source provides them.
- Keep the current string fallback for legacy data.
- Do not invent semantic splits from capitalization alone; only apply deterministic source-aware parsing rules.

## Visual property contract

- Reuse existing Figma tokens, Inter, Roboto Mono, 680 px article measure, radii, and spacing.
- Unchecked checkbox: surface background, visible border, no preselected state.
- Checked checkbox: existing blue accent with white check; label remains at WCAG-compliant contrast.
- Progress label: secondary 14 px text at at least 4.5:1 contrast.
- Reset: quiet text button with visible hover and focus states.
- Search group label: compact muted label with sufficient contrast; result title remains primary.
- Search excerpt: two lines maximum with highlighted matching substring using weight and background, not color alone.
- Table body text increases from 10 px to at least 12 px with a readable line height.
- Mobile controls retain a minimum 36 px interactive box and visible focus treatment.

## Responsive behavior

- At desktop widths, checklist title/progress share a row; reset appears below the items.
- At narrow mobile widths, progress wraps beneath the title without shrinking the title.
- Search uses the existing centered desktop dialog and full mobile panel.
- Search result hierarchy and snippets wrap naturally; no horizontal result scrolling.
- Two-column tables reflow within the article width. Tables with three or more columns keep local horizontal overflow, an accessible region label, a continuation cue, and no page-level horizontal scroll.
- Pages without section links keep the secondary header row as a non-interactive current-chapter label without a chevron, preserving header height without exposing an empty disclosure.

## Additional audit fixes in scope

- Raise light-theme muted and active-link token contrast to at least 4.5:1.
- Remove the duplicated H1-as-H3 checklist title and preserve a sequential article heading outline.
- Make three-or-more-column table regions consistently named and keyboard reachable; keep two-column tables out of the tab order by allowing them to reflow.
- Make theme initialization deterministic so a stored dark theme does not produce hydration warnings or stale toggle state.
- Localize search labels, empty messages, progress text, reset text, and completion text for Russian and English.

## States and error handling

- Search empty: show suggested chapters.
- Search no match: localized no-results message.
- Search long query: wrap input text normally; matching remains bounded by result limits.
- Checklist storage unavailable: keep the checklist operable for the current page session without surfacing an error.
- Checklist storage malformed: discard it safely.
- Checklist content changes: ignore stored indexes outside the current item count.
- Modal with no results or short content: focus containment still works.
- Page with no headings: no page-contents disclosure is exposed.

## Scope

### In scope

- Full-text localized static search.
- Local interactive checklist state and progress.
- Modal focus management.
- Empty mobile contents behavior.
- Checklist heading hierarchy.
- Table readability and overflow affordance.
- Light-theme contrast corrections.
- Theme hydration correction.
- Deterministic structured-callout improvements where supported by source data.
- RU and EN validation.

### Out of scope

- Accounts, backend persistence, cross-device sync, team progress, analytics, achievements, streaks, and chapter completion dashboards.
- New dependencies.
- Broad guide-copy rewriting.
- A new design system or unrelated component refactor.

## Validation

- Unit tests for localized search indexing, ranking, snippets, and section destinations.
- Component tests for checklist restore, toggle, reset, malformed storage, and changed item counts.
- Keyboard tests for each modal: initial focus, forward/backward tab loop, Escape, and focus restoration.
- Heading-outline and empty-contents regression tests.
- Contrast checks for changed light/dark tokens.
- Mobile visual checks at 320 and 390 px; desktop checks at 1024 and 1440 px.
- Table and modal checks in modern Chromium, Safari, and Firefox when their local browser runtimes are available; otherwise record the missing runtime explicitly.
- Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`.

## Risks and mitigations

- A static full-text index could produce repetitive matches. Mitigate with result-type grouping, ranking, deduplication, and per-group limits.
- Local checklist persistence may be mistaken for account sync. Keep the UI local and avoid global progress language.
- Restoring checkbox state after mount may cause a brief state update. Keep the layout stable and restore without animation.
- Source callouts may already be flattened. Preserve the fallback and fix only deterministic structures in this implementation.

## Next decision

After approval of this specification, create the implementation plan and execute the work as one focused package, verifying Russian and English behavior separately.
