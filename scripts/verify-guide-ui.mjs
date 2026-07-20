import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, firefox, webkit } from "playwright";
import {
  isExactChapterRootDestination,
  launchBrowserIfAvailable,
} from "./verify-guide-ui-helpers.mjs";

const baseUrl = (process.env.GUIDE_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
const screenshotRoot = resolve(".codex-screenshots", "task-8");
const visualWidths = [320, 390, 1024, 1440];
const introSlug = "intro";
const resistanceSlug =
  "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat";
const checklistSlug = "chek-list-o-chem-esche-podumat-pered-zapuskom";
const methodsSlug = "metody-kak-vybrat-i-zapustit";
const audienceSlug =
  "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo";
const hydrationPattern = /hydration|did not match|server rendered/i;
const screenshotPaths = [];

await mkdir(screenshotRoot, { recursive: true });

function guidePath(locale) {
  return locale === "ru" ? "/guide" : "/en/guide";
}

function guideUrl(locale, slug) {
  return `${baseUrl}${guidePath(locale)}/${slug}`;
}

async function verifyProductionRouteBudgets() {
  for (const locale of ["ru", "en"]) {
    const url = guideUrl(locale, introSlug);
    const response = await fetch(url);
    assert.ok(response.ok, `Expected ${url} to load, got ${response.status}`);
    const html = await response.text();
    const htmlBytes = Buffer.byteLength(html, "utf8");

    assert.ok(
      htmlBytes < 500_000,
      `${locale}: intro HTML is ${htmlBytes} bytes`,
    );
    assert.ok(
      !html.includes("Sun Microsystems"),
      `${locale}: intro HTML embeds off-page search content`,
    );
    console.log(`ROUTE_BUDGET ${locale.toUpperCase()}: ${htmlBytes} bytes`);
  }
}

async function openGuidePage(page, url) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.ok(response, `Expected a navigation response for ${url}`);
  assert.ok(response.ok(), `Expected ${url} to load, got ${response.status()}`);
  await page.locator("article h1").waitFor({ state: "visible" });
}

async function setViewport(page, width) {
  await page.setViewportSize({ width, height: 900 });
}

