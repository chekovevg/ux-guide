# Interactive Guide Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static Wynde guide into a dependable working reference with localized full-text search, locally persistent checklists, accessible modal behavior, and the article/UI corrections approved in the design specification.

**Architecture:** Keep content generation on the server and interaction in small client boundaries. Build a serializable search index from the existing localized `GuideChapter[]`, pass it into one responsive search dialog, keep checklist persistence local to each client component, and share modal focus behavior through one hook. Preserve the static guide data model, existing Figma tokens, and current routes.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind plus `app/globals.css`, Node's built-in test runner, React server rendering for semantic tests, and the existing Playwright dev dependency for browser verification.

## Global Constraints

- Implement the approved contract in `docs/superpowers/specs/2026-07-20-interactive-guide-fixes-design.md`; do not expand into accounts, analytics, global completion, or backend persistence.
- Do not add dependencies or rewrite guide copy.
- Search must index Russian and English chapter titles, headings, and all supported body-block content.
- Checklist state is per locale + chapter + block and stays in `localStorage` only.
- Modal surfaces must follow the WAI dialog behavior described in the specification.
- Modern Chromium, Firefox, and WebKit/Safari are the browser target; WCAG 2.2 AA is the accessibility target.
- Keep the 680 px article measure and existing Figma-derived visual language.
- Use `apply_patch` for source edits and stage only files named in each task.
- Run the narrow test before and after each task, then run the full verification matrix in Task 8.

---

## Task 1: Add a localized full-text search domain

**Files:**

- Create: `content/guideSearch.ts`
- Create: `content/guideSearch.test.mjs`
- Modify: `components/guide/types.ts`

- [ ] **Step 1: Write failing search-index tests**

Create `content/guideSearch.test.mjs`. Compile `guideSearch.ts` with `typescript.transpileModule`, as `content/guideAdapter.test.mjs` already does, and test a compact synthetic RU/EN chapter set.

The fixtures must include:

```js
const chapters = [
  {
    slug: "research-sample",
    title: "Audience and sample",
    blocks: [
      { type: "paragraph", text: "A rare full-text phrase lives here." },
    ],
    sections: [
      {
        id: "respondent-count",
        title: "How many respondents are needed?",
        blocks: [
          { type: "bulletedList", items: ["Increase the respondent sample when recordings may fail."] },
          { type: "table", columns: ["Method", "Sample"], rows: [["Interview", "Five people"]] },
        ],
      },
    ],
  },
];
```

Assert all of the following:

```js
const index = search.buildGuideSearchIndex(chapters, {
  basePath: "/en/guide",
  locale: "en",
});

assert.equal(
  search.searchGuideIndex(index, "rare full-text phrase").chapters[0].href,
  "/en/guide/research-sample",
);
assert.equal(
  search.searchGuideIndex(index, "recordings may fail").sections[0].href,
  "/en/guide/research-sample#respondent-count",
);
assert.equal(
  search.searchGuideIndex(index, "five people").text[0].href,
  "/en/guide/research-sample#respondent-count",
);
assert.ok(
  search.searchGuideIndex(index, "sample").text.every((item) => item.excerpt.length <= 160),
);
```

Also verify title ranking (`exact` before `prefix` before `substring` before body), case-insensitive Cyrillic matching, de-duplication, and hard limits of 3 chapters / 5 sections / 8 text fragments.

- [ ] **Step 2: Run the new test and confirm the expected failure**

Run:

```powershell
node --test content/guideSearch.test.mjs
```

Expected: FAIL because `content/guideSearch.ts` and its exports do not exist.

- [ ] **Step 3: Define serializable search types**

Replace the narrow `GuideSearchItem` in `components/guide/types.ts` with:

```ts
export type GuideSearchRecord = {
  id: string;
  locale: "ru" | "en";
  type: "chapter" | "section" | "text";
  href: string;
  chapterSlug: string;
  chapterTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  title: string;
  searchText: string;
  excerptSource: string;
  sourceOrder: number;
};

export type GuideSearchMatch = GuideSearchRecord & {
  excerpt: string;
};

export type GuideSearchResults = {
  chapters: GuideSearchMatch[];
  sections: GuideSearchMatch[];
  text: GuideSearchMatch[];
};
```

In the callout branch of `ContentBlock`, add optional `paragraphs?: string[]` and `items?: string[]`; Task 5 will populate and render them, while the indexer can support them immediately.

- [ ] **Step 4: Implement the pure index builder and query function**

In `content/guideSearch.ts`, export these exact public functions:

