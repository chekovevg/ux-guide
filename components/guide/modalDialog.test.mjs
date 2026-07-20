import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function readSource(url) {
  return readFile(url, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  });
}

const hookSource = await readSource(new URL("./useModalDialog.ts", import.meta.url));
const focusRestoreSource = await readSource(new URL("./modalFocus.ts", import.meta.url));
const mobileSource = await readSource(new URL("./MobileChrome.tsx", import.meta.url));
const searchSource = await readSource(new URL("./GuideSearchDialog.tsx", import.meta.url));
const headerSource = await readSource(new URL("./GuideHeader.tsx", import.meta.url));
const navigationSource = await readSource(new URL("./GuideNavigation.tsx", import.meta.url));
const shellSource = await readSource(new URL("./GuideShell.tsx", import.meta.url));
const cssSource = await readSource(new URL("../../app/globals.css", import.meta.url));
const compiledFocusRestoreSource = ts.transpileModule(focusRestoreSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const focusRestore = await import(
  `data:text/javascript;base64,${Buffer.from(compiledFocusRestoreSource).toString("base64")}`
);
const getFocusRestoreTarget =
  focusRestore.getFocusRestoreTarget ?? (() => null);

function createFocusTarget({
  connected = true,
  hidden = false,
  visible = true,
} = {}) {
  return {
    hidden,
    isConnected: connected,
    getClientRects: () => (visible ? [{}] : []),
  };
}

test("keeps the connected visible original return-focus target", () => {
  const original = createFocusTarget();
  const equivalent = createFocusTarget();

  assert.equal(getFocusRestoreTarget(original, [equivalent]), original);
});

test("falls back past disconnected and hidden equivalents when the original is not visible", () => {
  const zeroRectOriginal = createFocusTarget({ visible: false });
  const disconnected = createFocusTarget({ connected: false });
  const hidden = createFocusTarget({ hidden: true });
  const zeroRect = createFocusTarget({ visible: false });
  const visibleEquivalent = createFocusTarget();

  assert.equal(
    getFocusRestoreTarget(zeroRectOriginal, [
      disconnected,
      hidden,
      zeroRect,
      visibleEquivalent,
    ]),
    visibleEquivalent,
  );
  assert.equal(
    getFocusRestoreTarget(createFocusTarget({ connected: false }), [hidden]),
    null,
  );
});

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
    /export function MobileSiteMenu[\s\S]*$/,
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

test("focuses the search input and delegates modal lifecycle to the shared hook", () => {
  assert.match(searchSource, /const dialogRef = useRef<HTMLElement>\(null\)/);
  assert.match(searchSource, /const inputRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(searchSource, /useModalDialog\(\{[\s\S]*?onClose: handleClose/);
  assert.match(searchSource, /initialFocusRef: inputRef/);
  assert.match(searchSource, /backgroundRef/);
  assert.match(searchSource, /ref=\{dialogRef\}/);
  assert.match(searchSource, /ref=\{inputRef\}/);
});

test("marks every search trigger and opts only search into equivalent focus fallback", () => {
  assert.equal((headerSource.match(/data-guide-search-trigger/g) ?? []).length, 1);
  assert.equal((navigationSource.match(/data-guide-search-trigger/g) ?? []).length, 2);
  assert.match(searchSource, /returnFocusSelector: "\[data-guide-search-trigger\]"/);
  assert.match(hookSource, /returnFocusSelector\?: string/);
  assert.doesNotMatch(mobileSource, /returnFocusSelector/);
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
  const guideSearch = shellSource.indexOf("<GuideSearchDialog", wrapperStart);

  assert.notEqual(wrapperStart, -1);
  assert.ok(header > wrapperStart && header < wrapperEnd);
  assert.ok(main > wrapperStart && main < wrapperEnd);
  assert.ok(contents > wrapperStart && contents < wrapperEnd);
  assert.match(
    shellSource.slice(wrapperStart, wrapperEnd),
    /<MobileContentsSection[\s\S]*?<\/div>\s*$/,
  );
  assert.ok(menu > wrapperEnd);
  assert.ok(guideSearch > wrapperEnd);
  assert.match(shellSource, /<GuideSearchDialog[\s\S]*?backgroundRef=\{appContentRef\}/);
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

test("closes mobile layers before the search shortcut opens search", () => {
  const shortcutCondition = shellSource.indexOf("(event.ctrlKey || event.metaKey)");
  const shortcutEffectStart = shellSource.lastIndexOf("useEffect(() => {", shortcutCondition);
  const shortcutEffectEnd = shellSource.indexOf("}, []);", shortcutCondition);
  const shortcutEffect = shellSource.slice(shortcutEffectStart, shortcutEffectEnd);
  const closeMenu = shortcutEffect.indexOf("setMenuOpen(false)");
  const closeContents = shortcutEffect.indexOf("setContentsOpen(false)");
  const openSearch = shortcutEffect.indexOf("setSearchOpen(true)");

  assert.notEqual(shortcutCondition, -1);
  assert.ok(closeMenu > 0 && closeMenu < openSearch);
  assert.ok(closeContents > 0 && closeContents < openSearch);
});

test("closes mobile layers when the viewport crosses the desktop breakpoint", () => {
  const mediaQuery = 'window.matchMedia("(min-width: 64rem)")';
  const queryStart = shellSource.indexOf(mediaQuery);
  const effectStart = shellSource.lastIndexOf("useEffect(() => {", queryStart);
  const effectEnd = shellSource.indexOf("}, []);", queryStart);
  const breakpointEffect = shellSource.slice(effectStart, effectEnd);

  assert.notEqual(queryStart, -1);
  assert.match(breakpointEffect, /if \(event\.matches\)/);
  assert.match(breakpointEffect, /setMenuOpen\(false\)/);
  assert.match(breakpointEffect, /setContentsOpen\(false\)/);
  assert.match(
    breakpointEffect,
    /desktopQuery\.addEventListener\("change", onDesktopChange\)/,
  );
  assert.match(
    breakpointEffect,
    /desktopQuery\.removeEventListener\("change", onDesktopChange\)/,
  );
});