async function assertNoPageOverflow(page, context) {
  const dimensions = await page.evaluate(() => ({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.equal(
    dimensions.scrollWidth,
    dimensions.innerWidth,
    `${context}: page-level horizontal overflow (${dimensions.scrollWidth}px > ${dimensions.innerWidth}px)`,
  );
}

async function waitForFocused(page, locator, context) {
  await page.waitForFunction(
    (element) => document.activeElement === element,
    await locator.elementHandle(),
  );
  assert.ok(
    await locator.evaluate((element) => document.activeElement === element),
    `${context}: expected element to be focused`,
  );
}

async function assertSearchControlFocusIndicator(searchbox, context) {
  const indicator = await searchbox.evaluate((input) => {
    const control = input.closest(".search-dialog-control");

    if (!(control instanceof HTMLElement)) {
      throw new Error("Search input has no control wrapper");
    }

    const style = getComputedStyle(control);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  assert.notEqual(
    indicator.outlineStyle,
    "none",
    `${context}: search control focus indicator is not visible`,
  );
  assert.ok(
    Number.parseFloat(indicator.outlineWidth) >= 2,
    `${context}: search control focus indicator is ${indicator.outlineWidth}`,
  );
}

async function visibleSearchTrigger(page) {
  const sidebarTrigger = page.locator(".sidebar-search");

  if (await sidebarTrigger.isVisible()) {
    return sidebarTrigger;
  }

  const mobileTrigger = page.locator(
    ".guide-header [data-guide-search-trigger]",
  );
  assert.ok(await mobileTrigger.isVisible(), "Expected a visible search trigger");
  return mobileTrigger;
}

async function openSearch(page) {
  const trigger = await visibleSearchTrigger(page);
  await trigger.click();
  const dialog = page.locator('.search-dialog-backdrop[role="dialog"]');
  const searchbox = dialog.getByRole("searchbox");
  await dialog.waitFor({ state: "visible" });
  await waitForFocused(page, searchbox, "search dialog");
  await assertSearchControlFocusIndicator(searchbox, "search dialog");
  await dialog
    .locator('section[aria-labelledby="search-dialog-group-suggested"]')
    .waitFor({ state: "visible" });
  return { dialog, searchbox, trigger };
}

async function assertDialogFocusContainment(page, dialog) {
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  await dialog.evaluate((element, selector) => {
    const focusable = [...element.querySelectorAll(selector)].filter(
      (candidate) => candidate.getClientRects().length > 0,
    );
    assertFocusable(focusable.at(-1));

    function assertFocusable(candidate) {
      if (!(candidate instanceof HTMLElement)) {
        throw new Error("Dialog has no focusable boundary");
      }
      candidate.focus();
    }
  }, focusableSelector);
  await page.keyboard.press("Tab");
  assert.ok(
    await dialog.evaluate((element) => element.contains(document.activeElement)),
    "Tab past the final control escaped the dialog",
  );

  await dialog.evaluate((element, selector) => {
    const focusable = [...element.querySelectorAll(selector)].filter(
      (candidate) => candidate.getClientRects().length > 0,
    );
    const first = focusable[0];
    if (!(first instanceof HTMLElement)) {
      throw new Error("Dialog has no focusable boundary");
    }
    first.focus();
  }, focusableSelector);
  await page.keyboard.press("Shift+Tab");
  assert.ok(
    await dialog.evaluate((element) => element.contains(document.activeElement)),
    "Shift+Tab before the first control escaped the dialog",
  );
}

async function verifySearchAndMobileChrome(page, locale) {
  const chapterPath = `${guidePath(locale)}/${resistanceSlug}`;
  await setViewport(page, 1440);
  await openGuidePage(page, `${baseUrl}${chapterPath}`);

  let { dialog, searchbox } = await openSearch(page);
  await searchbox.fill("Sun Microsystems");
  const chapterGroup = dialog.locator(
    'section[aria-labelledby="search-dialog-group-chapters"]',
  );
  const textGroup = dialog.locator(
    'section[aria-labelledby="search-dialog-group-text"]',
  );
  await chapterGroup.waitFor({ state: "visible" });
  await textGroup.waitFor({ state: "visible" });

  const chapterHrefs = await chapterGroup.locator("a").evaluateAll((links) =>
    links.map((link) => new URL(link.href).pathname),
  );
  const textDestinations = await textGroup
    .locator("a")
    .evaluateAll((links) => links.map((link) => link.href));
  assert.ok(
    chapterHrefs.includes(chapterPath),
    `${locale}: full-text query did not link its chapter`,
  );
  assert.ok(
    textDestinations.some((href) =>
      isExactChapterRootDestination(href, chapterPath),
    ),
    `${locale}: chapter-level full-text result did not link the exact chapter root`,
  );

  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });

  // Resistance is the published no-section chapter; use the checklist's first
  // real H2 to prove the separate heading-to-anchor search contract.
  const headingChapterPath = `${guidePath(locale)}/${checklistSlug}`;
  await openGuidePage(page, `${baseUrl}${headingChapterPath}`);
  ({ dialog, searchbox } = await openSearch(page));
  const firstHeading = page.locator("article h2").first();
  const heading = await firstHeading.evaluate((element) => ({
    id: element.id,
    text: element.textContent?.trim() ?? "",
  }));
  assert.ok(heading.id, `${locale}: first article H2 has no anchor id`);
  assert.ok(heading.text, `${locale}: first article H2 has no text`);
  await searchbox.fill(heading.text);

  const sectionGroup = dialog.locator(
    'section[aria-labelledby="search-dialog-group-sections"]',
  );
  await sectionGroup.waitFor({ state: "visible" });
  const sectionDestinations = await sectionGroup.locator("a").evaluateAll((links) =>
    links.map((link) => {
      const url = new URL(link.href);
      return { pathname: url.pathname, hash: url.hash };
    }),
  );
  assert.ok(
    sectionDestinations.some(
      ({ pathname, hash }) =>
        pathname === headingChapterPath && hash === `#${heading.id}`,
    ),
    `${locale}: complete H2 search did not return its anchored section`,
  );

  await assertDialogFocusContainment(page, dialog);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  const sidebarTrigger = page.locator(".sidebar-search");
  await waitForFocused(page, sidebarTrigger, `${locale} desktop focus restore`);

  await setViewport(page, 390);
  await openGuidePage(page, `${baseUrl}${chapterPath}`);
  const staticHeader = page.locator(
    '.guide-header-nav-panel[data-static="true"]',
  );
  await staticHeader.waitFor({ state: "visible" });
  assert.equal(
    await staticHeader.locator("svg").count(),
    0,
    `${locale}: no-section header contains a chevron`,
  );
  assert.equal(
    await page.locator(".mobile-contents-section").count(),
    0,
    `${locale}: no-section chapter rendered an empty contents panel`,
  );
  const mobileSearch = await openSearch(page);
  await assertDialogFocusContainment(page, mobileSearch.dialog);
  await page.keyboard.press("Escape");
  await mobileSearch.dialog.waitFor({ state: "detached" });
  await waitForFocused(
    page,
    page.locator(".guide-header [data-guide-search-trigger]"),
    `${locale} mobile focus restore`,
  );

  const menuTrigger = page.locator(
    ".guide-header-actions button:not([data-guide-search-trigger])",
  );
  await menuTrigger.click();
  const menuDialog = page.locator('.mobile-site-menu[role="dialog"]');
  const closeButton = menuDialog.locator(".mobile-site-menu-close");
  await menuDialog.waitFor({ state: "visible" });
  await waitForFocused(page, closeButton, `${locale} mobile menu`);
  assert.ok(
    await page.locator(".guide-app-content").evaluate((element) =>
      element.hasAttribute("inert"),
    ),
    `${locale}: mobile menu background is not inert`,
  );
  await page.keyboard.press("Escape");
  await menuDialog.waitFor({ state: "detached" });
  await waitForFocused(page, menuTrigger, `${locale} mobile menu focus restore`);

  await menuTrigger.click();
  await menuDialog.waitFor({ state: "visible" });
  await setViewport(page, 1440);
  await menuDialog.waitFor({ state: "detached" });
  assert.equal(
    await page.locator(".guide-app-content").evaluate((element) =>
      element.hasAttribute("inert"),
    ),
    false,
    `${locale}: breakpoint close left the background inert`,
  );
  const desktopMenuFocusTarget = page.locator(
    '.guide-nav-link[data-active="true"][data-guide-menu-return-focus]',
  );
  await desktopMenuFocusTarget.waitFor({ state: "visible" });
  await waitForFocused(
    page,
    desktopMenuFocusTarget,
    `${locale} desktop menu focus fallback`,
  );
  await assertNoPageOverflow(page, `${locale} mobile chrome`);
}

async function clearChecklistStorage(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("wynde-guide-checklist:v1:")) {
        localStorage.removeItem(key);
      }
    }
  });
}