```ts
export function buildGuideSearchIndex(
  chapters: GuideChapter[],
  options: { basePath: string; locale: "ru" | "en" },
): GuideSearchRecord[];

export function searchGuideIndex(
  records: GuideSearchRecord[],
  query: string,
): GuideSearchResults;

export function getSuggestedGuideChapters(
  records: GuideSearchRecord[],
  limit?: number,
): GuideSearchRecord[];
```

Implementation rules:

```ts
const SEARCH_LIMITS = { chapter: 3, section: 5, text: 8 } as const;
const MAX_EXCERPT_LENGTH = 160;

function normalize(value: string, locale: "ru" | "en") {
  return value.normalize("NFKC").toLocaleLowerCase(locale).replace(/\s+/g, " ").trim();
}

function rank(title: string, searchText: string, query: string, locale: "ru" | "en") {
  const normalizedTitle = normalize(title, locale);
  const normalizedText = normalize(searchText, locale);
  const normalizedQuery = normalize(query, locale);

  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  if (normalizedText.includes(normalizedQuery)) return 3;
  return null;
}
```

Extract searchable fragments from every current block variant: lead/paragraph; callout title, text, paragraphs, items; all list items; image alt; toggle title/text/children; raw table text; steps title/items; checklist title/items; quote text/byline/author; table columns/cells; pathway title/items/CTA; and related labels. Section records include descendant-section text. Text records link to the nearest section anchor, or the chapter URL for chapter-level blocks.

Build excerpts around the first match, normalize whitespace, add a leading/trailing ellipsis only when truncated, and never exceed 160 characters. De-duplicate chapters by slug, sections by `chapterSlug + sectionId`, and text by `href + normalized excerptSource` before applying limits.

- [ ] **Step 5: Run focused and related tests**

Run:

```powershell
node --test content/guideSearch.test.mjs content/guideAdapter.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit the domain layer**

```powershell
git add content/guideSearch.ts content/guideSearch.test.mjs components/guide/types.ts
git commit -m "feat: add localized guide search index"
```

---

## Task 2: Centralize modal focus and repair mobile navigation

**Files:**

- Create: `components/guide/useModalDialog.ts`
- Create: `components/guide/modalDialog.test.mjs`
- Modify: `components/guide/GuideShell.tsx`
- Modify: `components/guide/MobileChrome.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add failing structural modal tests**

Create `components/guide/modalDialog.test.mjs` and assert that:

- the hook stores `document.activeElement`;
- it focuses `initialFocusRef` or the first focusable descendant;
- it intercepts `Tab`, `Shift+Tab`, and `Escape`;
- it applies and later restores `inert` on the background ref;
- cleanup restores focus to the original trigger;
- `MobileSiteMenu` has a visible close button inside the element with `role="dialog"`;
- `GuideShell` renders modal surfaces as siblings of a single background wrapper.

- [ ] **Step 2: Run the modal test and confirm failure**

```powershell
node --test components/guide/modalDialog.test.mjs
```

Expected: FAIL because the hook and in-dialog mobile close control are absent.

- [ ] **Step 3: Implement the reusable focus hook**

Use this interface in `components/guide/useModalDialog.ts`:

```ts
"use client";

type ModalDialogOptions = {
  open: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  backgroundRef: React.RefObject<HTMLElement | null>;
};

export function useModalDialog(options: ModalDialogOptions): void;
```

The hook must keep `onClose` in a ref so an inline callback does not tear down and re-open the focus cycle on every render. On open:

1. remember the active trigger if it is an `HTMLElement`;
2. remember whether the background already had `inert`;
3. set `inert` on the background;
4. focus the preferred target in `requestAnimationFrame`;
5. query only visible, enabled anchors, buttons, inputs, selects, textareas, and `[tabindex]:not([tabindex="-1"])` inside the dialog;
6. wrap forward Tab from the last item to the first and backward Tab from the first item to the last;
7. close on Escape;
8. on cleanup, cancel the frame, restore the prior inert state, and focus the trigger when it is still connected.

- [ ] **Step 4: Put non-modal content behind one inert boundary**

In `GuideShell.tsx`, add `const appContentRef = useRef<HTMLDivElement>(null)` and wrap `GuideHeader`, the main grid, and `MobileContentsSection` in:

```tsx
<div ref={appContentRef} className="guide-app-content">
  {/* normal guide UI */}
</div>
```

