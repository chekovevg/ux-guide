import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const structure = JSON.parse(
  await readFile(new URL("./guide-structure.json", import.meta.url), "utf8"),
);
const ruStructure = JSON.parse(
  await readFile(new URL("./guide-structure.ru.json", import.meta.url), "utf8"),
);

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function flattenHeadings(nodes) {
  return nodes.flatMap((node) => [node, ...flattenHeadings(node.children ?? [])]);
}

function flattenBlocks(nodes) {
  return nodes.flatMap((node) => [
    ...(node.blocks ?? []),
    ...flattenBlocks(node.children ?? []),
  ]);
}

function structuralSnapshot(nodes) {
  return nodes.map((node) => ({
    slug: node.slug,
    level: node.level,
    notionBlockType: node.notionBlockType,
    sourceBlockIndex: node.sourceBlockIndex,
    blocks: (node.blocks ?? []).map((block) => ({
      type: block.type,
      sourceBlockIndex: block.sourceBlockIndex,
      image: block.image,
    })),
    children: structuralSnapshot(node.children ?? []),
  }));
}

function collectLocalizableFields(value, path = []) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectLocalizableFields(item, [...path, String(index)]),
    );
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = [...path, key];

    if ((key === "title" || key === "text") && typeof child === "string") {
      return [{ path: childPath.join("."), value: child }];
    }

    return collectLocalizableFields(child, childPath);
  });
}

test("stores the full Notion guide structure as backend-ready data", () => {
  assert.equal(structure.schemaVersion, 2);
  assert.equal(
    structure.source.notionPageId,
    "2c409e0a382f819ea254e2989aa871a9",
  );
  assert.equal(structure.chapters.length, 12);
  assert.deepEqual(
    structure.chapters.map((chapter) => chapter.slug),
    [
      "intro",
      "zachem-tratit-vremya-na-issledovaniya",
      "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
      "ob-udalennyh-issledovaniyah",
      "gotovimsya-k-issledovaniyu",
      "metody-kak-vybrat-i-zapustit",
      "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo",
      "prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu",
      "chek-list-o-chem-esche-podumat-pered-zapuskom",
      "chto-uchest-prezhde-chem-delat-vyvody",
      "kak-rabotat-s-rezultatami",
      "kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu",
    ],
  );
});

test("keeps stable unique slugs for all headings", () => {
  const headings = flattenHeadings(structure.chapters);
  const slugs = headings.map((heading) => heading.slug);

  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)));
  assert.ok(slugs.includes("nemoderiruemoe-stsenarnoe-testirovanie"));
  assert.ok(slugs.includes("shag-4-nastroyte-demokratizatsiyu"));
});

test("preserves Notion ordering and heading depth", () => {
  const methods = structure.chapters.find(
    (chapter) => chapter.slug === "metody-kak-vybrat-i-zapustit",
  );

  assert.ok(methods);
  assert.deepEqual(
    methods.children.slice(0, 4).map((section) => section.slug),
    [
      "nemoderiruemoe-stsenarnoe-testirovanie",
      "test-predpochteniya-preference-test",
      "a-b-yuzabiliti-test",
      "kartochnaya-sortirovka",
    ],
  );

  const results = methods.children.find(
    (section) =>
      section.slug ===
      "kakie-rezultaty-v-tselom-mozhete-poluchat-iz-nemoderiruemyh-issledovaniy",
  );

  assert.ok(results);
  assert.equal(results.level, 2);
  assert.ok(results.blocks.length > 0);
});

test("stores body text blocks inside the heading structure", () => {
  const intro = structure.chapters.find((chapter) => chapter.slug === "intro");
  const resistance = structure.chapters.find(
    (chapter) =>
      chapter.slug === "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
  );
  const blocks = flattenBlocks(structure.chapters);

  assert.ok(intro);
  assert.ok(resistance);
  assert.ok(Array.isArray(intro.blocks));
  assert.ok(Array.isArray(resistance.blocks));
  assert.ok(blocks.length > 600);
  assert.ok(
    intro.blocks.some((block) =>
      block.text.includes(
        "\u042d\u0442\u043e\u0442 \u0433\u0430\u0439\u0434 \u043f\u043e\u043c\u043e\u0436\u0435\u0442",
      ),
    ),
  );
  assert.ok(
    resistance.blocks.some((block) =>
      block.text.includes(
        "\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u2014 \u044d\u0442\u043e \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0441\u043b\u043e\u0436\u043d\u043e",
      ),
    ),
  );
});

