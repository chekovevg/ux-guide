import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articleSource = await readFile(
  new URL("./ArticleContent.tsx", import.meta.url),
  "utf8",
);
const mobileResistanceCover = await readFile(
  new URL("../../public/figma/cover-resistance-mobile.png", import.meta.url),
).catch(() => Buffer.alloc(0));
const articleBlocksSource = await readFile(
  new URL("./ArticleBlocks.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const articleChecklistSource = await readFile(
  new URL("./ArticleChecklist.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const guideShellSource = await readFile(
  new URL("./GuideShell.tsx", import.meta.url),
  "utf8",
);
const articleComponentSource = `${articleSource}\n${articleBlocksSource}\n${articleChecklistSource}`;
const cssSource = await readFile(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);
const layoutSource = await readFile(
  new URL("../../app/layout.tsx", import.meta.url),
  "utf8",
);
const mobileArticleCssStart = cssSource.indexOf(
  "@media (max-width: 63.999rem)",
);
const mobileArticleCssEnd = cssSource.indexOf(
  ".guide-header",
  mobileArticleCssStart,
);
const mobileArticleCss = cssSource.slice(
  mobileArticleCssStart,
  mobileArticleCssEnd,
);

function cssRuleBody(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cssSource.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));

  assert.ok(match, `Expected CSS rule for ${selector}`);

  return match[1];
}