Keep actual modal dialogs as siblings after this wrapper. Remove the shell-level Escape handler for `menuOpen` and `searchOpen`; the shared hook owns those. Retain Escape handling for the non-modal contents disclosure only.

- [ ] **Step 5: Make the mobile menu a complete dialog**

Pass `backgroundRef` into `MobileSiteMenu`, add a `dialogRef`, use `useModalDialog`, and add this first row inside the dialog:

```tsx
<div className="mobile-site-menu-header">
  <p className="mobile-site-menu-title">{menuTitle}</p>
  <button ref={closeButtonRef} className="mobile-site-menu-close" type="button" onClick={onClose}>
    <span className="sr-only">{closeLabel}</span>
    <X aria-hidden="true" className="size-5" />
  </button>
</div>
```

The close button is the initial focus target. Style the row with existing 36 px control geometry and focus treatment; preserve the flat chapter navigation below it.

- [ ] **Step 6: Run tests and commit**

```powershell
node --test components/guide/modalDialog.test.mjs components/guide/guideChrome.test.mjs components/guide/mobileContents.test.mjs
git add components/guide/useModalDialog.ts components/guide/modalDialog.test.mjs components/guide/GuideShell.tsx components/guide/MobileChrome.tsx app/globals.css
git commit -m "fix: contain focus in guide dialogs"
```

Expected: PASS.

---

## Task 3: Replace duplicate search panels with one localized search dialog

**Files:**

- Create: `components/guide/guideCopy.ts`
- Create: `components/guide/GuideSearchDialog.tsx`
- Create: `components/guide/GuideSearchDialog.test.mjs`
- Modify: `app/guide/GuidePageRoute.tsx`
- Modify: `components/guide/GuideShell.tsx`
- Modify: `components/guide/GuideHeader.tsx`
- Modify: `components/guide/GuideNavigation.tsx`
- Modify: `components/guide/MobileChrome.tsx`
- Modify: `components/guide/guideChrome.test.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Add failing search-integration tests**

In `GuideSearchDialog.test.mjs`, inspect the new component and server route, and assert:

- `GuidePageRoute` builds the index from `getGuideChapters(locale)` and `getGuideBasePath(locale)` and passes `locale` plus `searchIndex` to `GuideShell`;
- only one element with `role="dialog"` is used for search at any viewport;
- empty query calls `getSuggestedGuideChapters`;
- non-empty query calls `searchGuideIndex`;
- Chapters, Sections, and Text matches are rendered as separate groups;
- text results include `<mark>` around the matching substring;
- links use the record `href` and close the dialog;
- visible results are vertically scrollable and snippets clamp to two lines.

Update `guideChrome.test.mjs` so it expects the search dialog in `GuideSearchDialog.tsx`, not two implementations in `GuideShell.tsx` and `MobileChrome.tsx`.

- [ ] **Step 2: Run the focused tests and confirm failure**

```powershell
node --test components/guide/GuideSearchDialog.test.mjs components/guide/guideChrome.test.mjs
```

Expected: FAIL because the new dialog and route props do not exist.

- [ ] **Step 3: Add a single localized copy source**

Create `components/guide/guideCopy.ts` with a typed `getGuideCopy(locale)` map. Include at least:

```ts
const guideCopy = {
  ru: {
    pageContents: "На этой странице",
    search: {
      label: "Поиск по гайду",
      placeholder: "Поиск по гайду…",
      close: "Закрыть поиск",
      suggested: "Предлагаемые главы",
      chapters: "Главы",
      sections: "Разделы",
      textMatches: "Совпадения в тексте",
      noResults: "Ничего не найдено",
    },
    menu: { title: "Главы гайда", close: "Закрыть навигацию" },
    checklist: {
      progress: (done: number, total: number) => `${done} из ${total}`,
      complete: "Все пункты отмечены",
      reset: "Сбросить",
    },
    table: { scrollRegion: "Прокручиваемая таблица" },
  },
  en: {
    pageContents: "On this page",
    search: {
      label: "Search the guide",
      placeholder: "Search the guide…",
      close: "Close search",
      suggested: "Suggested chapters",
      chapters: "Chapters",
      sections: "Sections",
      textMatches: "Text matches",
      noResults: "No results",
    },
    menu: { title: "Guide chapters", close: "Close navigation" },
    checklist: {
      progress: (done: number, total: number) => `${done} of ${total}`,
      complete: "All items checked",
      reset: "Reset",
    },
    table: { scrollRegion: "Scrollable table" },
  },
} as const;
```

Use this map for all search text, the touched mobile-menu labels, page contents, and checklist text. Pass localized search labels into `GuideHeader` and `GuideNavigation` so a RU page does not expose English-only search controls.

- [ ] **Step 4: Build and pass the server-side index**

In `GuidePageRoute.tsx`:

```tsx
const chapters = getGuideChapters(locale);
const chapter = chapters.find((item) => item.slug === slug);
const chapterBasePath = getGuideBasePath(locale);
const searchIndex = buildGuideSearchIndex(chapters, { chapterBasePath, locale });

