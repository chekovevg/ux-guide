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

test("does not classify launch failures by matching error messages", () => {
  assert.doesNotMatch(runtimeSource, /isMissingRuntime|playwright install/i);
});
