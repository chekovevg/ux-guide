import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerSource = await readFile(new URL("./GuideHeader.tsx", import.meta.url), "utf8");
const mobileSource = await readFile(new URL("./MobileChrome.tsx", import.meta.url), "utf8");
const navigationSource = await readFile(new URL("./GuideNavigation.tsx", import.meta.url), "utf8");
const pageTocSource = await readFile(new URL("./PageToc.tsx", import.meta.url), "utf8");
const shellSource = await readFile(new URL("./GuideShell.tsx", import.meta.url), "utf8");
const uiSource = await readFile(new URL("./GuideUi.tsx", import.meta.url), "utf8");
const cssSource = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
const designSystemSource = await readFile(
  new URL("../../app/design-system.css", import.meta.url),
  "utf8",
);

test("centralizes guide UI primitives and variants", () => {
  assert.match(uiSource, /export function GuideButton/);
  assert.match(uiSource, /export function GuideIconButton/);
  assert.match(uiSource, /export function GuideSearchTrigger/);
  assert.match(uiSource, /export function GuideSurface/);
  assert.match(uiSource, /export function GuideCard/);
  assert.match(uiSource, /export function GuideKbd/);
  assert.match(uiSource, /export function GuideBadge/);
  assert.match(cssSource, /\.guide-button,\s*[\s\S]*?\.guide-icon-button,\s*[\s\S]*?\.guide-search-trigger/);
  assert.match(cssSource, /\.guide-surface\s*\{[\s\S]*?background: var\(--guide-card-bg\);/);
  assert.match(cssSource, /\.guide-card\s*\{[\s\S]*?border: var\(--ds-border-width\) solid var\(--guide-card-border\);/);
  assert.match(cssSource, /\.guide-kbd\s*\{[\s\S]*?font-family: var\(--ds-font-mono\);/);
});

test("renders language and theme controls in the sidebar chrome", () => {
  assert.match(navigationSource, /languageLinks/);
  assert.match(navigationSource, /className="language-menu"/);
  assert.doesNotMatch(navigationSource, /\bLanguages\b/);
  assert.match(navigationSource, /className="theme-toggle"/);
  assert.match(shellSource, /languageLinks/);
  assert.match(cssSource, /\.language-menu/);
  assert.match(cssSource, /\.theme-toggle/);
});

test("uses Primer-like ActionList density and structural selected state in sidebar", () => {
  assert.doesNotMatch(navigationSource, /guide-nav-group-title/);
  assert.match(navigationSource, /navigationGroups\.flatMap/);
  assert.match(navigationSource, /aria-current=\{item\.active \? "page" : undefined\}/);
  assert.match(cssSource, /\.guide-nav-list\s*\{[\s\S]*?gap: 2px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?min-height: 34px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?border-left: 2px solid transparent;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?padding: 6px 10px 6px 8px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?font-size: 13px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?font-weight: 500;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?letter-spacing: 0;/);
  assert.match(cssSource, /\.guide-nav-link\[data-active="true"\]\s*\{[\s\S]*?background: var\(--guide-nav-item-selected-bg\);/);
  assert.match(cssSource, /\.guide-nav-link\[data-active="true"\]\s*\{[\s\S]*?border-left-color: var\(--guide-nav-item-selected-border\);/);
});

test("renders page toc active state with a structural rule", () => {
  assert.match(shellSource, /"На этой странице"/);
  assert.match(shellSource, /"Глава"/);
  assert.doesNotMatch(shellSource, /Р/);
  assert.match(pageTocSource, /aria-current=\{active \? "location" : undefined\}/);
  assert.match(pageTocSource, /data-active=\{active \? "true" : undefined\}/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?border-left: var\(--ds-border-width\) solid var\(--guide-toc-rule\);/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?letter-spacing: 0;/);
  assert.match(cssSource, /\.page-toc-link\[data-active="true"\]\s*\{[\s\S]*?border-left-width: var\(--guide-toc-active-stroke\);/);
  assert.match(cssSource, /\.page-toc-link\[data-active="true"\]\s*\{[\s\S]*?color: var\(--guide-toc-active-fg\);/);
  assert.match(designSystemSource, /--guide-toc-active-rule: var\(--ds-accent-emphasis\);/);
  assert.match(designSystemSource, /--guide-toc-active-stroke: var\(--ds-primitive-stroke-active\);/);
});

test("opens desktop search as a command-palette pattern", () => {
  assert.match(navigationSource, /<GuideKbd className="sidebar-search-kbd">Ctrl K<\/GuideKbd>/);
  assert.match(shellSource, /placeholder="Search"/);
  assert.match(shellSource, /className="search-dialog-escape"/);
  assert.match(shellSource, /event\.key === "Escape"/);
  assert.match(shellSource, /aria-modal="true"/);
  assert.match(shellSource, /role="dialog"/);
  assert.match(cssSource, /\.search-dialog\s*\{[\s\S]*?width: min\(680px, calc\(100vw - 16px\)\);/);
  assert.match(cssSource, /\.search-dialog\s*\{[\s\S]*?background: var\(--ds-bg-overlay\);/);
  assert.match(cssSource, /\.search-dialog-result:hover\s*\{[\s\S]*?background: var\(--guide-search-result-hover-bg\);/);
  assert.doesNotMatch(shellSource, /search-dialog-close/);
});

test("keeps mobile controls accessible and structurally stateful", () => {
  assert.match(headerSource, /aria-expanded=\{searchOpen\}/);
  assert.match(headerSource, /aria-expanded=\{menuOpen\}/);
  assert.match(headerSource, /aria-expanded=\{contentsOpen\}/);
  assert.match(mobileSource, /aria-modal="true"/);
  assert.match(mobileSource, /role="dialog"/);
  assert.match(mobileSource, /aria-current=\{item\.active \? "page" : undefined\}/);
  assert.match(cssSource, /\.mobile-guide-link\s*\{[\s\S]*?border-left: 2px solid transparent;/);
  assert.match(cssSource, /\.mobile-guide-link\[data-active="true"\]\s*\{[\s\S]*?border-left-color: var\(--guide-nav-item-selected-border\);/);
  assert.match(cssSource, /\.mobile-contents-link:hover,\s*[\s\S]*?\.mobile-contents-link\[data-active="true"\]\s*\{[\s\S]*?border-left-color: var\(--ds-accent-emphasis\);/);
});

test("keeps desktop header free of the removed global search control", () => {
  assert.doesNotMatch(headerSource, /guide-header-search-area/);
  assert.doesNotMatch(headerSource, /header-search/);
  assert.match(shellSource, /onSearch=\{\(\) => setSearchOpen\(true\)\}/);
});