<GuideShell
  chapter={chapter}
  locale={locale}
  searchIndex={searchIndex}
  chapterBasePath={chapterBasePath}
  languageLinks={getGuideLanguageLinks(chapter.slug, locale)}
  navigation={getGuideNavigation(chapter.slug, locale)}
  navigationGroups={getGuideNavigationGroups(chapter.slug, locale)}
/>
```

Use the exact option name chosen in Task 1 (`basePath`, not `chapterBasePath`) so the final call is type-correct:

```ts
buildGuideSearchIndex(chapters, { basePath: chapterBasePath, locale });
```

- [ ] **Step 5: Implement one responsive dialog**

`GuideSearchDialog.tsx` owns `query`, search input focus, grouping, excerpt highlighting, close/reset, and `useModalDialog`. Its public props are:

```ts
type GuideSearchDialogProps = {
  backgroundRef: React.RefObject<HTMLElement | null>;
  index: GuideSearchRecord[];
  locale: "ru" | "en";
  open: boolean;
  onClose: () => void;
};
```

Render an empty-state Suggested chapters group. For a query, omit empty result groups and render the localized no-results message only when all three arrays are empty. The result hierarchy is:

```tsx
<a className="search-dialog-result" href={item.href} onClick={handleClose}>
  <span className="search-dialog-result-title">{resultTitle}</span>
  <small className="search-dialog-result-path">{resultPath}</small>
  {item.type === "text" ? (
    <span className="search-dialog-result-excerpt">
      <HighlightedMatch text={item.excerpt} query={query} locale={locale} />
    </span>
  ) : null}
</a>
```

`HighlightedMatch` must split at the first locale-normalized match and wrap only the matched visible substring in `<mark>`. If normalization changes string offsets, fall back to rendering the excerpt without a mark rather than corrupting text.

Remove `GuideSearchPanel`, both local `getSearchResults` functions, `MobileSearchPanel`, and all related imports. Mount only `GuideSearchDialog` after the inert background wrapper. Reuse desktop `.search-dialog-*` geometry; at the mobile breakpoint, make the same dialog full-screen and change only layout CSS.

- [ ] **Step 6: Run tests and commit**

```powershell
node --test content/guideSearch.test.mjs components/guide/GuideSearchDialog.test.mjs components/guide/modalDialog.test.mjs components/guide/guideChrome.test.mjs
npm run typecheck
git add app/guide/GuidePageRoute.tsx components/guide/guideCopy.ts components/guide/GuideSearchDialog.tsx components/guide/GuideSearchDialog.test.mjs components/guide/GuideShell.tsx components/guide/GuideHeader.tsx components/guide/GuideNavigation.tsx components/guide/MobileChrome.tsx components/guide/guideChrome.test.mjs app/globals.css
git commit -m "feat: add accessible full-text guide search"
```

Expected: PASS.

---

## Task 4: Make article checklists useful and persistent

**Files:**

- Create: `components/guide/checklistState.mjs`
- Create: `components/guide/checklistState.d.mts`
- Create: `components/guide/checklistState.test.mjs`
- Create: `components/guide/ArticleChecklist.tsx`
- Modify: `components/guide/ArticleBlocks.tsx`
- Modify: `components/guide/ArticleContent.tsx`
- Modify: `components/guide/articleComponents.test.mjs`
- Modify: `components/guide/GuideShell.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write failing checklist-state tests**

Test the public helpers with a small in-memory Storage double:

```js
assert.deepEqual(readChecklistState(storage, "key", 4), new Set());
storage.setItem("key", JSON.stringify({ version: 1, checked: [0, 2, 99, -1, 2] }));
assert.deepEqual([...readChecklistState(storage, "key", 4)], [0, 2]);
assert.deepEqual([...toggleChecklistIndex(new Set([0]), 1, 3)], [0, 1]);
assert.deepEqual([...toggleChecklistIndex(new Set([0, 1]), 1, 3)], [0]);
writeChecklistState(storage, "key", new Set([1]));
assert.equal(storage.getItem("key"), '{"version":1,"checked":[1]}');
writeChecklistState(storage, "key", new Set());
assert.equal(storage.getItem("key"), null);
```

