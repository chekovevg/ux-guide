import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const articleSource = await readFile(
  new URL("./ArticleContent.tsx", import.meta.url),
  "utf8",
);
const cssSource = await readFile(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);

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
  assert.match(articleSource, /import \{[^}]*\bCheck\b[^}]*\bLink as LucideLink\b[^}]*\} from "lucide-react"/s);
  assert.match(articleSource, /<LucideLink aria-hidden="true"/);
  assert.match(articleSource, /<Check className="size-3" strokeWidth=\{3\}/);
  assert.doesNotMatch(articleSource, /\/figma\/icon-link-heading\.svg/);
  assert.doesNotMatch(articleSource, /\/figma\/icon-link-callout\.svg/);
  assert.doesNotMatch(articleSource, /\/figma\/icon-checkbox-checked\.svg/);
});

test("maps callout, checklist, quote, and table blocks to Figma article component classes", () => {
  assert.match(articleSource, /className=\{`article-callout article-callout-\$\{block\.variant\}`\}/);
  assert.match(articleSource, /className="article-callout-anchor/);
  assert.match(articleSource, /const textParagraphs = block\.text/);
  assert.match(articleSource, /\.split\(\/\\n\{2,\}\/\)/);
  assert.match(articleSource, /className="article-checklist/);
  assert.match(articleSource, /checklistTitle=\{block\.type === "todoList" \? chapter\.title : undefined\}/);
  assert.match(articleSource, /checklistAccentItemIndex=\{block\.type === "todoList" \? 4 : undefined\}/);
  assert.match(articleSource, /className="article-checklist-text"/);
  assert.match(articleSource, /data-accent=\{index === accentItemIndex \? "true" : undefined\}/);
  assert.match(articleSource, /className="article-quote/);
  assert.match(articleSource, /className="article-quote-avatar/);
  assert.match(articleSource, /className="article-quote-author-name/);
  assert.match(articleSource, /className="article-quote-author-title/);
  assert.match(articleSource, /className="article-table/);
  assert.match(cssSource, /\.article-callout/);
  assert.match(cssSource, /\.article-checklist/);
  assert.match(cssSource, /\.article-checklist-title\s*\{[\s\S]*?letter-spacing: var\(--figma-typography-letter-space-h3\);/);
  assert.match(cssSource, /\.article-checklist-icon\s*\{[\s\S]*?border-radius: var\(--figma-indent-space-4\);/);
  assert.match(cssSource, /\.article-checklist-icon\s*\{[\s\S]*?background: var\(--accent\);/);
  assert.match(cssSource, /\.article-checklist-text\s*\{[\s\S]*?padding-top: var\(--figma-indent-space-4\);/);
  assert.match(cssSource, /\.article-checklist-text\[data-accent="true"\]\s*\{[\s\S]*?color: var\(--accent\);/);
  assert.match(cssSource, /\.article-quote/);
  assert.match(cssSource, /\.article-table/);
});

test("renders Notion bullet groups as paragraph stacks without list indentation", () => {
  assert.match(articleSource, /case "bulletedList":/);
  assert.match(articleSource, /className="article-paragraph-list"/);
  assert.doesNotMatch(articleSource, /<ul className="article-list type-body"/);
  assert.match(cssSource, /\.article-paragraph-list\s*\{/);
  assert.match(cssSource, /\.article-paragraph\[data-terminal-colon="true"\] \+ \.article-paragraph-list/);
});
