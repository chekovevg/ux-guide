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

test("builds the localized search index on the server and passes it to GuideShell", () => {
  assert.match(routeSource, /import \{ buildGuideSearchIndex \} from "@\/content\/guideSearch"/);
  assert.match(routeSource, /const chapters = getGuideChapters\(locale\)/);
  assert.match(routeSource, /const chapter = chapters\.find\(\(item\) => item\.slug === slug\)/);
  assert.match(routeSource, /const chapterBasePath = getGuideBasePath\(locale\)/);
  assert.match(
    routeSource,
    /buildGuideSearchIndex\(\s*chapters,\s*\{\s*basePath: chapterBasePath,\s*locale,?\s*\}\s*\)/,
  );
  assert.match(routeSource, /<GuideShell[\s\S]*?locale=\{locale\}/);
  assert.match(routeSource, /<GuideShell[\s\S]*?searchIndex=\{searchIndex\}/);
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
  assert.match(dialogSource, /getSuggestedGuideChapters\(index\)/);
  assert.match(dialogSource, /searchGuideIndex\(index, normalizedQuery\)/);
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

test("centralizes localized chrome copy for Russian and English", () => {
  assert.match(copySource, /export function getGuideCopy/);
  assert.match(copySource, /label: "Поиск по гайду"/);
  assert.match(copySource, /noResults: "Ничего не найдено"/);
  assert.match(copySource, /label: "Search the guide"/);
  assert.match(copySource, /noResults: "No results"/);
});