Also cover malformed JSON, wrong version, non-array `checked`, storage methods throwing, and an item-count decrease.

- [ ] **Step 2: Confirm the test fails**

```powershell
node --test components/guide/checklistState.test.mjs
```

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Implement storage helpers**

Export these functions from `checklistState.mjs`, with matching declarations in `checklistState.d.mts`:

```js
export function getChecklistStorageKey(locale, chapterSlug, blockId) {
  return `wynde-guide-checklist:v1:${locale}:${chapterSlug}:${blockId}`;
}

export function readChecklistState(storage, key, itemCount) {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "null");
    if (parsed?.version !== 1 || !Array.isArray(parsed.checked)) return new Set();
    return new Set(
      parsed.checked.filter(
        (index) => Number.isInteger(index) && index >= 0 && index < itemCount,
      ),
    );
  } catch {
    return new Set();
  }
}
```

`toggleChecklistIndex` must always return a new `Set`, reject out-of-range indexes, and `writeChecklistState` must remove an empty state. All storage exceptions are swallowed while the component's in-memory state remains usable.

- [ ] **Step 4: Build the client checklist component**

Create `ArticleChecklist.tsx` with `"use client"` and this API:

```ts
type ArticleChecklistProps = {
  items: string[];
  labels: {
    progress: (done: number, total: number) => string;
    complete: string;
    reset: string;
  };
  storageKey: string;
  title?: string;
};
```

Render server and first client pass with `new Set<number>()`. After mount, restore storage once. Render each item as one `<label>` containing a native controlled `<input type="checkbox">`, the visual checkbox span, and the full text. Persist every toggle; show Reset only when `checked.size > 0`; show completion text only at `checked.size === items.length && items.length > 0`; put progress/completion in an `aria-live="polite"` status.

Do not use disabled inputs, pre-check all items, add a strike-through, or create global/chapter completion.

- [ ] **Step 5: Wire stable keys through recursive article rendering**

Change `ArticleContent` to accept an explicit `locale` prop instead of inferring it from `updatedAt`. Pass `locale`, `chapter.slug`, and localized checklist labels through `GuideSectionView` and recursive `ContentBlockView` calls. For both `todoList` and `checklist`:

```tsx
<ArticleChecklist
  items={block.items}
  labels={checklistLabels}
  storageKey={getChecklistStorageKey(locale, chapterSlug, blockId)}
  title={block.type === "checklist" ? block.title : undefined}
/>
```

Never pass `chapter.title` as the checklist title and remove `checklistAccentItemIndex`; this removes the duplicate H1-as-H3 and the arbitrary fifth-item accent. Re-export `ArticleChecklist` from `ArticleBlocks.tsx` only if existing imports/tests need that compatibility; its implementation must live in the client file.

- [ ] **Step 6: Update checklist styles and regression assertions**

Style these states:

- `.article-checklist-header`: title and progress on one desktop row, wrapping on narrow screens;
- unchecked `.article-checklist-icon`: surface background plus a visible `var(--line-strong)` border;
- checked state: `var(--accent)` background, white check;
- input focus: a visible ring on the visual checkbox;
- completed label: readable `var(--muted)`, no opacity below AA contrast;
- `.article-checklist-reset`: quiet text button, minimum 36 px target, hover and focus states.

Update `articleComponents.test.mjs` to assert native checkbox markup, stable storage-key construction, no chapter-title checklist prop, no accent index, sequential headings, progress/status, and Reset behavior hooks.

- [ ] **Step 7: Run tests and commit**

```powershell
node --test components/guide/checklistState.test.mjs components/guide/articleComponents.test.mjs
npm run typecheck
git add components/guide/checklistState.mjs components/guide/checklistState.d.mts components/guide/checklistState.test.mjs components/guide/ArticleChecklist.tsx components/guide/ArticleBlocks.tsx components/guide/ArticleContent.tsx components/guide/articleComponents.test.mjs components/guide/GuideShell.tsx app/globals.css
git commit -m "feat: make guide checklists interactive"
```

Expected: PASS.

---

## Task 5: Preserve deterministic structured callout content

**Files:**

