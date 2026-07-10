import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articleSource = await readFile(
  new URL("./ArticleContent.tsx", import.meta.url),
  "utf8",
);
const articleBlocksSource = await readFile(
  new URL("./ArticleBlocks.tsx", import.meta.url),
  "utf8",
);
const cssSource = await readFile(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);
const articleComponentSource = `${articleSource}\n${articleBlocksSource}`;

function cssRuleBody(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cssSource.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));

  assert.ok(match, `Expected CSS rule for ${selector}`);

  return match[1];
}

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
  assert.match(articleComponentSource, /import \{[^}]*\bCheck\b[^}]*\bLink as LucideLink\b[^}]*\} from "lucide-react"/s);
  assert.match(articleComponentSource, /<LucideLink aria-hidden="true"/);
  assert.match(articleComponentSource, /<Check className="size-3" strokeWidth=\{3\}/);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-link-heading\.svg/);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-link-callout\.svg/);
  assert.doesNotMatch(articleComponentSource, /\/figma\/icon-checkbox-checked\.svg/);
});

test("maps semantic article blocks to the guide design-system layer", () => {
  const exampleCardRule = cssRuleBody(".article-example-card");
  const calloutRule = cssRuleBody(".article-callout-content");
  const checklistRule = cssRuleBody(".article-checklist");
  const quoteRule = cssRuleBody(".article-quote");
  const tableRule = cssRuleBody(".article-table");

  assert.match(articleSource, /from "\.\/ArticleBlocks"/);
  assert.match(articleBlocksSource, /export function ArticleCallout/);
  assert.match(articleBlocksSource, /export function ArticleTable/);
  assert.match(articleBlocksSource, /data-kind="example"/);
  assert.match(articleBlocksSource, /const calloutKind = block\.variant === "warning" \? "warning" : isTip \? "tip" : "note";/);
  assert.match(articleBlocksSource, /data-kind=\{calloutKind\}/);
  assert.match(articleSource, /<ArticleExampleCard block=\{block\} blockId=\{blockId\} \/>/);
  assert.match(articleSource, /<ArticleQuote block=\{block\} \/>/);
  assert.match(articleSource, /<ArticleTable block=\{block\} \/>/);
  assert.match(exampleCardRule, /border: var\(--ds-border-width\) solid var\(--guide-callout-example-border\);/);
  assert.match(exampleCardRule, /background: var\(--guide-callout-example-bg\);/);
  assert.match(exampleCardRule, /padding: var\(--guide-article-card-padding\);/);
  assert.match(calloutRule, /border-left-width: 4px;/);
  assert.match(calloutRule, /background: var\(--guide-callout-note-bg\);/);
  assert.match(cssSource, /\.article-callout\[data-kind="tip"\] \.article-callout-content\s*\{[\s\S]*?background: var\(--guide-callout-tip-bg\);/);
  assert.match(cssSource, /\.article-callout\[data-kind="warning"\] \.article-callout-content\s*\{[\s\S]*?background: var\(--guide-callout-warning-bg\);/);
  assert.match(checklistRule, /border: var\(--ds-border-width\) solid var\(--guide-card-border\);/);
  assert.match(checklistRule, /background: var\(--guide-card-bg\);/);
  assert.match(quoteRule, /border-left: 4px solid var\(--ds-border-strong\);/);
  assert.match(tableRule, /border: var\(--ds-border-width\) solid var\(--guide-table-border\);/);
  assert.match(cssSource, /\.article-table th\s*\{[\s\S]*?background: var\(--guide-table-header-bg\);/);
});

test("keeps article components off raw visual Tailwind and legacy token APIs", () => {
  const rawTailwindColorPattern = /\b(?:bg|text|border)-(?:blue|slate|gray|zinc|neutral|red|yellow|green)-\d+\b/;
  const legacyTokenPattern = /--ds-(surface|text|component|space|callout|control|stroke|radius-standard)/;

  assert.doesNotMatch(articleComponentSource, rawTailwindColorPattern);
  assert.doesNotMatch(articleComponentSource, legacyTokenPattern);
  assert.doesNotMatch(articleBlocksSource, /\b(?:bg|text|border|rounded|p|px|py)-\[/);
  assert.match(articleSource, /className="article-media-frame/);
  assert.match(articleSource, /className="article-steps"/);
  assert.match(articleSource, /className="article-pathway"/);
  assert.match(articleSource, /className="article-related-nav"/);
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
  assert.match(listItemRule, /margin-inline-start: var\(--guide-article-list-indent\);/);
  assert.match(listItemGapRule, /margin-top: var\(--guide-article-list-gap\);/);
  assert.match(cssSource, /\.article-paragraph\[data-terminal-colon="true"\] \+ \.article-list\s*\{[\s\S]*?var\(--guide-article-tight-gap\)/);
  assert.match(cssSource, /\.article-list-bulleted\s*\{[\s\S]*?list-style-type: disc;/);
});

test("localizes callout badges and keeps Help Center as a real link", () => {
  assert.match(articleSource, /const calloutBadgeLabel = isEnglish \? "Tip" : "Совет";/);
  assert.match(articleSource, /"Есть вопросы о платформе\?"/);
  assert.match(articleSource, /"Перейти в Help Center\."/);
  assert.doesNotMatch(articleSource, /Р/);
  assert.match(articleSource, /calloutBadgeLabel=\{calloutBadgeLabel\}/);
  assert.doesNotMatch(articleSource, /Pro-tip/);
  assert.match(articleSource, /<a\s+className="article-update-help-link"/);
  assert.match(articleSource, /href=\{helpHref\}/);
});