async function verifyChecklist(page, locale) {
  await setViewport(page, 390);
  await openGuidePage(page, guideUrl(locale, checklistSlug));
  await clearChecklistStorage(page);
  await page.reload({ waitUntil: "networkidle" });

  const contentsHeader = page.locator("button.guide-header-nav-panel");
  await contentsHeader.waitFor({ state: "visible" });
  assert.equal(
    await contentsHeader.locator("svg").count(),
    1,
    `${locale}: section-bearing checklist has no contents chevron`,
  );
  assert.equal(
    await page.locator('.guide-header-nav-panel[data-static="true"]').count(),
    0,
    `${locale}: section-bearing checklist rendered static chrome`,
  );

  const checklist = page.locator(".article-checklist").first();
  const checkboxes = checklist.locator('input[type="checkbox"]');
  const total = await checkboxes.count();
  assert.ok(total > 0, `${locale}: expected a native checklist`);
  await checklist.locator(".article-checklist-item").first().click();

  const expectedProgress = locale === "ru" ? `1 из ${total}` : `1 of ${total}`;
  await page.waitForFunction(
    ({ selector, text }) =>
      document.querySelector(selector)?.textContent?.includes(text),
    { selector: ".article-checklist-status", text: expectedProgress },
  );
  assert.ok(
    (await checklist.locator(".article-checklist-status").textContent())?.includes(
      expectedProgress,
    ),
    `${locale}: checklist progress did not become ${expectedProgress}`,
  );

  const storageKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) =>
      key.startsWith("wynde-guide-checklist:v1:"),
    ),
  );
  assert.equal(storageKeys.length, 1, `${locale}: expected one checklist key`);
  const [storageKey] = storageKeys;

  await page.reload({ waitUntil: "networkidle" });
  const reloadedChecklist = page.locator(".article-checklist").first();
  const reloadedCheckboxes = reloadedChecklist.locator(
    'input[type="checkbox"]',
  );
  await page.waitForFunction(
    (selector) => document.querySelector(selector)?.checked === true,
    '.article-checklist input[type="checkbox"]',
  );
  assert.ok(
    await reloadedCheckboxes.first().isChecked(),
    `${locale}: checklist state did not survive reload`,
  );

  await reloadedChecklist.locator(".article-checklist-reset").click();
  assert.equal(
    await reloadedCheckboxes.evaluateAll((inputs) =>
      inputs.filter((input) => input.checked).length,
    ),
    0,
    `${locale}: reset left checked items`,
  );
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
    null,
    `${locale}: reset left the persisted storage key`,
  );

  await reloadedChecklist.locator(".article-checklist-item").first().click();
  const keyboardReset = reloadedChecklist.locator(".article-checklist-reset");
  await keyboardReset.waitFor({ state: "visible" });
  await keyboardReset.focus();
  await waitForFocused(
    page,
    keyboardReset,
    `${locale} keyboard checklist reset`,
  );
  await page.keyboard.press("Enter");
  await keyboardReset.waitFor({ state: "detached" });
  await waitForFocused(
    page,
    reloadedCheckboxes.first(),
    `${locale} first checkbox after reset`,
  );
  assert.equal(
    await reloadedCheckboxes.evaluateAll((inputs) =>
      inputs.filter((input) => input.checked).length,
    ),
    0,
    `${locale}: keyboard reset left checked items`,
  );
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
    null,
    `${locale}: keyboard reset left the persisted storage key`,
  );

  const headings = await page.evaluate(() => ({
    h1: [...document.querySelectorAll("h1")].map((node) =>
      node.textContent?.trim(),
    ),
    h3: [...document.querySelectorAll("h3")].map((node) =>
      node.textContent?.trim(),
    ),
  }));
  assert.equal(headings.h1.length, 1, `${locale}: expected exactly one H1`);
  assert.ok(
    !headings.h3.includes(headings.h1[0]),
    `${locale}: checklist duplicates the H1 as an H3`,
  );
  await assertNoPageOverflow(page, `${locale} checklist`);
}