- Modify: `content/guide.ts`
- Modify: `content/guideAdapter.test.mjs`
- Modify: `content/guide-structure.test.mjs`
- Modify: `content/guideSearch.test.mjs`
- Modify: `components/guide/ArticleBlocks.tsx`
- Modify: `components/guide/articleComponents.test.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Add failing adapter tests for source-aware structure**

Extend `guideAdapter.test.mjs` with a callout fixture whose source explicitly contains paragraph and list boundaries:

```js
{
  type: "callout",
  text: "Scenario example\n\nKeep the task neutral.\n\n- Do not reveal the answer\n- Keep one intent per task",
}
```

Expected adapter output:

```js
{
  type: "callout",
  variant: "example",
  title: "Scenario example",
  text: "Keep the task neutral.\n\n- Do not reveal the answer\n- Keep one intent per task",
  paragraphs: ["Keep the task neutral."],
  items: ["Do not reveal the answer", "Keep one intent per task"],
}
```

Also assert that a single flat sentence produces only the existing `text` fallback and that capitalization alone never creates a title, paragraph, or list.

- [ ] **Step 2: Confirm failure**

```powershell
node --test content/guideAdapter.test.mjs components/guide/articleComponents.test.mjs
```

Expected: FAIL because structured fields are not populated/rendered.

- [ ] **Step 3: Implement deterministic parsing**

Add a helper in `content/guide.ts` that:

- normalizes CRLF to LF;
- splits paragraphs only on blank lines;
- recognizes list items only when every non-empty line in a chunk starts with `- `, `* `, or `• `;
- preserves the full fallback `text` exactly after the known prefix is removed;
- returns no optional fields when no explicit source delimiter exists.

Have `parseNotionCallout` apply this helper after Pro-tip/known-prefix classification. Do not add content-specific hardcoding beyond the existing known prefix map.

- [ ] **Step 4: Render paragraphs and items semantically**

In both `ArticleExampleCard` and `ArticleCallout`, prefer `block.paragraphs` when present, otherwise keep the existing double-newline fallback. Render `block.items` as:

```tsx
<ul className="article-callout-list type-body">
  {block.items.map((item) => <li key={item}>{item}</li>)}
</ul>
```

Keep the current string renderer for legacy callouts and update the search extractor test to confirm optional paragraphs/items are searchable without duplicate result records.

- [ ] **Step 5: Run tests and commit**

```powershell
node --test content/guideAdapter.test.mjs content/guide-structure.test.mjs content/guideSearch.test.mjs components/guide/articleComponents.test.mjs
npm run typecheck
git add content/guide.ts content/guideAdapter.test.mjs content/guide-structure.test.mjs content/guideSearch.test.mjs components/guide/ArticleBlocks.tsx components/guide/articleComponents.test.mjs app/globals.css
git commit -m "fix: preserve structured callout content"
```

Expected: PASS.

---

## Task 6: Make article tables readable and predictably scrollable

**Files:**

- Modify: `components/guide/ArticleBlocks.tsx`
- Modify: `components/guide/ArticleContent.tsx`
- Modify: `components/guide/articleTable.test.mjs`
- Modify: `components/guide/articleComponents.test.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Change table tests to the approved breakpoint contract**

Update `articleTable.test.mjs` to assert:

- a 2-column table has no region role, accessible name, tab stop, or scroll cue;
- a 3-column table has `data-scrollable="true"`, `role="region"`, `tabindex="0"`, an accessible label, and a decorative continuation cue;
- a 5-column table also keeps `data-wide="true"`;
- row/column header semantics are unchanged.

Update CSS assertions so only `[data-scrollable="true"] table` receives the 700 px mobile minimum width. Assert table header/body font size is at least 12 px and line height at least 18 px.

- [ ] **Step 2: Run and confirm expected failure**

```powershell
node --test components/guide/articleTable.test.mjs components/guide/articleComponents.test.mjs
```

Expected: FAIL because the current threshold is five columns and every mobile table gets `min-width: 700px`.

- [ ] **Step 3: Implement table semantics and cue**

In `ArticleTable`:

```ts
const isScrollable = block.columns.length >= 3;
const isWide = block.columns.length >= 5;
```

Use `isScrollable` for `role`, `aria-label`, `tabIndex`, and `data-scrollable`. Keep `isWide` only for the 1040 px wide-table layout. Wrap the scroll region in `.article-table-shell` and render an `aria-hidden="true"` arrow cue only when `isScrollable` is true. The table region's label remains the non-empty joined column labels, with a localized generic fallback passed from `ArticleContent` if every header is blank.

- [ ] **Step 4: Implement responsive CSS**

