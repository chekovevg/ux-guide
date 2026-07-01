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

test("renders Figma article heading anchors for h2 and h3 hover states", () => {
  assert.match(articleSource, /className="article-heading/);
  assert.match(articleSource, /className="article-heading-anchor/);
  assert.match(articleSource, /href=\{`#\$\{section\.id\}`\}/);
  assert.match(cssSource, /\.article-heading:hover\s+\.article-heading-anchor/);
  assert.match(cssSource, /\.article-heading-anchor/);
});

test("uses exported Figma SVG assets for article link and checkbox icons", async () => {
  const headingIcon = await readFile(
    new URL("../../public/figma/icon-link-heading.svg", import.meta.url),
    "utf8",
  );
  const calloutIcon = await readFile(
    new URL("../../public/figma/icon-link-callout.svg", import.meta.url),
    "utf8",
  );
  const checkboxIcon = await readFile(
    new URL("../../public/figma/icon-checkbox-checked.svg", import.meta.url),
    "utf8",
  );

  assert.match(headingIcon, /<svg/i);
  assert.match(calloutIcon, /<svg/i);
  assert.match(checkboxIcon, /<svg/i);
  assert.match(articleSource, /\/figma\/icon-link-heading\.svg/);
  assert.match(articleSource, /\/figma\/icon-link-callout\.svg/);
  assert.match(articleSource, /\/figma\/icon-checkbox-checked\.svg/);
  assert.doesNotMatch(articleSource, /import \{[^}]*\bCheck\b[^}]*\} from "lucide-react"/);
  assert.doesNotMatch(articleSource, /import \{[^}]*\bInfo\b[^}]*\} from "lucide-react"/);
});

test("maps callout, checklist, quote, and table blocks to Figma article component classes", () => {
  assert.match(articleSource, /className=\{`article-callout article-callout-\$\{block\.variant\}`\}/);
  assert.match(articleSource, /className="article-callout-anchor/);
  assert.match(articleSource, /className="article-checklist/);
  assert.match(articleSource, /className="article-quote/);
  assert.match(articleSource, /className="article-table/);
  assert.match(cssSource, /\.article-callout/);
  assert.match(cssSource, /\.article-checklist/);
  assert.match(cssSource, /\.article-quote/);
  assert.match(cssSource, /\.article-table/);
});