async function tableWithColumnCount(page, columnCount) {
  const tables = page.locator(".article-table");

  for (let index = 0; index < (await tables.count()); index += 1) {
    const table = tables.nth(index);
    const count = await table.locator("thead tr").first().locator(":scope > *").count();
    if (count === columnCount) {
      return table;
    }
  }

  throw new Error(`Expected an article table with ${columnCount} columns`);
}

async function verifyTables(page) {
  for (const width of [320, 390]) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", methodsSlug));
    const scrollableTable = await tableWithColumnCount(page, 3);
    const scrollableMetrics = await scrollableTable.evaluate((element) => {
      const cell = element.querySelector("th, td");
      return {
        ariaLabel: element.getAttribute("aria-label")?.trim() ?? "",
        clientWidth: element.clientWidth,
        dataScrollable: element.dataset.scrollable,
        fontSize: cell ? Number.parseFloat(getComputedStyle(cell).fontSize) : 0,
        role: element.getAttribute("role"),
        scrollWidth: element.scrollWidth,
        tabIndex: element.tabIndex,
      };
    });
    assert.equal(scrollableMetrics.dataScrollable, "true");
    assert.equal(scrollableMetrics.role, "region");
    assert.ok(scrollableMetrics.ariaLabel, `${width}px: table region is unnamed`);
    assert.equal(scrollableMetrics.tabIndex, 0);
    await scrollableTable.focus();
    assert.ok(
      await scrollableTable.evaluate(
        (element) => document.activeElement === element,
      ),
      `${width}px: table is not focusable`,
    );
    assert.ok(
      scrollableMetrics.scrollWidth > scrollableMetrics.clientWidth,
      `${width}px: 3-column table does not scroll locally`,
    );
    assert.ok(
      scrollableMetrics.fontSize >= 12,
      `${width}px: table text is ${scrollableMetrics.fontSize}px`,
    );
    await assertNoPageOverflow(page, `${width}px 3-column table`);

    await openGuidePage(page, guideUrl("en", audienceSlug));
    const compactTable = await tableWithColumnCount(page, 2);
    const compactMetrics = await compactTable.evaluate((element) => ({
      clientWidth: element.clientWidth,
      hasTabIndex: element.hasAttribute("tabindex"),
      role: element.getAttribute("role"),
      scrollWidth: element.scrollWidth,
      tabIndex: element.tabIndex,
    }));
    assert.notEqual(compactMetrics.role, "region");
    assert.equal(compactMetrics.hasTabIndex, false);
    assert.ok(compactMetrics.tabIndex < 0);
    assert.ok(
      compactMetrics.scrollWidth <= compactMetrics.clientWidth,
      `${width}px: 2-column table scrolls locally`,
    );
    await assertNoPageOverflow(page, `${width}px 2-column table`);
  }

  for (const width of [1024, 1440]) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", methodsSlug));
    const table = await tableWithColumnCount(page, 3);
    const metrics = await table.evaluate((element) => ({
      clientWidth: element.clientWidth,
      cueDisplay: element.nextElementSibling
        ? getComputedStyle(element.nextElementSibling).display
        : "missing",
      scrollWidth: element.scrollWidth,
    }));
    assert.equal(
      metrics.scrollWidth,
      metrics.clientWidth,
      `${width}px: non-wide table unexpectedly overflows`,
    );
    assert.equal(
      metrics.cueDisplay,
      "none",
      `${width}px: scroll cue obscures a table that already fits`,
    );
  }
}