- Base: 2-column tables remain `width/min-width: 100%` and wrap in the article.
- Mobile: `.article-table[data-scrollable="true"] table { min-width: 700px; }`.
- Wide: `.article-table[data-wide="true"] table { min-width: 1040px; }`.
- Cue: a restrained right-edge gradient plus arrow, pointer-events none.
- Font: 12 px / 18 px minimum for cells and headers while retaining Roboto Mono for headers.
- Never create page-level horizontal overflow.

- [ ] **Step 5: Run tests and commit**

```powershell
node --test components/guide/articleTable.test.mjs components/guide/articleComponents.test.mjs
npm run typecheck
git add components/guide/ArticleBlocks.tsx components/guide/ArticleContent.tsx components/guide/articleTable.test.mjs components/guide/articleComponents.test.mjs app/globals.css
git commit -m "fix: improve article table accessibility"
```

Expected: PASS.

---

## Task 7: Correct no-content chrome, theme hydration, and light-theme contrast

**Files:**

- Create: `components/guide/accessibilityTokens.test.mjs`
- Modify: `components/guide/GuideHeader.tsx`
- Modify: `components/guide/GuideShell.tsx`
- Modify: `components/guide/MobileChrome.tsx`
- Modify: `components/guide/guideChrome.test.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Add failing regression tests**

Extend `guideChrome.test.mjs` to assert:

- `GuideHeader` accepts `hasContents`;
- when `hasContents` is false it renders a non-button current-chapter row with no chevron and no `aria-expanded`;
- `MobileContentsSection` returns null when `links.length === 0` even if `open` is true;
- the initial `themeMode` state is always `"light"` on server and first client render;
- stored theme is read in a mount effect;
- theme writes are guarded until initialization completes.

Create `accessibilityTokens.test.mjs` that resolves the changed Figma hex tokens and calculates relative luminance/contrast. Assert at least 4.5:1 against white for the light-theme nav-link text, ToC active text, and text-accent use.

- [ ] **Step 2: Run and confirm failures**

```powershell
node --test components/guide/guideChrome.test.mjs components/guide/accessibilityTokens.test.mjs
```

Expected: FAIL on the missing static state, lazy localStorage initializer, and current 4.12/4.13 contrast colors.

- [ ] **Step 3: Implement the no-section header state**

Pass `hasContents={sectionLinks.length > 0}` into `GuideHeader`. Preserve the secondary row's height, dot, and current chapter title, but render:

```tsx
<div className="guide-header-nav-panel" data-static="true" aria-label={currentTitle}>
  <span className="guide-header-nav-dot" aria-hidden="true" />
  <span>{currentTitle}</span>
</div>
```

Only render the button/chevron branch when `hasContents` is true. Add the defensive empty-link return in `MobileContentsSection` and ensure `onContents` cannot set the disclosure open without links.

- [ ] **Step 4: Make theme initialization deterministic**

In `GuideShell`:

```ts
const [themeMode, setThemeMode] = useState<GuideThemeMode>("light");
const [themeReady, setThemeReady] = useState(false);

useEffect(() => {
  const stored = window.localStorage.getItem("wynde-guide-theme");
  if (stored === "light" || stored === "dark") setThemeMode(stored);
  setThemeReady(true);
}, []);

useEffect(() => {
  if (!themeReady) return;
  document.documentElement.dataset.theme = themeMode;
  window.localStorage.setItem("wynde-guide-theme", themeMode);
}, [themeMode, themeReady]);
```

Do not add `suppressHydrationWarning`. The server and first client markup must agree; the stored preference is applied after mount and reflected in toggle state.

- [ ] **Step 5: Raise only the failing light-theme tokens**

Use existing palette values:

```css
:root {
  --nav-link-fg: var(--figma-color-text-nav-button); /* #63636B */
  --toc-link-active-fg: var(--figma-color-accent-600); /* #1963CD */
  --accent: var(--figma-color-accent-600);
}
```

Do not alter dark-theme tokens unless the automated contrast test identifies a separate failure. Verify that focus and checkbox fill still remain visually distinct.

- [ ] **Step 6: Run tests and commit**

```powershell
node --test components/guide/guideChrome.test.mjs components/guide/accessibilityTokens.test.mjs components/guide/modalDialog.test.mjs components/guide/articleComponents.test.mjs
npm run typecheck
git add components/guide/accessibilityTokens.test.mjs components/guide/GuideHeader.tsx components/guide/GuideShell.tsx components/guide/MobileChrome.tsx components/guide/guideChrome.test.mjs app/globals.css
git commit -m "fix: harden guide chrome accessibility"
```

Expected: PASS.

---

## Task 8: Add browser proof and run the complete verification matrix

**Files:**

- Create: `scripts/verify-guide-ui.mjs`
- Modify only if a real regression is found: files owned by Tasks 1-7

- [ ] **Step 1: Add a focused Playwright verification script**

The script reads `GUIDE_BASE_URL` with a default of `http://127.0.0.1:3000`, then attempts Chromium, Firefox, and WebKit. A missing non-Chromium runtime is logged as `SKIP <browser>: runtime unavailable`; Chromium failure is fatal. It must never install browsers or dependencies.

