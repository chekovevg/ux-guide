import type {
  ContentBlock,
  GuideChapter,
  GuideSearchRecord,
  GuideSearchResults,
  GuideSection,
} from "@/components/guide/types";

const SEARCH_LIMITS = { chapter: 3, section: 5, text: 8 } as const;
const MAX_EXCERPT_LENGTH = 160;

function normalize(value: string, locale: "ru" | "en") {
  return value.normalize("NFKC").toLocaleLowerCase(locale).replace(/\s+/g, " ").trim();
}

function rank(title: string, searchText: string, query: string, locale: "ru" | "en") {
  const normalizedTitle = normalize(title, locale);
  const normalizedText = normalize(searchText, locale);
  const normalizedQuery = normalize(query, locale);

  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  if (normalizedTitle.includes(normalizedQuery)) return 2;
  if (normalizedText.includes(normalizedQuery)) return 3;
  return null;
}

function cleanText(value?: string) {
  return value?.normalize("NFKC").replace(/\s+/g, " ").trim() ?? "";
}

function joinText(values: Array<string | undefined>) {
  return values.map(cleanText).filter(Boolean).join("\n");
}

function getBlockFragments(blocks: ContentBlock[] = []): string[] {
  const fragments: string[] = [];
  const add = (value?: string) => {
    const text = cleanText(value);

    if (text) {
      fragments.push(text);
    }
  };

  for (const block of blocks) {
    switch (block.type) {
      case "lead":
      case "paragraph":
      case "rawTable":
        add(block.text);
        break;
      case "callout":
        add(block.title);
        if (block.paragraphs?.length || block.items?.length) {
          block.paragraphs?.forEach(add);
          block.items?.forEach(add);
        } else {
          add(block.text);
        }
        add(block.linkLabel);
        break;
      case "bulletedList":
      case "numberedList":
      case "todoList":
        block.items.forEach(add);
        break;
      case "image":
        add(block.alt);
        break;
      case "toggle":
        add(block.title);
        add(block.text);
        fragments.push(...getBlockFragments(block.blocks));
        break;
      case "steps":
        add(block.title);
        block.items.forEach(add);
        break;
      case "checklist":
        add(block.title);
        block.items.forEach(add);
        break;
      case "quote":
        add(block.text);
        add(block.byline);
        add(block.authorName);
        add(block.authorTitle);
        add(block.authorImage?.alt);
        break;
      case "table":
        block.columns.forEach(add);
        block.rows.flat().forEach(add);
        break;
      case "pathway":
        add(block.title);
        block.items.forEach(add);
        add(block.cta);
        break;
      case "related":
        add(block.previous);
        add(block.next);
        break;
    }
  }

  return fragments;
}

function getSectionText(section: GuideSection): string[] {
  return [
    cleanText(section.title),
    ...getBlockFragments(section.blocks),
    ...(section.children?.flatMap(getSectionText) ?? []),
  ].filter(Boolean);
}

function getRecordKey(record: GuideSearchRecord) {
  if (record.type === "chapter") {
    return record.chapterSlug;
  }

  if (record.type === "section") {
    return `${record.chapterSlug}:${record.sectionId ?? ""}`;
  }

  return `${record.href}:${normalize(record.excerptSource, record.locale)}`;
}