async function restoreThemeState(page, previousThemeState) {
  await page.evaluate(({ renderedTheme, storedTheme }) => {
    if (storedTheme === null) {
      localStorage.removeItem("wynde-guide-theme");
    } else {
      localStorage.setItem("wynde-guide-theme", storedTheme);
    }

    if (renderedTheme === null) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", renderedTheme);
    }
  }, previousThemeState);
}

async function establishTheme(page, theme) {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("wynde-guide-theme", nextTheme);
  }, theme);
  await page.reload({ waitUntil: "networkidle" });
  await page
    .locator(`html[data-theme="${theme}"]`)
    .waitFor({ state: "attached" });
}

async function verifyDarkReload(page, locale) {
  await setViewport(page, 1440);
  await openGuidePage(page, guideUrl(locale, resistanceSlug));
  const previousThemeState = await page.evaluate(() => ({
    renderedTheme: document.documentElement.getAttribute("data-theme"),
    storedTheme: localStorage.getItem("wynde-guide-theme"),
  }));
  const hydrationErrors = [];
  const onConsole = (message) => {
    if (message.type() === "error" && hydrationPattern.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  };
  page.on("console", onConsole);

  try {
    await page.evaluate(() => localStorage.setItem("wynde-guide-theme", "dark"));
    await page.reload({ waitUntil: "networkidle" });
    await page.locator('html[data-theme="dark"]').waitFor({ state: "attached" });
  } finally {
    page.off("console", onConsole);
    await restoreThemeState(page, previousThemeState);
  }

  assert.deepEqual(
    hydrationErrors,
    [],
    `${locale}: hydration console errors after dark reload`,
  );
}

async function capture(page, name) {
  await assertNoPageOverflow(page, name);
  const path = resolve(screenshotRoot, `${name}.png`);
  await page.screenshot({ path });
  screenshotPaths.push(path);
}

async function scrollBelowChrome(page, locator) {
  await locator.evaluate((element) => {
    const top = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({ top: Math.max(0, top - 180), behavior: "instant" });
  });
}

async function captureSearchStates(page) {
  for (const locale of ["ru", "en"]) {
    for (const width of visualWidths) {
      await setViewport(page, width);
      await openGuidePage(page, guideUrl(locale, resistanceSlug));
      const { dialog, searchbox } = await openSearch(page);
      await capture(page, `${locale}-${width}-search-empty`);

      await searchbox.fill("Sun Microsystems");
      await dialog
        .locator('section[aria-labelledby="search-dialog-group-text"]')
        .waitFor({ state: "visible" });
      await capture(page, `${locale}-${width}-search-populated`);

      await searchbox.fill("no-match-wynde-browser-proof-93f4");
      await dialog.locator(".search-dialog-empty").waitFor({ state: "visible" });
      await capture(page, `${locale}-${width}-search-no-result`);
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "detached" });
    }
  }
}