Run the same assertions with base paths `/guide` (RU) and `/en/guide` (EN):

1. Open `soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat` at 1440 px.
2. Click the visible `.sidebar-search` trigger and assert focus moves to the searchbox.
3. Search `Sun Microsystems`; assert Chapter and Text groups appear and at least one result links to the correct chapter/nearest section.
4. Clear the query, read the first article H2, search its complete text, and assert a Section result links to that heading anchor.
5. Tab and Shift+Tab past both ends; assert `dialog.contains(document.activeElement)` remains true.
6. Press Escape; assert the dialog closes and `.sidebar-search` regains focus.
7. At 390 px, open search from the mobile header and repeat containment/Escape.
8. At 390 px, open mobile navigation; assert the in-dialog close button is focused and background content has `inert`.

For `/en/guide/chek-list-o-chem-esche-podumat-pered-zapuskom` and the RU equivalent:

1. Assert the secondary header row is static and has no chevron.
2. Check the first native checkbox; assert progress becomes `1 of N` / `1 из N`.
3. Reload; assert the same checkbox remains checked.
4. Click Reset; assert all items are unchecked and the storage key is removed.
5. Assert there is only one H1 and no H3 whose text equals the H1.

For `/en/guide/metody-kak-vybrat-i-zapustit` at 320 and 390 px:

1. Assert the 3-column table is a named, focusable local region with `data-scrollable="true"`.
2. Assert the table scroll width exceeds its client width, while `document.documentElement.scrollWidth === innerWidth`.
3. Assert computed table-cell font size is at least 12 px.

For `/en/guide/auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo`:

1. Assert the 2-column table has no region role/tab stop.
2. Assert its scroll width does not exceed its client width at 320 and 390 px.

Finally, set `wynde-guide-theme=dark`, reload, collect console errors, and fail on any message containing `hydration`, `did not match`, or `server rendered`.

- [ ] **Step 2: Run unit/static verification**

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Run browser verification against the production build**

In terminal A:

```powershell
npm run start -- --hostname 127.0.0.1 --port 3000
```

In terminal B:

```powershell
$env:GUIDE_BASE_URL="http://127.0.0.1:3000"
node scripts/verify-guide-ui.mjs
```

Expected: Chromium PASS for RU and EN at all required widths. Firefox and WebKit PASS when their installed Playwright runtimes are available; otherwise the script records the exact missing runtime as specified.

- [ ] **Step 4: Visually inspect the named states**

Capture and inspect screenshots at 320, 390, 1024, and 1440 px for:

- empty/populated/no-result search in RU and EN;
- untouched/in-progress/complete checklist;
- mobile menu open;
- 2-column and 3-column tables;
- light and dark theme.

Confirm no page-level horizontal scroll, clipped labels, unreadable completed text, double heading, empty contents panel, or generic/gamified completion styling.

- [ ] **Step 5: Commit the browser proof**

```powershell
git add scripts/verify-guide-ui.mjs
git commit -m "test: add guide interaction browser proof"
```

- [ ] **Step 6: Final change audit**

```powershell
git status --short
git diff 63d8d00..HEAD --stat
git diff 63d8d00..HEAD --check
```

Expected: clean worktree, only the planned files changed, and no whitespace errors.

## Plan self-review checklist

- [ ] Every in-scope item from the approved specification maps to a task and a verification assertion.
- [ ] Search limits, excerpt length, destinations, and RU/EN behavior are exact.
- [ ] Checklist persistence has a versioned key, malformed-state handling, reset, and hydration-safe initial state.
- [ ] Modal focus behavior is centralized and browser-tested, not inferred from ARIA attributes alone.
- [ ] Two-column and 3+-column table behavior are different by design and explicitly tested.
- [ ] No new dependency, backend, account state, copy rewrite, or global progress feature is introduced.
- [ ] Each implementation commit can be reviewed and reverted independently.
