import fs from "node:fs";
import path from "node:path";

const tokenDir = path.join(process.cwd(), "figma-tokens");
const outputPath = path.join(process.cwd(), "app", "figma-tokens.css");

function readTokens(mode) {
  return JSON.parse(
    fs.readFileSync(path.join(tokenDir, `${mode}.tokens.json`), "utf8"),
  );
}

function walkTokens(value, prefix = [], out = []) {
  if (
    value &&
    typeof value === "object" &&
    (Object.hasOwn(value, "$value") || Object.hasOwn(value, "$type"))
  ) {
    out.push({
      name: toCssName(prefix),
      path: prefix.join("."),
      type: value.$type,
      value: normalizeValue(value.$value, value.$type),
    });
    return out;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key !== "$extensions") {
        walkTokens(child, [...prefix, key], out);
      }
    }
  }

  return out;
}

function toCssName(parts) {
  return `--figma-${parts
    .join("-")
    .toLowerCase()
    .replace(/[,]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function normalizeValue(value, type) {
  if (typeof value === "string" && value.match(/^\{.+\}$/)) {
    return `var(${toCssName(value.slice(1, -1).split("."))})`;
  }

  if (type === "color") {
    if (value.hex) {
      return value.alpha !== undefined && value.alpha < 1
        ? hexWithAlpha(value.hex, value.alpha)
        : value.hex.toUpperCase();
    }
  }

  if (type === "number" && typeof value === "number") {
    return `${trimNumber(value)}px`;
  }

  if (typeof value === "string") {
    return value.includes(" ") ? `"${value}"` : value;
  }

  return String(value);
}

function hexWithAlpha(hex, alpha) {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${channel}`.toUpperCase();
}

function trimNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

function renderBlock(tokens, selector) {
  const rows = tokens
    .filter((token) => token.value !== "undefined")
    .map((token) => `  ${token.name}: ${token.value};`);

  return `${selector} {\n${rows.join("\n")}\n}`;
}

const desktop = walkTokens(readTokens("Desktop"));
const mobile = walkTokens(readTokens("Mobile"));

const output = [
  "/* Generated from figma-tokens/*.tokens.json. Do not edit manually. */",
  renderBlock(desktop, ":root"),
  "@media (max-width: 63.999rem) {",
  renderBlock(mobile, "  :root")
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n"),
  "}",
  "",
].join("\n\n");

fs.writeFileSync(outputPath, output);
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
