import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readTextIfExists(path) {
  try {
    return await readFile(new URL(path, import.meta.url), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

test("keeps the Russian guide route static and locale-free", async () => {
  const source = await readTextIfExists("./guide/[slug]/page.tsx");

  assert.ok(source, "Expected app/guide/[slug]/page.tsx to exist");
  assert.match(source, /generateStaticParams/);
  assert.doesNotMatch(source, /searchParams/);
});

test("ships a static English guide route", async () => {
  const source = await readTextIfExists("./en/guide/[slug]/page.tsx");

  assert.ok(source, "Expected app/en/guide/[slug]/page.tsx to exist");
  assert.match(source, /generateStaticParams/);
  assert.match(source, /locale="en"/);
  assert.doesNotMatch(source, /searchParams/);
});
