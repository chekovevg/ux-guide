import fs from "node:fs";
import path from "node:path";

const tokenDir = path.join(process.cwd(), "figma-tokens");
const files = ["default", "Desktop", "Mobile"];

function walkTokens(value, prefix = [], out = []) {
  if (
    value &&
    typeof value === "object" &&
    (Object.hasOwn(value, "$value") || Object.hasOwn(value, "$type"))
  ) {
    out.push({
      path: prefix.join("."),
      type: value.$type,
      value: value.$value,
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

for (const name of files) {
  const filePath = path.join(tokenDir, `${name}.tokens.json`);
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tokens = walkTokens(json);
  const byType = tokens.reduce((acc, token) => {
    acc[token.type] = (acc[token.type] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n${name}`);
  console.log(byType);
  for (const token of tokens.slice(0, 32)) {
    const raw =
      typeof token.value === "object"
        ? JSON.stringify(token.value).slice(0, 100)
        : token.value;
    console.log(`${token.path} | ${token.type} | ${raw}`);
  }

  console.log("\npaths");
  for (const token of tokens) {
    console.log(`${token.path} | ${token.type}`);
  }
}
