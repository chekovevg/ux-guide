import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const guideSearchSource = await readFile(
  new URL("./guideSearch.ts", import.meta.url),
  "utf8",
);
const compiledGuideSearchSource = ts.transpileModule(guideSearchSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const search = await import(
  `data:text/javascript;base64,${Buffer.from(compiledGuideSearchSource).toString("base64")}`
);

const chapters = [
  {
    slug: "research-sample",
    title: "Audience and sample",
    blocks: [
      { type: "paragraph", text: "A rare full-text phrase lives here." },
    ],
    sections: [
      {
        id: "respondent-count",
        title: "How many respondents are needed?",
        blocks: [
          {
            type: "bulletedList",
            items: ["Increase the respondent sample when recordings may fail."],
          },
          {
            type: "table",
            columns: ["Method", "Sample"],
            rows: [["Interview", "Five people"]],
          },
        ],
      },
    ],
  },
];

function buildIndex(chapterSet = chapters, locale = "en") {
  return search.buildGuideSearchIndex(chapterSet, {
    basePath: `/${locale}/guide`,
    locale,
  });
}

test("indexes chapter, section, and full-text fragments with anchored links", () => {
  const index = buildIndex();

  assert.equal(
    search.searchGuideIndex(index, "rare full-text phrase").chapters[0].href,
    "/en/guide/research-sample",
  );
  assert.equal(
    search.searchGuideIndex(index, "recordings may fail").sections[0].href,
    "/en/guide/research-sample#respondent-count",
  );
  assert.equal(
    search.searchGuideIndex(index, "five people").text[0].href,
    "/en/guide/research-sample#respondent-count",
  );
  assert.ok(
    search
      .searchGuideIndex(index, "sample")
      .text.every((item) => item.excerpt.length <= 160),
  );
});

test("indexes callout link labels as searchable text", () => {
  const index = buildIndex([
    {
      slug: "research-sample",
      title: "Audience and sample",
      sections: [
        {
          id: "respondent-count",
          title: "How many respondents are needed?",
          blocks: [
            {
              type: "callout",
              variant: "tip",
              text: "Open the detailed guide when you need more context.",
              linkLabel: "Read the recruitment checklist",
            },
          ],
        },
      ],
    },
  ]);

  assert.equal(
    search.searchGuideIndex(index, "recruitment checklist").text[0].href,
    "/en/guide/research-sample#respondent-count",
  );
});

test("ranks exact, prefix, substring, then body matches", () => {
  const bodyOnlyChapter = {
    slug: "body",
    title: "Elsewhere",
    blocks: [{ type: "paragraph", text: "A target phrase in body text." }],
    sections: [],
  };
  const rankedIndex = buildIndex([
    bodyOnlyChapter,
    { slug: "substring", title: "My target phrase guide", sections: [] },
    { slug: "prefix", title: "Target phrase handbook", sections: [] },
    { slug: "exact", title: "Target phrase", sections: [] },
  ]);

  assert.deepEqual(
    search
      .searchGuideIndex(rankedIndex, "target phrase")
      .chapters.map((item) => item.chapterSlug),
    ["exact", "prefix", "substring"],
  );
  assert.equal(
    search
      .searchGuideIndex(buildIndex([bodyOnlyChapter]), "target phrase")
      .chapters[0].chapterSlug,
    "body",
  );
});

test("matches Cyrillic case-insensitively", () => {
  const index = buildIndex(
    [
      {
        slug: "research",
        title: "Исследование",
        blocks: [{ type: "paragraph", text: "Проверяем РЕСПОНДЕНТОВ в записи." }],
        sections: [],
      },
    ],
    "ru",
  );

  assert.equal(
    search.searchGuideIndex(index, "респондентов").text[0].chapterSlug,
    "research",
  );
});

test("de-duplicates records and applies per-type result limits", () => {
  const limitChapters = Array.from({ length: 9 }, (_, index) => ({
    slug: `chapter-${index}`,
    title: `Match chapter ${index}`,
    blocks: [{ type: "paragraph", text: "match" }],
    sections: Array.from({ length: 7 }, (_, sectionIndex) => ({
      id: `section-${sectionIndex}`,
      title: `Match section ${sectionIndex}`,
      blocks: Array.from({ length: 10 }, () => ({ type: "paragraph", text: "match" })),
    })),
  }));
  const index = buildIndex(limitChapters);
  const results = search.searchGuideIndex(index, "match");

  assert.equal(results.chapters.length, 3);
  assert.equal(results.sections.length, 5);
  assert.equal(results.text.length, 8);
  assert.equal(
    new Set(results.chapters.map((item) => item.chapterSlug)).size,
    results.chapters.length,
  );
  assert.equal(
    new Set(results.sections.map((item) => `${item.chapterSlug}:${item.sectionId}`)).size,
    results.sections.length,
  );
  assert.equal(
    new Set(results.text.map((item) => `${item.href}:${item.excerptSource}`)).size,
    results.text.length,
  );
});

test("suggests unique chapters in source order", () => {
  const index = buildIndex(
    Array.from({ length: 4 }, (_, index) => ({
      slug: `chapter-${index}`,
      title: `Chapter ${index}`,
      sections: [],
    })),
  );

  assert.deepEqual(
    search.getSuggestedGuideChapters(index, 2).map((item) => item.chapterSlug),
    ["chapter-0", "chapter-1"],
  );
});