test("keeps the default Russian structure as the localized RU baseline", () => {
  assert.equal(ruStructure.schemaVersion, structure.schemaVersion);
  assert.equal(ruStructure.source.notionPageId, structure.source.notionPageId);
  assert.equal(ruStructure.chapters.length, 12);
  assert.deepEqual(
    structuralSnapshot(ruStructure.chapters),
    structuralSnapshot(structure.chapters),
  );
});

test("keeps short Russian navigation titles separate from full chapter titles", () => {
  const navTitles = Object.fromEntries(
    ruStructure.chapters.map((chapter) => [chapter.slug, chapter.navTitle]),
  );
  const fullTitles = Object.fromEntries(
    ruStructure.chapters.map((chapter) => [chapter.slug, chapter.title]),
  );

  assert.equal(navTitles.intro, "Интро");
  assert.equal(
    navTitles["zachem-tratit-vremya-na-issledovaniya"],
    "Зачем исследования",
  );
  assert.equal(
    navTitles["soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat"],
    "Возражения",
  );
  assert.equal(navTitles["ob-udalennyh-issledovaniyah"], "Удалённые исследования");
  assert.equal(navTitles["gotovimsya-k-issledovaniyu"], "Подготовка");
  assert.equal(
    navTitles["chek-list-o-chem-esche-podumat-pered-zapuskom"],
    "Чек-лист запуска",
  );
  assert.equal(
    navTitles["auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo"],
    "Аудитория и выборка",
  );
  assert.equal(navTitles["metody-kak-vybrat-i-zapustit"], "Методы");
  assert.equal(
    navTitles["prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu"],
    "Прототипы",
  );
  assert.equal(navTitles["kak-rabotat-s-rezultatami"], "Результаты");
  assert.equal(
    navTitles["chto-uchest-prezhde-chem-delat-vyvody"],
    "Перед выводами",
  );
  assert.equal(
    navTitles["kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu"],
    "Research Ops / Процесс",
  );
  assert.equal(
    fullTitles["soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat"],
    "Сопротивление исследованиям, и как с этим работать",
  );
});

test("ships a structurally equivalent English guide structure", async () => {
  const enStructure = await readJsonIfExists("./guide-structure.en.json");

  assert.ok(enStructure, "Expected content/guide-structure.en.json to exist");
  assert.equal(enStructure.schemaVersion, ruStructure.schemaVersion);
  assert.equal(enStructure.source.notionPageId, ruStructure.source.notionPageId);
  assert.equal(enStructure.chapters.length, ruStructure.chapters.length);
  assert.deepEqual(
    structuralSnapshot(enStructure.chapters),
    structuralSnapshot(ruStructure.chapters),
  );
  assert.equal(
    flattenHeadings(enStructure.chapters).length,
    flattenHeadings(ruStructure.chapters).length,
  );
  assert.equal(
    flattenBlocks(enStructure.chapters).length,
    flattenBlocks(ruStructure.chapters).length,
  );

  const ruFields = collectLocalizableFields(ruStructure);
  const enFields = collectLocalizableFields(enStructure);

  assert.ok(enFields.length > 700);
  assert.deepEqual(
    enFields.map((field) => field.path),
    ruFields.map((field) => field.path),
  );

  for (const field of enFields) {
    assert.doesNotMatch(field.value, /[\u0400-\u04ff]/, field.path);
  }
});

test("exposes both localized structures through the locale loader", async () => {
  const loaderSource = await readFile(
    new URL("./guideStructure.ts", import.meta.url),
    "utf8",
  );

  assert.match(
    loaderSource,
    /import guideStructureEnJson from "\.\/guide-structure\.en\.json";/,
  );
  assert.match(loaderSource, /availableGuideLocales = \["ru", "en"\] as const/);
  assert.match(loaderSource, /en: guideStructureEnJson as GuideStructure/);
  assert.match(loaderSource, /description: getHeadingDescription\(chapter\)/);
});

test("keeps guide content out of the data adapter hardcode", async () => {
  const guideSource = await readFile(new URL("./guide.ts", import.meta.url), "utf8");

  assert.match(guideSource, /function appendCallout/);
  assert.match(guideSource, /parseNotionCallout\(text\)/);
  assert.match(guideSource, /function parseProTipCallout/);
  assert.match(guideSource, /title: "Пример с рынка"/);
  assert.match(guideSource, /variant: "example"/);
  assert.match(guideSource, /return \{ type: "callout", variant: "example", text \};/);
  assert.doesNotMatch(guideSource, /return \{ type: "callout", variant: "tip", text \};/);
  assert.doesNotMatch(guideSource, /resistanceIntro/);
  assert.doesNotMatch(guideSource, /resistanceSections/);
  assert.doesNotMatch(guideSource, /Resistance to research/);
  assert.doesNotMatch(guideSource, /Handling objections/);
});
