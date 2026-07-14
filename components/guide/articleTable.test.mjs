import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const source = await readFile(new URL("./ArticleBlocks.tsx", import.meta.url), "utf8");
const tableStart = source.indexOf("export function ArticleTable");

assert.ok(tableStart >= 0, "Expected the ArticleTable component");

const compiledSource = ts.transpileModule(source.slice(tableStart), {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const tableModule = { exports: {} };
const require = createRequire(import.meta.url);

new Function("exports", "require", "module", compiledSource)(
  tableModule.exports,
  require,
  tableModule,
);

const { ArticleTable } = tableModule.exports;

test("renders every table as a named keyboard-focusable region", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "methods-table",
      block: {
        type: "table",
        columns: ["Method", "How it works", "Helps validate"],
        rows: [["First click", "Pick a target", "Information scent"]],
      },
    }),
  );

  assert.match(markup, /id="methods-table"/);
  assert.match(markup, /role="region"/);
  assert.match(markup, /aria-label="Method, How it works, Helps validate"/);
  assert.match(markup, /tabindex="0"/);
  assert.doesNotMatch(markup, /data-wide=/);
  assert.equal((markup.match(/scope="col"/g) ?? []).length, 3);
});

test("renders row headers and hidden column headers with table semantics", () => {
  const matrixMarkup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "matrix-table",
      block: {
        type: "table",
        columns: ["", "Stage one", "Stage two", "Stage three", "Stage four"],
        rows: [["State", "UX", "UX + methods", "UX team", "UX culture"]],
        showColumnHeaders: true,
        rowHeaders: true,
      },
    }),
  );
  const descriptionsMarkup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "description-table",
      block: {
        type: "table",
        columns: ["Stage one", "Stage two", "Stage three", "Stage four", "Stage five"],
        rows: [["One", "Two", "Three", "Four", "Five"]],
        showColumnHeaders: false,
        rowHeaders: false,
      },
    }),
  );

  assert.match(matrixMarkup, /data-wide="true"/);
  assert.match(matrixMarkup, /data-row-headers="true"/);
  assert.match(matrixMarkup, /aria-hidden="true"/);
  assert.match(matrixMarkup, /scope="row"/);
  assert.match(matrixMarkup, /class="article-table-row-header"/);
  assert.equal((matrixMarkup.match(/scope="col"/g) ?? []).length, 4);

  assert.match(descriptionsMarkup, /data-column-headers="hidden"/);
  assert.match(descriptionsMarkup, /<thead class="sr-only">/);
  assert.equal((descriptionsMarkup.match(/scope="col"/g) ?? []).length, 5);
});
