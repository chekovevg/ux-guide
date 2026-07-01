import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const assets = [
  {
    path: new URL("../../public/figma/logo-desktop.svg", import.meta.url),
    width: "157",
    height: "28",
  },
  {
    path: new URL("../../public/figma/logo-mobile.svg", import.meta.url),
    width: "128",
    height: "23",
  },
];

test("ships the Figma-sized Wynde guide logo assets", async () => {
  for (const asset of assets) {
    const svg = await readFile(asset.path, "utf8");

    assert.match(svg, new RegExp(`width="${asset.width}"`));
    assert.match(svg, new RegExp(`height="${asset.height}"`));
  }
});
