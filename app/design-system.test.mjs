import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const designSystemSource = await readFile(
  new URL("./design-system.css", import.meta.url),
  "utf8",
);
const globalsSource = await readFile(new URL("./globals.css", import.meta.url), "utf8");
const guideSource = await readFile(new URL("../content/guide.ts", import.meta.url), "utf8");
const mobileContentsSource = await readFile(
  new URL("../components/guide/mobileContents.mjs", import.meta.url),
  "utf8",
);

test("loads raw Figma tokens before the Wynde design-system contract", () => {
  assert.match(globalsSource, /@import "\.\/figma-tokens\.css";\s*@import "\.\/design-system\.css";/);
  assert.match(designSystemSource, /Wynde design-system contract/);
  assert.match(designSystemSource, /Layers: primitive -> semantic -> guide\/component/);
});

test("defines primitive, semantic, and guide component token layers", () => {
  assert.match(designSystemSource, /--ds-primitive-color-gray-50:/);
  assert.match(designSystemSource, /--ds-bg-canvas: var\(--ds-primitive-color-white\);/);
  assert.match(designSystemSource, /--ds-fg-accent: var\(--ds-primitive-color-blue-500\);/);
  assert.match(designSystemSource, /--ds-border-default: var\(--ds-primitive-color-gray-300\);/);
  assert.match(designSystemSource, /--guide-nav-item-selected-bg: var\(--ds-bg-accent\);/);
  assert.match(designSystemSource, /--guide-search-result-hover-bg: var\(--ds-bg-accent\);/);
  assert.match(designSystemSource, /--guide-toc-active-stroke: var\(--ds-primitive-stroke-active\);/);
  assert.match(designSystemSource, /--guide-callout-warning-border: var\(--ds-fg-attention\);/);
  assert.match(designSystemSource, /--guide-table-cell-padding: var\(--ds-primitive-space-12\) var\(--ds-primitive-space-16\);/);
});

test("keeps raw values in primitive declarations only", () => {
  const rawValuePattern = /#[0-9a-fA-F]{3,8}|rgba\(|\b\d+px\b|\binvert\(/;
  const rawValueLines = designSystemSource
    .split("\n")
    .filter((line) => rawValuePattern.test(line));

  assert.ok(rawValueLines.length > 0);

  for (const line of rawValueLines) {
    assert.match(line.trim(), /^--ds-primitive-/);
  }

  const figmaIndex = designSystemSource.indexOf("--figma-");
  const semanticIndex = designSystemSource.indexOf("/* Semantic tokens. */");

  assert.ok(figmaIndex >= 0);
  assert.ok(figmaIndex < semanticIndex);
});

test("keeps globals on the stable ds and guide token API", () => {
  assert.doesNotMatch(globalsSource, /--figma-/);
  assert.doesNotMatch(globalsSource, /var\(--ds-(surface|text|component|space|callout|control|stroke|radius-standard)/);
  assert.doesNotMatch(globalsSource, /--type-/);
  assert.match(globalsSource, /var\(--ds-bg-canvas\)/);
  assert.match(globalsSource, /var\(--guide-nav-item-selected-bg\)/);
  assert.match(globalsSource, /var\(--guide-callout-warning-border\)/);
  assert.match(globalsSource, /var\(--guide-table-border\)/);
});

test("keeps design-system decisions out of guide content routes", () => {
  assert.doesNotMatch(guideSource, /designSystemFoundation/);
  assert.doesNotMatch(guideSource, /design-system-foundation/);
  assert.doesNotMatch(mobileContentsSource, /design-system-foundation/);
});
