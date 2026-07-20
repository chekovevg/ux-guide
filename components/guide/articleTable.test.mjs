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

test("keeps two-column tables semantic without scroll-region affordances", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "methods-table",
      scrollRegionLabel: "Scrollable table",
      block: {
        type: "table",
        columns: ["Method", "How it works"],
        rows: [["First click", "Pick a target"]],
      },
    }),
  );

  assert.match(markup, /id="methods-table"/);
  assert.doesNotMatch(markup, /role="region"/);
  assert.doesNotMatch(markup, /aria-label=/);
  assert.doesNotMatch(markup, /tabindex="0"/);
  assert.doesNotMatch(markup, /data-scrollable=/);
  assert.doesNotMatch(markup, /data-wide=/);
  assert.doesNotMatch(markup, /article-table-scroll-cue/);
  assert.equal((markup.match(/scope="col"/g) ?? []).length, 2);
});

test("makes three-column tables named keyboard-scrollable regions with a decorative cue", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "comparison-table",
      scrollRegionLabel: "Scrollable table",
      block: {
        type: "table",
        columns: ["Method", "How it works", "Helps validate"],
        rows: [["First click", "Pick a target", "Information scent"]],
      },
    }),
  );

  assert.match(markup, /class="article-table-shell"/);
  assert.match(markup, /data-scrollable="true"/);
  assert.match(markup, /role="region"/);
  assert.match(markup, /aria-label="Method, How it works, Helps validate"/);
  assert.match(markup, /tabindex="0"/);
  assert.doesNotMatch(markup, /data-wide=/);
  assert.match(markup, /class="article-table-scroll-cue" aria-hidden="true"/);
  assert.equal((markup.match(/scope="col"/g) ?? []).length, 3);
});

test("renders row headers and hidden column headers with table semantics", () => {
  const matrixMarkup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "matrix-table",
      scrollRegionLabel: "Scrollable table",
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
      scrollRegionLabel: "Scrollable table",
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
  assert.match(matrixMarkup, /data-scrollable="true"/);
  assert.match(matrixMarkup, /data-row-headers="true"/);
  assert.match(matrixMarkup, /role="region"/);
  assert.match(matrixMarkup, /aria-label="Stage one, Stage two, Stage three, Stage four"/);
  assert.match(matrixMarkup, /tabindex="0"/);
  assert.match(matrixMarkup, /aria-hidden="true"/);
  assert.match(matrixMarkup, /scope="row"/);
  assert.match(matrixMarkup, /class="article-table-row-header"/);
  assert.equal((matrixMarkup.match(/scope="col"/g) ?? []).length, 4);

  assert.match(descriptionsMarkup, /data-column-headers="hidden"/);
  assert.match(descriptionsMarkup, /<thead class="sr-only">/);
  assert.equal((descriptionsMarkup.match(/scope="col"/g) ?? []).length, 5);
});

test("uses the localized generic label when every column header is blank", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ArticleTable, {
      blockId: "blank-headers-table",
      scrollRegionLabel: "Прокручиваемая таблица",
      block: {
        type: "table",
        columns: ["", "", ""],
        rows: [["One", "Two", "Three"]],
      },
    }),
  );

  assert.match(markup, /aria-label="Прокручиваемая таблица"/);
});