function getExcerpt(source: string, query: string, locale: "ru" | "en") {
  const text = cleanText(source);
  const normalizedQuery = normalize(query, locale);

  if (text.length <= MAX_EXCERPT_LENGTH || !normalizedQuery) {
    return text.slice(0, MAX_EXCERPT_LENGTH);
  }

  const matchIndex = normalize(text, locale).indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return `${text.slice(0, MAX_EXCERPT_LENGTH - 1)}…`;
  }

  const contentLength = MAX_EXCERPT_LENGTH - 2;
  const start = Math.max(
    0,
    Math.min(matchIndex - 60, text.length - contentLength),
  );
  const end = Math.min(text.length, start + contentLength);

  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export function buildGuideSearchIndex(
  chapters: GuideChapter[],
  options: { basePath: string; locale: "ru" | "en" },
): GuideSearchRecord[] {
  const records: GuideSearchRecord[] = [];
  const seenChapters = new Set<string>();
  const seenSections = new Set<string>();
  const seenText = new Set<string>();
  const basePath = options.basePath.replace(/\/+$/, "");
  let sourceOrder = 0;

  const addRecord = (record: Omit<GuideSearchRecord, "id" | "sourceOrder">) => {
    const key = getRecordKey({ ...record, id: "", sourceOrder: 0 });
    const seen =
      record.type === "chapter"
        ? seenChapters
        : record.type === "section"
          ? seenSections
          : seenText;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    records.push({
      ...record,
      id: `${record.type}:${record.chapterSlug}:${record.sectionId ?? "chapter"}:${sourceOrder}`,
      sourceOrder: sourceOrder++,
    });
    return true;
  };

  const addTextRecords = (
    fragments: string[],
    chapter: GuideChapter,
    href: string,
    section?: GuideSection,
  ) => {
    for (const fragment of fragments) {
      addRecord({
        locale: options.locale,
        type: "text",
        href,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        sectionId: section?.id,
        sectionTitle: section?.title,
        title: section?.title ?? chapter.title,
        searchText: fragment,
        excerptSource: fragment,
      });
    }
  };

  const addSection = (chapter: GuideChapter, section: GuideSection, chapterHref: string) => {
    const href = `${chapterHref}#${section.id}`;
    const sectionText = joinText(getSectionText(section));
    const wasAdded = addRecord({
      locale: options.locale,
      type: "section",
      href,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      sectionId: section.id,
      sectionTitle: section.title,
      title: section.title,
      searchText: sectionText,
      excerptSource: sectionText,
    });

    if (!wasAdded) {
      return;
    }

    addTextRecords(getBlockFragments(section.blocks), chapter, href, section);
    section.children?.forEach((child) => addSection(chapter, child, chapterHref));
  };

  for (const chapter of chapters) {
    const chapterHref = `${basePath}/${chapter.slug}`;
    const chapterText = joinText([
      chapter.title,
      chapter.navTitle,
      chapter.subtitle,
      ...getBlockFragments(chapter.blocks),
      ...chapter.sections.flatMap(getSectionText),
    ]);
    const wasAdded = addRecord({
      locale: options.locale,
      type: "chapter",
      href: chapterHref,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      title: chapter.title,
      searchText: chapterText,
      excerptSource: chapterText,
    });

    if (!wasAdded) {
      continue;
    }

    addTextRecords(getBlockFragments(chapter.blocks), chapter, chapterHref);
    chapter.sections.forEach((section) => addSection(chapter, section, chapterHref));
  }

  return records;
}

export function searchGuideIndex(
  records: GuideSearchRecord[],
  query: string,
): GuideSearchResults {
  const results: GuideSearchResults = { chapters: [], sections: [], text: [] };

  if (!query.trim()) {
    return results;
  }

  const ranked = records
    .map((record) => ({
      record,
      rank: rank(
        record.type === "text" ? record.searchText : record.title,
        record.searchText,
        query,
        record.locale,
      ),
    }))
    .filter((match): match is { record: GuideSearchRecord; rank: number } => match.rank !== null)
    .sort((left, right) => left.rank - right.rank || left.record.sourceOrder - right.record.sourceOrder);

  const seen = {
    chapter: new Set<string>(),
    section: new Set<string>(),
    text: new Set<string>(),
  };

  for (const { record } of ranked) {
    const key = getRecordKey(record);
    const type = record.type;
    const resultList =
      type === "chapter"
        ? results.chapters
        : type === "section"
          ? results.sections
          : results.text;

    if (seen[type].has(key) || resultList.length >= SEARCH_LIMITS[type]) {
      continue;
    }

    seen[type].add(key);
    resultList.push({
      ...record,
      excerpt: getExcerpt(record.excerptSource, query, record.locale),
    });
  }

  return results;
}

export function getSuggestedGuideChapters(
  records: GuideSearchRecord[],
  limit = SEARCH_LIMITS.chapter,
): GuideSearchRecord[] {
  const seen = new Set<string>();

  return records
    .filter((record) => record.type === "chapter")
    .sort((left, right) => left.sourceOrder - right.sourceOrder)
    .filter((record) => {
      if (seen.has(record.chapterSlug)) {
        return false;
      }

      seen.add(record.chapterSlug);
      return true;
    })
    .slice(0, Math.max(0, limit));
}