async function captureChecklistStates(page) {
  for (const width of visualWidths) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", checklistSlug));
    await clearChecklistStorage(page);
    await page.reload({ waitUntil: "networkidle" });
    const checklist = page.locator(".article-checklist").first();
    await scrollBelowChrome(page, checklist);
    await capture(page, `en-${width}-checklist-untouched`);

    const checkboxes = checklist.locator('input[type="checkbox"]');
    const items = checklist.locator(".article-checklist-item");
    await items.first().click();
    await page.waitForTimeout(200);
    await capture(page, `en-${width}-checklist-in-progress`);
    for (let index = 1; index < (await checkboxes.count()); index += 1) {
      await items.nth(index).click();
    }
    await checklist
      .locator(".article-checklist-complete")
      .waitFor({ state: "visible" });
    await page.waitForTimeout(200);
    await capture(page, `en-${width}-checklist-complete`);

    const reset = checklist.locator(".article-checklist-reset");
    await reset.focus();
    await page.keyboard.press("Enter");
    await reset.waitFor({ state: "detached" });
    await waitForFocused(
      page,
      checkboxes.first(),
      `${width}px checklist reset screenshot`,
    );
    await page.waitForTimeout(200);
    await capture(page, `en-${width}-checklist-reset-focus`);
  }
}

async function captureNavigationStates(page) {
  for (const width of [320, 390]) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", resistanceSlug));
    await page
      .locator(".guide-header-actions button:not([data-guide-search-trigger])")
      .click();
    await page.locator(".mobile-site-menu").waitFor({ state: "visible" });
    await capture(page, `en-${width}-mobile-menu-open`);
  }
}

async function captureTableStates(page) {
  for (const width of visualWidths) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", audienceSlug));
    await scrollBelowChrome(page, await tableWithColumnCount(page, 2));
    await capture(page, `en-${width}-table-2-column`);

    await openGuidePage(page, guideUrl("en", methodsSlug));
    await scrollBelowChrome(page, await tableWithColumnCount(page, 3));
    await capture(page, `en-${width}-table-3-column`);
  }
}

async function captureThemeStates(page) {
  for (const width of visualWidths) {
    await setViewport(page, width);
    await openGuidePage(page, guideUrl("en", resistanceSlug));
    await establishTheme(page, "light");
    await capture(page, `en-${width}-theme-light`);

    await establishTheme(page, "dark");
    await capture(page, `en-${width}-theme-dark`);
  }
}

async function captureVisualStates(page) {
  await establishTheme(page, "light");
  await captureSearchStates(page);
  await establishTheme(page, "light");
  await captureChecklistStates(page);
  await establishTheme(page, "light");
  await captureNavigationStates(page);
  await establishTheme(page, "light");
  await captureTableStates(page);
  await captureThemeStates(page);
}

async function verifyBrowser(name, browserType) {
  const browser = await launchBrowserIfAvailable(browserType, existsSync);

  if (browser === null) {
    if (name === "chromium") {
      throw new Error("chromium runtime unavailable");
    }

    console.log(`SKIP ${name}: runtime unavailable`);
    return { name, status: "skip" };
  }

  try {
    const context = await browser.newContext({
      locale: "en-US",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    for (const locale of ["ru", "en"]) {
      await verifySearchAndMobileChrome(page, locale);
      await verifyChecklist(page, locale);
      await verifyDarkReload(page, locale);
      console.log(`PASS ${name}: ${locale.toUpperCase()}`);
    }

    await verifyTables(page);
    if (name === "chromium") {
      await captureVisualStates(page);
    }
    await context.close();
    console.log(`PASS ${name}`);
    return { name, status: "pass" };
  } finally {
    await browser.close();
  }
}

const failures = [];

try {
  await verifyProductionRouteBudgets();
} catch (error) {
  failures.push({ name: "route-budgets", error });
  console.error("FAIL route budgets");
  console.error(error);
}

for (const [name, browserType] of [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
]) {
  try {
    await verifyBrowser(name, browserType);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (screenshotPaths.length > 0) {
  console.log(
    `SCREENSHOTS ${screenshotPaths.length}: ${screenshotRoot}`,
  );
}

if (failures.length > 0) {
  process.exitCode = 1;
}
