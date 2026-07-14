import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const guideSource = await readFile(new URL("./guide.ts", import.meta.url), "utf8");
const adapterStart = guideSource.indexOf("const resistanceChapterSlug");
const adapterEnd = guideSource.indexOf("function headingToSection");

assert.ok(adapterStart >= 0, "Expected the guide adapter start marker");
assert.ok(adapterEnd > adapterStart, "Expected the guide adapter end marker");

const executableAdapterSource = guideSource
  .slice(adapterStart, adapterEnd)
  .replace(
    "function notionBlocksToContentBlocks(",
    "export function notionBlocksToContentBlocks(",
  );
const compiledAdapterSource = ts.transpileModule(executableAdapterSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const adapter = await import(
  `data:text/javascript;base64,${Buffer.from(compiledAdapterSource).toString("base64")}`
);

test("converts structured tables recursively inside toggles", () => {
  const blocks = adapter.notionBlocksToContentBlocks([
    {
      type: "toggle",
      sourceBlockIndex: 771,
      text: "  Maturity matrix  ",
      children: [
        {
          type: "table",
          table: {
            columns: ["", " Stage one ", "Stage two"],
            rows: [["State", "UX", "UX + methods"]],
            showColumnHeaders: true,
            rowHeaders: true,
          },
        },
      ],
    },
  ]);

  assert.deepEqual(blocks, [
    {
      type: "toggle",
      title: "Maturity matrix",
      blocks: [
        {
          type: "table",
          columns: ["", "Stage one", "Stage two"],
          rows: [["State", "UX", "UX + methods"]],
          showColumnHeaders: true,
          rowHeaders: true,
        },
      ],
    },
  ]);
});

test("uses raw table text only when structured data is malformed", () => {
  const blocks = adapter.notionBlocksToContentBlocks([
    {
      type: "table",
      sourceBlockIndex: 1,
      text: "Legacy valid table text",
      table: {
        columns: ["Name", "Value"],
        rows: [["Alpha", "1"]],
        showColumnHeaders: false,
      },
    },
    {
      type: "table",
      sourceBlockIndex: 2,
      text: "  Legacy malformed table text  ",
      table: {
        columns: ["Name", "Value"],
        rows: [["Missing value"]],
      },
    },
    {
      type: "table",
      sourceBlockIndex: 3,
      table: {
        columns: ["Name", "Value"],
        rows: [["Missing value"]],
      },
    },
  ]);

  assert.deepEqual(blocks, [
    {
      type: "table",
      columns: ["Name", "Value"],
      rows: [["Alpha", "1"]],
      showColumnHeaders: false,
    },
    {
      type: "rawTable",
      text: "Legacy malformed table text",
    },
  ]);
});
