import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssSource = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
const tokenSource = await readFile(new URL("../../app/figma-tokens.css", import.meta.url), "utf8");

function readRootVariables(source) {
  const root = source.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  return new Map(
    [...root.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

const variables = new Map([
  ...readRootVariables(tokenSource),
  ...readRootVariables(cssSource),
]);

function resolveColor(name, seen = new Set()) {
  assert(!seen.has(name), `Circular CSS variable reference: ${name}`);
  const value = variables.get(name);
  assert(value, `Missing CSS variable: ${name}`);

  const reference = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  return reference
    ? resolveColor(reference, new Set([...seen, name]))
    : value.toUpperCase();
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

test("light navigation and accent text meet WCAG AA contrast against white", () => {
  const white = resolveColor("--figma-color-white");
  const uses = ["--nav-link-fg", "--toc-link-active-fg", "--accent"];

  for (const use of uses) {
    const color = resolveColor(use);
    assert.ok(
      contrastRatio(color, white) >= 4.5,
      `${use} resolves to ${color} below 4.5:1 against ${white}`,
    );
  }
});
