import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSource(url) {
  return readFile(url, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  });
}

const dialogSource = await readSource(
  new URL("./GuideSearchDialog.tsx", import.meta.url),
);
const shellSource = await readSource(new URL("./GuideShell.tsx", import.meta.url));
const mobileSource = await readSource(new URL("./MobileChrome.tsx", import.meta.url));
const routeSource = await readSource(
  new URL("../../app/guide/GuidePageRoute.tsx", import.meta.url),
);
const copySource = await readSource(new URL("./guideCopy.ts", import.meta.url));
const cssSource = await readSource(new URL("../../app/globals.css", import.meta.url));
const russianIndexRouteSource = await readSource(
  new URL("../../app/guide/search-index/route.ts", import.meta.url),
);
const englishIndexRouteSource = await readSource(
  new URL("../../app/en/guide/search-index/route.ts", import.meta.url),
);

test("keeps article props small and passes a localized search-index URL", () => {
  assert.doesNotMatch(routeSource, /buildGuideSearchIndex/);
  assert.doesNotMatch(routeSource, /const chapters = getGuideChapters\(locale\)/);
  assert.match(routeSource, /const chapter = getGuideChapter\(slug, locale\)/);
  assert.match(routeSource, /const chapterBasePath = getGuideBasePath\(locale\)/);
  assert.match(routeSource, /const searchIndexHref = `\$\{chapterBasePath\}\/search-index`/);
  assert.match(routeSource, /<GuideShell[\s\S]*?locale=\{locale\}/);
  assert.match(routeSource, /<GuideShell[\s\S]*?searchIndexHref=\{searchIndexHref\}/);
  assert.match(shellSource, /searchIndexHref: string/);
  assert.match(shellSource, /<GuideSearchDialog[\s\S]*?indexHref=\{searchIndexHref\}/);
  assert.doesNotMatch(shellSource, /searchIndex: GuideSearchRecord\[\]/);
});

