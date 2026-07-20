import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const helpers = await import("./verify-guide-ui-helpers.mjs").catch(() => ({}));
const runtimeSource = await readFile(
  new URL("./verify-guide-ui.mjs", import.meta.url),
  "utf8",
);

test("accepts only the exact chapter root as a chapter-level text destination", () => {
  assert.equal(
    typeof helpers.isExactChapterRootDestination,
    "function",
    "Expected an exact chapter-root destination helper",
  );
  assert.equal(
    helpers.isExactChapterRootDestination(
      "https://guide.test/en/guide/correct-chapter",
      "/en/guide/correct-chapter",
    ),
    true,
  );
  assert.equal(
    helpers.isExactChapterRootDestination(
      "https://guide.test/en/guide/correct-chapter#bogus",
      "/en/guide/correct-chapter",
    ),
    false,
  );
});

test("classifies runtime availability from the executable path only", () => {
  assert.equal(
    typeof helpers.classifyBrowserExecutable,
    "function",
    "Expected an executable availability helper",
  );
  assert.equal(
    helpers.classifyBrowserExecutable("/browser/runtime", () => true),
    "available",
  );
  assert.equal(
    helpers.classifyBrowserExecutable("/browser/runtime", () => false),
    "unavailable",
  );
});

test("does not launch a browser whose executable is unavailable", async () => {
  assert.equal(
    typeof helpers.launchBrowserIfAvailable,
    "function",
    "Expected an availability-aware launch helper",
  );
  let launchCalled = false;
  const result = await helpers.launchBrowserIfAvailable(
    {
      executablePath: () => "/missing/runtime",
      launch: async () => {
        launchCalled = true;
      },
    },
    () => false,
  );

  assert.equal(result, null);
  assert.equal(launchCalled, false);
});

test("propagates every launch error when the executable exists", async () => {
  assert.equal(
    typeof helpers.launchBrowserIfAvailable,
    "function",
    "Expected an availability-aware launch helper",
  );
  const launchError = new Error("sandbox startup failed");

  await assert.rejects(
    helpers.launchBrowserIfAvailable(
      {
        executablePath: () => "/installed/runtime",
        launch: async () => {
          throw launchError;
        },
      },
      () => true,
    ),
    (error) => error === launchError,
  );
});

test("restores the prior stored and rendered theme after dark reload proof", () => {
  assert.match(runtimeSource, /const previousThemeState = await page\.evaluate/);
  assert.match(
    runtimeSource,
    /finally\s*\{[\s\S]*?page\.off\("console", onConsole\);[\s\S]*?restoreThemeState\(page, previousThemeState\);[\s\S]*?\}/,
  );
});

test("establishes light theme before every non-theme screenshot group", () => {
  const captureVisualStates = runtimeSource.match(
    /async function captureVisualStates\(page\)\s*\{[\s\S]*?\n\}/,
  )?.[0] ?? "";

  assert.match(
    captureVisualStates,
    /establishTheme\(page, "light"\);\s*await captureSearchStates\(page\);/,
  );
  assert.match(
    captureVisualStates,
    /establishTheme\(page, "light"\);\s*await captureChecklistStates\(page\);/,
  );
  assert.match(
    captureVisualStates,
    /establishTheme\(page, "light"\);\s*await captureNavigationStates\(page\);/,
  );
  assert.match(
    captureVisualStates,
    /establishTheme\(page, "light"\);\s*await captureTableStates\(page\);/,
  );
});

test("asserts the computed search-control focus indicator wherever search opens", () => {
  assert.match(runtimeSource, /async function assertSearchControlFocusIndicator/);
  assert.match(runtimeSource, /getComputedStyle\(control\)/);
  assert.match(runtimeSource, /outlineStyle/);
  assert.match(runtimeSource, /outlineWidth/);
  assert.match(runtimeSource, /Number\.parseFloat\(indicator\.outlineWidth\) >= 2/);
  assert.match(
    runtimeSource,
    /await waitForFocused\(page, searchbox, "search dialog"\);\s*await assertSearchControlFocusIndicator\(searchbox/,
  );
});

test("proves keyboard checklist reset restores focus and clears state", () => {
  assert.match(runtimeSource, /keyboardReset\.focus\(\)/);
  assert.match(runtimeSource, /page\.keyboard\.press\("Enter"\)/);
  assert.match(runtimeSource, /keyboardReset\.waitFor\(\{ state: "detached" \}\)/);
  assert.match(runtimeSource, /waitForFocused\([\s\S]*?reloadedCheckboxes\.first\(\)/);
  assert.match(runtimeSource, /keyboard reset left checked items/);
  assert.match(runtimeSource, /keyboard reset left the persisted storage key/);
});

test("proves breakpoint menu close returns focus to active desktop navigation", () => {
  assert.match(runtimeSource, /data-guide-menu-return-focus/);
  assert.match(runtimeSource, /await setViewport\(page, 1440\)/);
  assert.match(runtimeSource, /breakpoint close left the background inert/);
  assert.match(runtimeSource, /desktop menu focus fallback/);
});

test("proves breakpoint menu close returns focus to the collapsed sidebar rail", () => {
  assert.match(runtimeSource, /getByRole\("button", \{ name: "Collapse sidebar" \}\)/);
  assert.match(
    runtimeSource,
    /\.guide-sidebar-collapsed-rail[\s\S]*aria-label="Expand sidebar"[\s\S]*data-guide-menu-return-focus/,
  );
  assert.match(runtimeSource, /collapsed breakpoint close left the background inert/);
  assert.match(runtimeSource, /collapsed sidebar menu focus fallback/);
});

test("enforces RU and EN intro HTML byte budgets without off-page content", () => {
  assert.match(runtimeSource, /const introSlug = "intro"/);
  assert.match(runtimeSource, /async function verifyProductionRouteBudgets/);
  assert.match(runtimeSource, /Buffer\.byteLength\(html, "utf8"\)/);
  assert.match(runtimeSource, /htmlBytes < 500_000/);
  assert.match(runtimeSource, /!html\.includes\("Sun Microsystems"\)/);
  assert.match(runtimeSource, /ROUTE_BUDGET/);
});

test("does not classify launch failures by matching error messages", () => {
  assert.doesNotMatch(runtimeSource, /isMissingRuntime|playwright install/i);
});
