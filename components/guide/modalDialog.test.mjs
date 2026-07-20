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

const hookSource = await readSource(new URL("./useModalDialog.ts", import.meta.url));
const mobileSource = await readSource(new URL("./MobileChrome.tsx", import.meta.url));
const shellSource = await readSource(new URL("./GuideShell.tsx", import.meta.url));
const cssSource = await readSource(new URL("../../app/globals.css", import.meta.url));

test("stores the active trigger and restores focus when it remains connected", () => {
  assert.match(hookSource, /document\.activeElement instanceof HTMLElement/);
  assert.match(hookSource, /previouslyFocused\?\.isConnected/);
  assert.match(hookSource, /previouslyFocused\.focus\(\)/);
});

test("focuses the preferred target or the first visible enabled control", () => {
  assert.match(hookSource, /initialFocusRef\?\.current \?\? focusableElements\[0\]/);
  assert.match(hookSource, /focusTarget\?\.focus\(\)/);
  assert.match(
    hookSource,
    /a\[href\][\s\S]*button:not\(\[disabled\]\)[\s\S]*input:not\(\[disabled\]\)[\s\S]*select:not\(\[disabled\]\)[\s\S]*textarea:not\(\[disabled\]\)[\s\S]*\[tabindex\]:not\(\[tabindex="-1"\]\)/,
  );
  assert.match(hookSource, /getComputedStyle\(element\)/);
  assert.match(hookSource, /element\.getClientRects\(\)\.length > 0/);
});

test("contains Tab and Shift+Tab while closing on Escape", () => {
  assert.match(hookSource, /event\.key === "Escape"/);
  assert.match(hookSource, /event\.key !== "Tab"/);
  assert.match(hookSource, /event\.shiftKey/);
  assert.match(hookSource, /lastFocusable\.focus\(\)/);
  assert.match(hookSource, /firstFocusable\.focus\(\)/);
  assert.match(hookSource, /document\.addEventListener\("keydown", onKeyDown\)/);
  assert.match(hookSource, /document\.removeEventListener\("keydown", onKeyDown\)/);
});

test("applies inert to the background and restores its previous state", () => {
  assert.match(hookSource, /background\.hasAttribute\("inert"\)/);
  assert.match(hookSource, /background\.setAttribute\("inert", ""\)/);
  assert.match(hookSource, /background\.removeAttribute\("inert"\)/);
  assert.match(hookSource, /cancelAnimationFrame\(focusFrame\)/);
});

test("renders an initially focused visible close control inside MobileSiteMenu", () => {
  const mobileSiteMenuSource = mobileSource.match(
    /export function MobileSiteMenu[\s\S]*?(?=function getSearchResults)/,
  )?.[0] ?? "";
  const dialogSource = mobileSiteMenuSource.match(
    /<section[\s\S]*?role="dialog"[\s\S]*?<\/section>/,
  )?.[0] ?? "";

  assert.match(mobileSiteMenuSource, /const dialogRef = useRef<HTMLElement>\(null\)/);
  assert.match(mobileSiteMenuSource, /const closeButtonRef = useRef<HTMLButtonElement>\(null\)/);
  assert.match(mobileSiteMenuSource, /useModalDialog\(\{[\s\S]*initialFocusRef: closeButtonRef/);
  assert.match(dialogSource, /ref=\{dialogRef\}/);
  assert.match(dialogSource, /className="mobile-site-menu-header"/);
  assert.match(dialogSource, /<p className="mobile-site-menu-title">\{menuTitle\}<\/p>/);
  assert.match(dialogSource, /<button[\s\S]*?ref=\{closeButtonRef\}[\s\S]*?className="mobile-site-menu-close"/);
  assert.match(dialogSource, /<span className="sr-only">\{closeLabel\}<\/span>/);
});

test("keeps chapter navigation below the header and the footer at the bottom", () => {
  const menuContentBlocks = cssSource.match(/\.mobile-site-menu-content\s*\{[^}]*}/g) ?? [];
  const menuFooterBlocks = cssSource.match(/\.mobile-site-footer\s*\{[^}]*}/g) ?? [];

  assert.match(menuContentBlocks.at(-1) ?? "", /justify-content: flex-start;/);
  assert.match(menuFooterBlocks.at(-1) ?? "", /margin-top: auto;/);
});

test("places guide UI behind one background wrapper with modal siblings", () => {
  assert.match(shellSource, /const appContentRef = useRef<HTMLDivElement>\(null\)/);

  const wrapperStart = shellSource.indexOf(
    '<div ref={appContentRef} className="guide-app-content">',
  );
  const wrapperEnd = shellSource.indexOf("{searchOpen ? (", wrapperStart);
  const header = shellSource.indexOf("<GuideHeader", wrapperStart);
  const main = shellSource.indexOf("<main", wrapperStart);
  const contents = shellSource.indexOf("<MobileContentsSection", wrapperStart);
  const menu = shellSource.indexOf("<MobileSiteMenu", wrapperStart);
  const mobileSearch = shellSource.indexOf("<MobileSearchPanel", wrapperStart);

  assert.notEqual(wrapperStart, -1);
  assert.ok(header > wrapperStart && header < wrapperEnd);
  assert.ok(main > wrapperStart && main < wrapperEnd);
  assert.ok(contents > wrapperStart && contents < wrapperEnd);
  assert.match(
    shellSource.slice(wrapperStart, wrapperEnd),
    /<MobileContentsSection[\s\S]*?<\/div>\s*$/,
  );
  assert.ok(menu > wrapperEnd);
  assert.ok(mobileSearch > wrapperEnd);
  assert.match(shellSource, /<MobileSiteMenu[\s\S]*?backgroundRef=\{appContentRef\}/);
});

test("keeps only the non-modal contents disclosure in shell Escape handling", () => {
  const escapeEffect = shellSource.match(
    /useEffect\(\(\) => \{[\s\S]*?event\.key === "Escape"[\s\S]*?\}, \[[^\]]*\]\);/,
  )?.[0] ?? "";

  assert.match(escapeEffect, /setContentsOpen\(false\)/);
  assert.doesNotMatch(escapeEffect, /setMenuOpen\(false\)/);
  assert.doesNotMatch(escapeEffect, /setSearchOpen\(false\)/);
});