test("generates complete localized indexes from force-static JSON handlers", () => {
  for (const [source, locale, basePath] of [
    [russianIndexRouteSource, "ru", "/guide"],
    [englishIndexRouteSource, "en", "/en/guide"],
  ]) {
    assert.match(source, /export const dynamic = "force-static"/);
    assert.match(source, new RegExp(`const locale = "${locale}"`));
    assert.match(source, new RegExp(`const basePath = "${basePath}"`));
    assert.match(
      source,
      /buildGuideSearchIndex\(\s*getGuideChapters\(locale\),\s*\{\s*basePath,\s*locale,?\s*\}\s*\)/,
    );
    assert.match(source, /Response\.json\(/);
  }
});

test("fetches the index only while open, caches it, and aborts safely", () => {
  assert.match(dialogSource, /indexHref: string/);
  assert.match(
    dialogSource,
    /const \[index, setIndex\] = useState<GuideSearchRecord\[\] \| null>\(null\)/,
  );
  assert.match(dialogSource, /if \(!open \|\| index !== null\) \{/);
  assert.match(dialogSource, /const controller = new AbortController\(\)/);
  assert.match(dialogSource, /fetch\(indexHref, \{ signal: controller\.signal \}\)/);
  assert.match(dialogSource, /if \(!response\.ok\)/);
  assert.match(dialogSource, /Array\.isArray\(payload\)/);
  assert.match(dialogSource, /controller\.abort\(\)/);
  assert.doesNotMatch(shellSource, /\{searchOpen \? \(/);
});

test("shows localized loading and fetch-error states instead of no results", () => {
  assert.match(dialogSource, /copy\.search\.loading/);
  assert.match(dialogSource, /copy\.search\.error/);
  assert.match(copySource, /loading: "Загрузка поиска…"/);
  assert.match(copySource, /error: "Не удалось загрузить поиск"/);
  assert.match(copySource, /loading: "Loading search…"/);
  assert.match(copySource, /error: "Search could not be loaded"/);
  assert.match(
    dialogSource,
    /loadState === "error"[\s\S]*?copy\.search\.error[\s\S]*?copy\.search\.loading/,
  );
});

test("mounts one responsive search dialog outside the inert background", () => {
  assert.equal((dialogSource.match(/role="dialog"/g) ?? []).length, 1);
  assert.match(dialogSource, /className="search-dialog-backdrop"/);
  assert.match(dialogSource, /useModalDialog\(\{[\s\S]*?backgroundRef/);
  assert.match(shellSource, /<GuideSearchDialog[\s\S]*?backgroundRef=\{appContentRef\}/);
  assert.doesNotMatch(shellSource, /function GuideSearchPanel/);
  assert.doesNotMatch(mobileSource, /MobileSearchPanel/);
});

test("shows suggested chapters for an empty query and searches non-empty queries", () => {
  assert.match(dialogSource, /getSuggestedGuideChapters\(index \?\? \[\]\)/);
  assert.match(dialogSource, /searchGuideIndex\(index \?\? \[\], normalizedQuery\)/);
  assert.match(dialogSource, /copy\.search\.suggested/);
});

test("renders non-empty chapter, section, and text result groups", () => {
  assert.match(dialogSource, /results\.chapters/);
  assert.match(dialogSource, /copy\.search\.chapters/);
  assert.match(dialogSource, /results\.sections/);
  assert.match(dialogSource, /copy\.search\.sections/);
  assert.match(dialogSource, /results\.text/);
  assert.match(dialogSource, /copy\.search\.textMatches/);
  assert.match(dialogSource, /copy\.search\.noResults/);
});

test("highlights only a safe locale-normalized visible substring", () => {
  assert.match(dialogSource, /function HighlightedMatch/);
  assert.match(dialogSource, /toLocaleLowerCase\(locale\)/);
  assert.match(dialogSource, /normalizedText\.length !== text\.length/);
  assert.match(dialogSource, /<mark>/);
  assert.match(dialogSource, /text\.slice\(matchIndex, matchEnd\)/);
});

test("uses record hrefs and closes the dialog from result links", () => {
  assert.match(
    dialogSource,
    /<a[\s\S]*?className="search-dialog-result"[\s\S]*?href=\{item\.href\}[\s\S]*?onClick=\{handleClose\}/,
  );
  assert.match(dialogSource, /className="search-dialog-result-title"/);
  assert.match(dialogSource, /className="search-dialog-result-path"/);
  assert.match(dialogSource, /className="search-dialog-result-excerpt"/);
});

test("keeps results scrollable and text excerpts clamped to two lines", () => {
  assert.match(cssSource, /\.search-dialog-results\s*\{[\s\S]*?overflow-y: auto;/);
  assert.match(
    cssSource,
    /\.search-dialog-result-excerpt\s*\{[\s\S]*?-webkit-line-clamp: 2;/,
  );
  assert.match(cssSource, /@media \(max-width: 63\.999rem\)[\s\S]*?\.search-dialog-backdrop\s*\{[\s\S]*?inset: 0;/);
});

test("draws one visible focus ring on the search control wrapper", () => {
  const focusRule = cssSource.match(
    /\.search-dialog-control:focus-within\s*\{([\s\S]*?)\}/,
  )?.[1] ?? "";
  const inputFocusRule = cssSource.match(
    /\.search-dialog-input:focus,[\s\S]*?\.search-dialog-input:focus-visible\s*\{([\s\S]*?)\}/,
  )?.[1] ?? "";

  assert.match(focusRule, /outline: 2px solid var\(--focus\);/);
  assert.doesNotMatch(inputFocusRule, /var\(--focus\)/);
});

test("centralizes localized chrome copy for Russian and English", () => {
  assert.match(copySource, /export function getGuideCopy/);
  assert.match(copySource, /label: "Поиск по гайду"/);
  assert.match(copySource, /noResults: "Ничего не найдено"/);
  assert.match(copySource, /label: "Search the guide"/);
  assert.match(copySource, /noResults: "No results"/);
  assert.match(copySource, /loading: "Loading search…"/);
  assert.match(copySource, /error: "Search could not be loaded"/);
});
