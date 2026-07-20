import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const headerSource = await readFile(new URL("./GuideHeader.tsx", import.meta.url), "utf8");
const navigationSource = await readFile(new URL("./GuideNavigation.tsx", import.meta.url), "utf8");
const mobileSource = await readFile(new URL("./MobileChrome.tsx", import.meta.url), "utf8");
const searchDialogSource = await readFile(new URL("./GuideSearchDialog.tsx", import.meta.url), "utf8").catch(
  (error) => (error.code === "ENOENT" ? "" : Promise.reject(error)),
);
const shellSource = await readFile(new URL("./GuideShell.tsx", import.meta.url), "utf8");
const cssSource = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

test("renders language and theme controls in the sidebar chrome", () => {
  assert.match(navigationSource, /languageLinks/);
  assert.match(navigationSource, /className="language-menu"/);
  assert.doesNotMatch(navigationSource, /\bLanguages\b/);
  assert.match(navigationSource, /className="theme-toggle"/);
  assert.match(shellSource, /languageLinks/);
  assert.match(cssSource, /\.language-menu/);
  assert.match(cssSource, /\.theme-toggle/);
});

test("keeps sidebar links compact and chapter cards in docs reference structure", () => {
  assert.doesNotMatch(navigationSource, /guide-nav-group-title/);
  assert.doesNotMatch(navigationSource, /<h2 className="guide-nav-group-title"/);
  assert.match(navigationSource, /navigationGroups\.flatMap/);
  assert.doesNotMatch(cssSource, /\.guide-nav-group-title/);
  assert.match(cssSource, /\.guide-nav-list\s*\{[\s\S]*?gap: 0;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?min-height: 40px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?padding: 10px 12px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?font-size: 14px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?font-weight: 400;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?line-height: 20px;/);
  assert.match(cssSource, /\.guide-nav-link\s*\{[\s\S]*?letter-spacing: -0\.1px;/);
  assert.match(cssSource, /\.guide-nav-link-label\s*\{[\s\S]*?-webkit-line-clamp: 2;/);
  assert.match(cssSource, /\.guide-nav-link\[data-active="true"\]\s*\{[\s\S]*?border-radius: var\(--figma-indent-space-8\);/);
  assert.match(shellSource, /className="article-chapter-title-row"/);
  assert.match(shellSource, /className="article-chapter-description"/);
  assert.match(cssSource, /\.article-chapter-description\s*\{[\s\S]*?text-overflow: ellipsis;/);
  assert.match(cssSource, /\.article-chapter-icon\s*\{[\s\S]*?width: 16px;/);
  assert.doesNotMatch(shellSource, /article-chapter-kicker/);
});

test("matches the flat Figma mobile guide navigation without desktop-only group labels", () => {
  const mobileContentsSource = mobileSource.match(
    /export function MobileContentsSection[\s\S]*?export function MobileSiteMenu/,
  )?.[0] ?? "";
  const mobileSiteMenuSource = mobileSource.match(
    /export function MobileSiteMenu[\s\S]*$/,
  )?.[0] ?? "";

  assert.doesNotMatch(mobileContentsSource, /getMobileContentsItems/);
  assert.match(
    mobileSiteMenuSource,
    /getMobileContentsItems\(\s*navigationGroups\.flatMap\(\(group\) => group\.items\),\s*basePath,?\s*\)/s,
  );
  assert.match(mobileSiteMenuSource, /\{navigationItems\.map\(\(item\) => \(/);
  assert.doesNotMatch(mobileSiteMenuSource, /mobile-guide-group-title/);
  assert.doesNotMatch(mobileSiteMenuSource, /navigationGroups\.map\(\(group\) =>/);
  assert.match(cssSource, /\.mobile-site-menu-content\s*\{[\s\S]*?padding: 16px 18px;/);
  assert.match(cssSource, /\.mobile-guide-list\s*\{[\s\S]*?gap: 4px;/);
  assert.match(cssSource, /\.mobile-guide-link\s*\{[\s\S]*?border-radius: 10px;/);
  assert.match(cssSource, /\.mobile-guide-link\s*\{[\s\S]*?padding: 10px 12px;/);
  assert.match(cssSource, /\.mobile-guide-link\s*\{[\s\S]*?font-weight: 400;/);
  assert.match(cssSource, /\.mobile-guide-link\s*\{[\s\S]*?letter-spacing: -0\.1px;/);
  assert.match(cssSource, /\.mobile-guide-link\[data-active="true"\]\s*\{[\s\S]*?border-radius: 8px;/);
});

test("renders page toc links with Figma page nav button states", () => {
  assert.match(cssSource, /\.page-toc\s*\{[\s\S]*?width: min\(226px, 100%\);/);
  assert.match(cssSource, /\.page-toc-title\s*\{[\s\S]*?font-weight: 400;/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?width: min\(226px, 100%\);/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?padding: 12px 0 12px 16px;/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?font-size: 14px;/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?font-weight: 400;/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?line-height: 20px;/);
  assert.match(cssSource, /\.page-toc-link\s*\{[\s\S]*?letter-spacing: -0\.1px;/);
  assert.match(cssSource, /\.page-toc-link\[data-nested="true"\]\s*\{[\s\S]*?padding-left: 28px;/);
  assert.match(cssSource, /\.page-toc-link\[data-active="true"\]\s*\{[\s\S]*?border-left-width: var\(--toc-active-stroke\);/);
  assert.match(cssSource, /\.page-toc-link\[data-active="true"\]\s*\{[\s\S]*?font-weight: 400;/);
  assert.match(cssSource, /\.page-toc-compact\s*\{[\s\S]*?width: 100%;/);
  assert.match(cssSource, /--toc-active-stroke: 1\.5px;/);
});

test("renders collapsed sidebar as a floating docs-style control pill", () => {
  assert.match(navigationSource, /className="guide-sidebar-collapsed-rail"/);
  assert.match(navigationSource, /<PanelLeft aria-hidden="true" className="size-\[18px\]" \/>/);
  assert.match(navigationSource, /<Search aria-hidden="true" className="size-\[18px\]" \/>/);
  assert.match(cssSource, /\.guide-sidebar-collapsed-rail\s*\{[\s\S]*?position: fixed;/);
  assert.match(cssSource, /\.guide-sidebar-collapsed-rail\s*\{[\s\S]*?width: 66px;/);
  assert.match(cssSource, /\.guide-sidebar-collapsed-rail\s*\{[\s\S]*?height: 36px;/);
  assert.match(cssSource, /\.guide-sidebar-shell\[data-collapsed="true"\]\s*\{[\s\S]*?width: 0;/);
  assert.match(cssSource, /\.guide-grid\[data-sidebar-collapsed="true"\] \.guide-article-area\s*\{[\s\S]*?margin-left: 0;/);
});

test("opens desktop search as a compact reference-style command input", () => {
  assert.match(searchDialogSource, /placeholder=\{copy\.search\.placeholder\}/);
  assert.match(searchDialogSource, /className="search-dialog-escape"/);
  assert.match(searchDialogSource, /getSuggestedGuideChapters/);
  assert.doesNotMatch(shellSource, /function GuideSearchPanel/);
  assert.doesNotMatch(mobileSource, /MobileSearchPanel/);
  assert.match(cssSource, /\.search-dialog-backdrop\s*\{[\s\S]*?backdrop-filter: blur\(4px\);/);
  assert.match(cssSource, /\.search-dialog-backdrop\s*\{[\s\S]*?padding-top: max\(16px, calc\(50vh - 250px\)\);/);
  assert.match(cssSource, /\.search-dialog-control\s*\{[\s\S]*?height: 54px;/);
  assert.match(cssSource, /\.search-dialog-input\s*\{[\s\S]*?font-size: 18px;/);
});

test("keeps desktop header free of the removed global search control", () => {
  assert.doesNotMatch(headerSource, /guide-header-search-area/);
  assert.doesNotMatch(headerSource, /header-search/);
  assert.match(shellSource, /onSearch=\{\(\) => setSearchOpen\(true\)\}/);
});