test("uses the Figma mobile resistance cover without replacing the desktop fallback", () => {
  assert.match(
    articleSource,
    /"\/figma\/cover-resistance\.svg": "\/figma\/cover-resistance-mobile\.png"/,
  );
  assert.match(articleSource, /<picture className="article-hero-cover-media block">/);
  assert.match(
    articleSource,
    /<source\s+media="\(max-width: 63\.999rem\)"\s+srcSet=\{mobileCoverSrc\}/s,
  );
  assert.match(articleSource, /<Image[\s\S]*src=\{chapter\.coverImage\.src\}/);
  assert.deepEqual(
    [...mobileResistanceCover.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
  assert.equal(mobileResistanceCover.readUInt32BE(16), 1360);
  assert.equal(mobileResistanceCover.readUInt32BE(20), 696);
});

test("loads the guide fonts on the root element with token fallbacks", () => {
  assert.match(
    layoutSource,
    /import \{ Inter, Roboto_Mono \} from "next\/font\/google";/,
  );
  assert.match(
    layoutSource,
    /Inter\(\{\s*subsets: \["cyrillic", "latin"\],\s*variable: "--font-inter",\s*display: "swap",\s*\}\)/,
  );
  assert.match(
    layoutSource,
    /Roboto_Mono\(\{\s*subsets: \["cyrillic", "latin"\],\s*variable: "--font-roboto-mono",\s*display: "swap",\s*\}\)/,
  );
  assert.match(
    layoutSource,
    /<html\s+lang="ru"\s+className=\{`\$\{inter\.variable\} \$\{robotoMono\.variable\}`\}/s,
  );
  assert.match(
    cssSource,
    /var\(--font-inter, var\(--figma-typography-font-family-inter\)\)/,
  );
  assert.match(
    cssSource,
    /var\(--font-roboto-mono, var\(--figma-typography-font-family-roboto-mono\)\)/,
  );
});

test("maps article typography to the responsive Figma type tokens", () => {
  const h1Rule = cssRuleBody(".type-h1");
  const h2Rule = cssRuleBody(".type-h2");
  const h3Rule = cssRuleBody(".type-h3");
  const leadRule = cssRuleBody(".type-lead");
  const bodyRule = cssRuleBody(".type-body");

  assert.match(h1Rule, /font-weight: 600;/);
  assert.match(h1Rule, /letter-spacing: var\(--figma-typography-letter-space-h1\);/);
  assert.match(h2Rule, /letter-spacing: var\(--figma-typography-letter-space-h2\);/);
  assert.match(h3Rule, /letter-spacing: var\(--figma-typography-letter-space-h3\);/);
  assert.match(leadRule, /letter-spacing: var\(--figma-typography-letter-space-lead\);/);
  assert.match(bodyRule, /letter-spacing: var\(--figma-typography-letter-space-p\);/);
  assert.match(
    cssSource,
    /:where\(\.type-h1, \.type-h2, \.type-h3, \.type-lead, \.type-body\)\s*\{[\s\S]*?text-box-trim: trim-both;[\s\S]*?text-box-edge: cap alphabetic;/,
  );
});

test("uses semantic article classes for token-driven responsive rhythm", () => {
  for (const className of [
    "article-hero",
    "article-hero-text",
    "article-hero-cover",
    "article-chapter-block-stack",
    "article-section",
    "article-subsection",
    "article-subsection-stack",
  ]) {
    assert.match(articleSource, new RegExp(`\\b${className}\\b`));
  }

  for (const legacyClass of [
    "mt-[14px]",
    "mt-[52px]",
    "pt-[84px]",
    "pt-10",
    "mt-10 flex flex-col gap-8",
    "mt-8 flex flex-col gap-6",
  ]) {
    assert.doesNotMatch(articleSource, new RegExp(legacyClass.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(
    cssRuleBody(".article-block-stack"),
    /gap: var\(--figma-indent-article-gaps-vertical-base-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-hero-text"),
    /gap: var\(--figma-indent-article-gaps-vertical-base-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-hero-cover"),
    /margin-top: var\(--figma-indent-article-gaps-headings-h1-mb\);/,
  );
  assert.match(cssRuleBody(".article-hero-cover"), /aspect-ratio: 351 \/ 180;/);
  assert.match(
    cssRuleBody(".article-chapter-block-stack"),
    /margin-top: var\(--figma-indent-article-gaps-vertical-base-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-section"),
    /padding-top: var\(--figma-indent-article-gaps-headings-h2-mt\);/,
  );
  assert.match(cssRuleBody(".article-subsection"), /padding-top: 0;/);
  assert.match(
    cssRuleBody(".article-subsection-stack"),
    /margin-top: var\(--figma-indent-article-gaps-vertical-section-container-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-subsection-stack"),
    /gap: var\(--figma-indent-article-gaps-vertical-section-container-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-subsection .article-subsection-stack"),
    /margin-top: var\(--figma-indent-article-gaps-vertical-base-gap\);/,
  );
  assert.match(
    cssRuleBody(".article-subsection .article-subsection-stack"),
    /gap: var\(--figma-indent-article-gaps-vertical-base-gap\);/,
  );
});

test("renders clickable article heading links with hover icons", () => {
  assert.match(articleSource, /className="article-heading/);
  assert.match(articleSource, /className="article-heading-link/);
  assert.match(articleSource, /<HeadingLinkIcon \/>/);
  assert.match(articleSource, /href=\{`#\$\{section\.id\}`\}/);
  assert.match(articleSource, /navigator\.clipboard\.writeText/);
  assert.match(cssSource, /\.article-heading:hover\s+\.article-heading-icon/);
  assert.match(cssSource, /\.article-heading-link/);
  assert.match(cssSource, /\.article-heading-icon/);
});

test("uses lucide icons instead of malformed exported Figma icon SVGs", () => {
  assert.match(articleBlocksSource, /import \{[^}]*\bLink as LucideLink\b[^}]*\} from "lucide-react"/s);
  assert.match(articleChecklistSource, /import \{ Check \} from "lucide-react"/);
  assert.match(articleComponentSource, /<LucideLink aria-hidden="true"/);
  assert.match(articleChecklistSource, /<Check[^>]*aria-hidden="true"[^>]*className="size-3"[^>]*strokeWidth=\{3\}/s);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-link-heading\.svg/);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-link-callout\.svg/);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-checkbox-checked\.svg/);
});

test("maps callout, checklist, quote, and table blocks to Figma article component classes", () => {
  const exampleCardTitleRule = cssRuleBody(".article-example-card-title");
  const exampleCardTextRule = cssRuleBody(".article-example-card-text");

  assert.match(articleComponentSource, /className=\{`article-callout article-callout-\$\{block\.variant\}`\}/);
  assert.match(articleComponentSource, /className="article-callout-anchor/);
  assert.match(articleSource, /<ArticleExampleCard block=\{block\} blockId=\{blockId\} \/>/);
  assert.match(articleComponentSource, /className="article-example-card"/);
  assert.match(articleComponentSource, /const textParagraphs = block\.paragraphs \?\?/);
  assert.match(articleComponentSource, /\.split\(\/\\n\{2,\}\/\)/);
  assert.match(articleBlocksSource, /<ul className="article-callout-list type-body">/);
  assert.match(articleBlocksSource, /block\.items\.map\(\(item\) =>/);
  assert.match(articleBlocksSource, /<li key=\{item\}>\{item\}<\/li>/);
  assert.match(articleChecklistSource, /className="article-checklist/);
  assert.match(articleChecklistSource, /className="article-checklist-text"/);
  assert.match(articleComponentSource, /className="article-quote/);
  assert.match(articleComponentSource, /className="article-quote-avatar/);
  assert.match(articleComponentSource, /className="article-quote-author-name/);
  assert.match(articleComponentSource, /className="article-quote-author-title/);
  assert.match(articleComponentSource, /className="article-table/);
  assert.match(cssSource, /\.article-callout/);
  assert.match(cssSource, /\.article-callout-list/);
  assert.match(cssSource, /\.article-example-card/);
  assert.match(cssSource, /\.article-example-card\s*\{[\s\S]*?background: var\(--surface-soft\);/);
  assert.match(cssSource, /\.article-example-card\s*\{[\s\S]*?padding: var\(--figma-indent-space-28\) var\(--figma-indent-padding-card\);/);
  assert.match(exampleCardTitleRule, /color: var\(--article-callout-text\);/);
  assert.match(exampleCardTextRule, /color: var\(--article-callout-text\);/);
  assert.match(cssSource, /\.article-checklist/);
  assert.match(cssSource, /\.article-checklist-title\s*\{[\s\S]*?letter-spacing: var\(--figma-typography-letter-space-h3\);/);
  assert.match(cssSource, /\.article-checklist-icon\s*\{[\s\S]*?border-radius: var\(--figma-indent-space-4\);/);
  assert.match(cssSource, /\.article-checklist-icon\s*\{[\s\S]*?background: var\(--surface\);/);
  assert.match(cssSource, /\.article-checklist-item:has\(input:checked\) \.article-checklist-icon\s*\{[\s\S]*?background: var\(--accent\);/);
  assert.match(cssSource, /\.article-checklist-text\s*\{[\s\S]*?padding-top: var\(--figma-indent-space-4\);/);
  assert.match(cssSource, /\.article-quote/);
  assert.match(cssSource, /\.article-table/);
});

test("keeps article component geometry local and matches the mobile Figma contract", () => {
  const guideGridRule = cssRuleBody(".guide-grid");
  const checklistRule = cssRuleBody(".article-checklist");
  const checklistListRule = cssRuleBody(".article-checklist-list");
  const checklistItemRule = cssRuleBody(".article-checklist-item");
  const quoteRule = cssRuleBody(".article-quote");
  const quoteTextRule = cssRuleBody(".article-quote-text");
  const quoteAuthorRule = cssRuleBody(".article-quote-author");
  const quoteAvatarRule = cssRuleBody(".article-quote-avatar");
  const quoteNameRule = cssRuleBody(".article-quote-author-name");
  const quoteTitleRule = cssRuleBody(".article-quote-author-title");
  const tableRule = cssRuleBody(".article-table");
  const tableElementRule = cssRuleBody(".article-table table");
  const tableHeaderRule = cssRuleBody(".article-table th");
  const tableFirstHeaderRule = cssRuleBody(".article-table th:first-child");
  const tableCellRule = cssRuleBody(".article-table td");

  assert.ok(mobileArticleCssStart >= 0, "Expected mobile article breakpoint");
  assert.ok(
    mobileArticleCssEnd > mobileArticleCssStart,
    "Expected the mobile article component CSS boundary",
  );

  assert.match(guideGridRule, /display: block;/);
  assert.match(guideGridRule, /overflow-x: clip;/);
  assert.match(tableRule, /overflow-x: auto;/);
  assert.match(tableElementRule, /min-width: 100%;/);
  assert.doesNotMatch(tableElementRule, /min-width: 700px;/);
  assert.match(
    mobileArticleCss,
    /\.article-table\[data-scrollable="true"\] table\s*\{[^}]*min-width: 700px;/s,
  );
  assert.doesNotMatch(
    mobileArticleCss,
    /(?<!\[data-scrollable="true"\])\s+table\s*\{[^}]*min-width: 700px;/s,
  );
  assert.match(tableHeaderRule, /font-size: (?:max\([^;]*12px[^;]*\)|12px);/);
  assert.match(tableHeaderRule, /line-height: (?:max\([^;]*18px[^;]*\)|18px);/);
  assert.match(tableCellRule, /font-size: (?:max\([^;]*12px[^;]*\)|12px);/);
  assert.match(tableCellRule, /line-height: (?:max\([^;]*18px[^;]*\)|18px);/);
  assert.match(tableFirstHeaderRule, /width: 28%;/);
  assert.doesNotMatch(tableFirstHeaderRule, /width: 84px;/);
  assert.match(tableHeaderRule, /overflow-wrap: anywhere;/);
  assert.match(tableCellRule, /overflow-wrap: anywhere;/);
  assert.match(
    cssSource,
    /\.article-table td:first-child\s*\{[\s\S]*?padding-right: var\(--figma-indent-space-16\);/,
  );

  assert.match(checklistRule, /gap: var\(--figma-indent-space-32\);/);
  assert.match(checklistListRule, /gap: var\(--figma-indent-space-18\);/);
  assert.match(checklistItemRule, /gap: var\(--figma-indent-space-12\);/);
  assert.doesNotMatch(
    mobileArticleCss,
    /\.article-checklist\s*\{[^}]*gap:/s,
  );

  assert.match(quoteRule, /gap: var\(--figma-indent-space-24\);/);
  assert.match(quoteTextRule, /font-size: var\(--figma-typography-font-size-quote\);/);
  assert.match(quoteAuthorRule, /gap: var\(--figma-indent-space-16\);/);
  assert.match(quoteAvatarRule, /width: 56px;/);
  assert.match(quoteAvatarRule, /border-radius: 999px;/);
  assert.match(quoteNameRule, /letter-spacing: 0;/);
  assert.match(quoteTitleRule, /font-size: var\(--type-caption-size\);/);

  assert.match(
    mobileArticleCss,
    /\.article-link\s*\{[^}]*white-space: normal;/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote\s*\{[^}]*gap: var\(--figma-indent-space-28\);/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote-text\s*\{[^}]*font-size: var\(--type-body-size\);[^}]*line-height: var\(--type-body-line\);[^}]*letter-spacing: var\(--figma-typography-letter-space-p\);/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote-author\s*\{[^}]*gap: var\(--figma-indent-space-12\);/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote-avatar\s*\{[^}]*width: 52px;[^}]*height: 52px;[^}]*flex-basis: 52px;[^}]*border-radius: var\(--radius-standard\);/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote-author-name\s*\{[^}]*letter-spacing: var\(--figma-typography-letter-space-p\);/s,
  );
  assert.match(
    mobileArticleCss,
    /\.article-quote-author-title\s*\{[^}]*font-family: var\(--font-mono-guide\);[^}]*font-size: var\(--type-table-size\);[^}]*line-height: var\(--type-table-line\);[^}]*letter-spacing: var\(--figma-typography-letter-space-table\);/s,
  );
});

test("delegates reusable article blocks without changing Figma class contracts", () => {
  assert.match(articleSource, /from "\.\/ArticleBlocks"/);

  for (const name of [
    "ArticleExampleCard",
    "ArticleCallout",
    "ArticleQuote",
    "ArticleTable",
  ]) {
    assert.match(articleBlocksSource, new RegExp(`export function ${name}`));
    assert.doesNotMatch(articleSource, new RegExp(`function ${name}`));
  }

  assert.match(articleSource, /<ArticleExampleCard block=\{block\} blockId=\{blockId\} \/>/);
  assert.match(articleSource, /<ArticleCallout[\s\S]*calloutBadgeLabel=\{calloutBadgeLabel\}/);
  assert.match(articleSource, /<ArticleChecklist/);
  assert.match(articleSource, /<ArticleQuote block=\{block\} \/>/);
  assert.match(
    articleSource,
    /<ArticleTable[\s\S]*block=\{block\}[\s\S]*blockId=\{blockId\}[\s\S]*scrollRegionLabel=\{getGuideCopy\(locale\)\.table\.scrollRegion\}[\s\S]*\/>/,
  );

  assert.match(articleBlocksSource, /className="article-example-card"/);
  assert.match(articleBlocksSource, /className=\{`article-callout article-callout-\$\{block\.variant\}`\}/);
  assert.match(articleBlocksSource, /export \{ ArticleChecklist \} from "\.\/ArticleChecklist"/);
  assert.match(articleChecklistSource, /export function ArticleChecklist/);
  assert.doesNotMatch(articleBlocksSource, /function ArticleChecklist/);
  assert.match(articleChecklistSource, /className="article-checklist"/);
  assert.match(articleBlocksSource, /className="article-quote"/);
  assert.match(articleBlocksSource, /className="article-table"/);
});

test("styles checklist interaction, completion, focus, and narrow wrapping", () => {
  const headerRule = cssRuleBody(".article-checklist-header");
  const iconRule = cssRuleBody(".article-checklist-icon");
  const checkedIconRule = cssRuleBody(
    ".article-checklist-item:has(input:checked) .article-checklist-icon",
  );
  const focusRule = cssRuleBody(
    ".article-checklist-input:focus-visible + .article-checklist-icon",
  );
  const checkedTextRule = cssRuleBody(
    '.article-checklist-item[data-checked="true"] .article-checklist-text',
  );
  const resetRule = cssRuleBody(".article-checklist-reset");

  assert.match(headerRule, /display: flex;/);
  assert.match(headerRule, /flex-wrap: wrap;/);
  assert.match(iconRule, /border: 1px solid var\(--line-strong\);/);
  assert.match(iconRule, /background: var\(--surface\);/);
  assert.match(checkedIconRule, /background: var\(--accent\);/);
  assert.match(checkedIconRule, /color: var\(--figma-color-text-white\);/);
  assert.match(focusRule, /outline: 2px solid var\(--accent\);/);
  assert.match(checkedTextRule, /color: var\(--muted\);/);
  assert.doesNotMatch(checkedTextRule, /opacity:/);
  assert.match(resetRule, /min-height: 36px;/);
  assert.match(cssSource, /\.article-checklist-reset:hover/);
  assert.match(cssSource, /\.article-checklist-reset:focus-visible/);
});

test("renders persistent native article checklists with localized status and reset", () => {
  assert.match(articleChecklistSource, /^"use client";/);
  assert.match(articleChecklistSource, /useState\(\(\) => new Set<number>\(\)\)/);
  assert.match(articleChecklistSource, /queueMicrotask\(\(\) =>/);
  assert.match(articleChecklistSource, /return \(\) => \{[\s\S]*?active = false;/);
  assert.match(articleChecklistSource, /readChecklistState\(window\.localStorage, storageKey, items\.length\)/);
  assert.match(articleChecklistSource, /writeChecklistState\(window\.localStorage, storageKey, next\)/);
  assert.match(articleChecklistSource, /toggleChecklistIndex\(checked, index, items\.length\)/);
  assert.match(articleChecklistSource, /<label[^>]*className="article-checklist-item"/s);
  assert.match(articleChecklistSource, /<input[\s\S]*?checked=\{checked\.has\(index\)\}[\s\S]*?type="checkbox"/);
  assert.doesNotMatch(articleChecklistSource, /\bdisabled\b/);
  assert.match(articleChecklistSource, /aria-live="polite"/);
  assert.match(articleChecklistSource, /labels\.progress\(checked\.size, items\.length\)/);
  assert.match(articleChecklistSource, /checked\.size === items\.length && items\.length > 0/);
  assert.match(articleChecklistSource, /<>\s*\{" "\}\s*<span className="article-checklist-complete">/);
  assert.match(articleChecklistSource, /\{labels\.complete\}/);
  assert.match(articleChecklistSource, /checked\.size > 0/);
  assert.match(articleChecklistSource, /onClick=\{handleReset\}/);
  assert.match(articleChecklistSource, /\{labels\.reset\}/);
});

test("uses stable recursive checklist keys without duplicating the chapter heading", () => {
  assert.match(guideShellSource, /<ArticleContent chapter=\{chapter\} locale=\{locale\} \/>/);
  assert.match(articleSource, /export function ArticleContent\(\{[\s\S]*?chapter,[\s\S]*?locale,[\s\S]*?\}:/);
  assert.match(articleSource, /const checklistLabels = getGuideCopy\(locale\)\.checklist/);
  assert.match(articleSource, /locale=\{locale\}/);
  assert.match(articleSource, /chapterSlug=\{chapter\.slug\}/);
  assert.match(articleSource, /checklistLabels=\{checklistLabels\}/);
  assert.match(articleSource, /getChecklistStorageKey\(locale, chapterSlug, blockId\)/);
  assert.match(articleSource, /title=\{block\.type === "checklist" \? block\.title : undefined\}/);
  assert.doesNotMatch(articleSource, /checklistTitle/);
  assert.doesNotMatch(articleComponentSource, /accentItemIndex|checklistAccentItemIndex|data-accent/);
  assert.match(articleSource, /<h1 className="type-h1">\{chapter\.title\}<\/h1>/);
  assert.match(articleSource, /const Heading = section\.headingLevel === 3 \? "h3" : "h2"/);
});

test("uses positional keys for repeated structured table values", () => {
  assert.match(articleBlocksSource, /block\.rows\.map\(\(row, rowIndex\) =>/);
  assert.match(articleBlocksSource, /row\.map\(\(cell, cellIndex\) =>/);
  assert.match(
    articleBlocksSource,
    /key=\{`\$\{rowIndex\}-\$\{cellIndex\}`\}/,
  );
  assert.doesNotMatch(articleBlocksSource, /key=\{cell\}/);
});

test("renders recursive toggle blocks with stable ids and native disclosure semantics", () => {
  assert.match(articleSource, /<details className="article-toggle/);
  assert.match(articleSource, /<summary className="article-toggle-summary/);
  assert.doesNotMatch(articleSource, /<details[^>]+\sopen(?:=|\s|>)/);
  assert.match(articleSource, /block\.blocks\.map\(\(childBlock, childIndex\) =>/);
  assert.match(articleSource, /`\$\{blockId\}-child-\$\{childIndex \+ 1\}`/);
  assert.match(articleSource, /block=\{childBlock\}/);
  assert.match(articleSource, /calloutBadgeLabel=\{calloutBadgeLabel\}/);
  assert.match(articleSource, /className="article-block-stack article-toggle-blocks"/);
});

test("renders semantic headers and an accessible wide-table scroll region", () => {
  assert.match(articleBlocksSource, /const showColumnHeaders = block\.showColumnHeaders !== false/);
  assert.match(articleBlocksSource, /const rowHeaders = block\.rowHeaders === true/);
  assert.match(articleBlocksSource, /const isScrollable = block\.columns\.length >= 3/);
  assert.match(articleBlocksSource, /const isWide = block\.columns\.length >= 5/);
  assert.match(articleBlocksSource, /role=\{isScrollable \? "region" : undefined\}/);
  assert.match(articleBlocksSource, /tabIndex=\{isScrollable \? 0 : undefined\}/);
  assert.match(articleBlocksSource, /data-scrollable=\{isScrollable \? "true" : undefined\}/);
  assert.match(articleBlocksSource, /data-wide=\{isWide \? "true" : undefined\}/);
  assert.match(articleBlocksSource, /regionLabel \|\| scrollRegionLabel/);
  assert.match(articleBlocksSource, /className="article-table-shell"/);
  assert.match(articleBlocksSource, /className="article-table-scroll-cue" aria-hidden="true"/);
  assert.match(articleBlocksSource, /<thead className=\{showColumnHeaders \? undefined : "sr-only"\}>/);
  assert.match(articleBlocksSource, /scope=\{isBlankCorner \? undefined : "col"\}/);
  assert.match(articleBlocksSource, /aria-hidden=\{isBlankCorner \? true : undefined\}/);
  assert.match(articleBlocksSource, /scope="row"/);
  assert.match(articleBlocksSource, /className="article-table-row-header"/);
});

test("keeps wide-table scrolling local and balances the hidden-header matrix", () => {
  assert.match(cssRuleBody(".article-table"), /overflow-x: auto;/);
  assert.match(cssRuleBody(".article-table"), /overscroll-behavior-inline: contain;/);
  assert.match(cssRuleBody('.article-table[data-wide="true"] table'), /min-width: 1040px;/);
  assert.match(
    mobileArticleCss,
    /\.article-table\[data-wide="true"\] table\s*\{[^}]*min-width: 1040px;/s,
  );
  assert.match(cssRuleBody('.article-table[data-column-headers="hidden"] th:first-child'), /width: auto;/);
  assert.match(
    cssRuleBody(".article-table th.article-table-row-header"),
    /text-transform: none;/,
  );
  assert.match(cssRuleBody(".article-toggle-blocks"), /min-width: 0;/);
  assert.match(cssRuleBody(".article-toggle-blocks"), /margin-top: var\(--figma-indent-space-16\);/);
});

test("renders Notion bullet groups as semantic unordered lists", () => {
  const listRule = cssRuleBody(".article-list");
  const listItemRule = cssRuleBody(".article-list > li");
  const listItemGapRule = cssRuleBody(".article-list > li + li");

  assert.match(articleSource, /case "bulletedList":/);
  assert.match(articleSource, /<ul className="article-list article-list-bulleted type-body">/);
  assert.match(articleSource, /<li key=\{item\}>\{item\}<\/li>/);
  assert.doesNotMatch(articleSource, /className="article-paragraph-list"/);
  assert.match(listRule, /display: block;/);
  assert.match(listRule, /padding: 0;/);
  assert.doesNotMatch(listRule, /padding-left:/);
  assert.match(listItemRule, /margin-inline-start: var\(--figma-indent-space-24\);/);
  assert.match(listItemGapRule, /margin-top: var\(--figma-indent-space-12\);/);
  assert.match(cssSource, /\.article-list-bulleted\s*\{[\s\S]*?list-style-type: disc;/);
  assert.match(cssSource, /\.article-paragraph\[data-terminal-colon="true"\] \+ \.article-list/);
});

test("localizes callout badges and keeps Help Center as a real link", () => {
  assert.match(articleSource, /const calloutBadgeLabel = locale === "en" \? "Tip" : "Совет";/);
  assert.doesNotMatch(articleSource, /chapter\.updatedAt\?\.startsWith\("Updated"\)/);
  assert.match(articleSource, /calloutBadgeLabel=\{calloutBadgeLabel\}/);
  assert.doesNotMatch(articleSource, /Pro-tip/);
  assert.match(articleSource, /<a\s+className="article-update-help-link"/);
  assert.match(articleSource, /href=\{helpHref\}/);
});
