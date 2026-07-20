import type { ContentBlock, GuideChapter, GuideSection } from "@/components/guide/types";
import {
  defaultGuideLocale,
  getGuideStructure,
  getGuideStructureChapters,
  getGuideStructureNavigation,
  getGuideStructureNavigationGroups,
  type GuideLocale,
  type GuideStructureBlock,
  type GuideStructureHeading,
} from "@/content/guideStructure";

const resistanceChapterSlug =
  "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat";

const coverImages: Partial<
  Record<string, Partial<Record<GuideLocale, GuideChapter["coverImage"]>>>
> = {
  [resistanceChapterSlug]: {
    ru: {
      src: "/figma/cover-resistance.svg",
      alt: "Обложка главы о сопротивлении UX-исследованиям",
    },
    en: {
      src: "/figma/cover-resistance.svg",
      alt: "Guide cover about resistance to UX research",
    },
  },
};

function normalizeText(text?: string) {
  return text?.replace(/\s+/g, " ").trim() ?? "";
}

function getStructuredTable(
  block: GuideStructureBlock,
): Extract<ContentBlock, { type: "table" }> | null {
  if (
    block.type !== "table" ||
    !block.table?.columns.length ||
    !block.table.rows.length
  ) {
    return null;
  }

  const columns = block.table.columns.map((column) => normalizeText(column));
  const rows = block.table.rows.map((row) =>
    row.map((cell) => normalizeText(cell)),
  );
  const rowHeaders = block.table.rowHeaders === true;
  const hasInvalidColumn = columns.some(
    (column, columnIndex) =>
      !column && !(rowHeaders && columnIndex === 0),
  );

  if (
    hasInvalidColumn ||
    rows.some((row) => row.length !== columns.length)
  ) {
    return null;
  }

  return {
    type: "table",
    columns,
    rows,
    ...(block.table.showColumnHeaders === undefined
      ? {}
      : { showColumnHeaders: block.table.showColumnHeaders }),
    ...(block.table.rowHeaders === undefined
      ? {}
      : { rowHeaders: block.table.rowHeaders }),
  };
}

function normalizeImageSrc(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/image/")) {
    return `https://www.notion.so${src}`;
  }

  return src;
}

function isRenderableContentImage(src: string) {
  return !src.split("?")[0]?.startsWith("/icons/");
}

function formatCapturedAt(
  isoDate: string,
  locale: GuideLocale = defaultGuideLocale,
) {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) {
    return locale === "en" ? `Updated ${isoDate}` : `Обновлено ${isoDate}`;
  }

  if (locale === "en") {
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return `Updated ${new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)}`;
  }

  return `Обновлено ${day}.${month}.${year}`;
}

function appendGroupedList(
  result: ContentBlock[],
  type: "bulletedList" | "numberedList" | "todoList",
  items: string[],
) {
  if (!items.length) {
    return;
  }

  result.push({ type, items });
}

function appendCallout(result: ContentBlock[], text: string) {
  result.push(parseNotionCallout(text));
}

function parseProTipCallout(text: string): Extract<ContentBlock, { type: "callout" }> | null {
  const proTipMatch = text.match(/^Pro[- ]tip:?\s*/i);

  if (!proTipMatch) {
    return null;
  }

  return {
    type: "callout",
    variant: "tip",
    text: text.slice(proTipMatch[0].length).trim() || text,
  };
}

function parseStructuredCalloutContent(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const chunks = normalizedText.split(/\n[ \t]*\n+/);

  if (chunks.length < 2) {
    return { text: normalizedText };
  }

  const paragraphs: string[] = [];
  const items: string[] = [];

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .filter((line) => line.trim());

    if (!lines.length) {
      continue;
    }

    if (lines.every((line) => /^[-*•] /.test(line))) {
      items.push(...lines.map((line) => line.slice(2)));
      continue;
    }

    paragraphs.push(chunk.trim());
  }

  return {
    text: normalizedText,
    ...(paragraphs.length ? { paragraphs } : {}),
    ...(items.length ? { items } : {}),
  };
}

function parseNotionCallout(text: string): Extract<ContentBlock, { type: "callout" }> {
  const proTip = parseProTipCallout(text);

  if (proTip) {
    return { ...proTip, ...parseStructuredCalloutContent(proTip.text) };
  }

  const knownPrefixes: Array<{
    prefix: string;
    title?: string;
    variant: Extract<ContentBlock, { type: "callout" }>["variant"];
  }> = [
    { prefix: "Пример с рынка", title: "Пример с рынка", variant: "example" },
    { prefix: "Пример сценария", title: "Пример сценария", variant: "example" },
    { prefix: "Примеры задач", title: "Примеры задач", variant: "example" },
    { prefix: "Примеры гипотез", title: "Примеры гипотез", variant: "example" },
    {
      prefix: "Примеры исследовательских вопросов",
      title: "Примеры исследовательских вопросов",
      variant: "example",
    },
    { prefix: "Market example", title: "Market example", variant: "example" },
    { prefix: "Scenario example", title: "Scenario example", variant: "example" },
    { prefix: "Example tasks", title: "Example tasks", variant: "example" },
    { prefix: "Example hypotheses", title: "Example hypotheses", variant: "example" },
    { prefix: "Example research questions", title: "Example research questions", variant: "example" },
  ];

  for (const { prefix, title, variant } of knownPrefixes) {
    if (!text.startsWith(prefix)) {
      continue;
    }

    const calloutText = text.slice(prefix.length).trim();

    return {
      type: "callout",
      variant,
      title,
      ...parseStructuredCalloutContent(calloutText || text),
    };
  }

  return { type: "callout", variant: "example", ...parseStructuredCalloutContent(text) };
}

function getKnownQuoteAuthorImage(
  authorName: string,
): Extract<ContentBlock, { type: "quote" }>["authorImage"] {
  if (/марина\s+суслова|marina\s+suslova/i.test(authorName)) {
    return {
      src: "/figma/quote-author-marina.png",
      alt: authorName,
    };
  }

  return undefined;
}

function parseStructuredQuote(text: string): Extract<ContentBlock, { type: "quote" }> | null {
  const withoutPrefix = text
    .replace(/^Цитата\s*/i, "")
    .replace(/^Quote:\s*/i, "")
    .trim();
  const firstQuoteIndex = withoutPrefix.search(/[«“”"]/u);

  if (firstQuoteIndex < 0) {
    return null;
  }

  const quoteEndIndexes = ["»", "”", "\""].map((mark) =>
    withoutPrefix.lastIndexOf(mark),
  );
  const lastQuoteIndex = Math.max(...quoteEndIndexes);

  if (lastQuoteIndex <= firstQuoteIndex) {
    return null;
  }

  const quoteText = withoutPrefix
    .slice(firstQuoteIndex + 1, lastQuoteIndex)
    .trim();
  const authorPart = withoutPrefix
    .slice(lastQuoteIndex + 1)
    .replace(/^[\s.,:;—-]+/, "")
    .trim();

  if (!quoteText || !authorPart) {
    return null;
  }

  const [authorName, ...authorTitleParts] = authorPart.split(",");
  const trimmedAuthorName = authorName?.trim();

  if (!trimmedAuthorName) {
    return null;
  }

  const authorTitle = authorTitleParts.join(",").trim();
  const authorImage = getKnownQuoteAuthorImage(trimmedAuthorName);

  return {
    type: "quote",
    text: quoteText,
    authorName: trimmedAuthorName,
    authorTitle: authorTitle || undefined,
    authorImage,
  };
}

function notionBlocksToContentBlocks(blocks: GuideStructureBlock[]): ContentBlock[] {
  const result: ContentBlock[] = [];
  let bulletItems: string[] = [];
  let numberedItems: string[] = [];
  let todoItems: string[] = [];

  const flushLists = () => {
    appendGroupedList(result, "bulletedList", bulletItems);
    appendGroupedList(result, "numberedList", numberedItems);
    appendGroupedList(result, "todoList", todoItems);
    bulletItems = [];
    numberedItems = [];
    todoItems = [];
  };

  for (const block of blocks) {
    const sourceText = block.text?.replace(/\r\n/g, "\n") ?? "";
    const text = normalizeText(sourceText);
    const structuredTable = getStructuredTable(block);

    if (block.type === "bulleted_list") {
      numberedItems = [];
      todoItems = [];
      if (text) {
        bulletItems.push(text);
      }
      continue;
    }

    if (block.type === "numbered_list") {
      bulletItems = [];
      todoItems = [];
      if (text) {
        numberedItems.push(text);
      }
      if (block.image && isRenderableContentImage(block.image)) {
        flushLists();
        result.push({
          type: "image",
          src: normalizeImageSrc(block.image),
          alt: text,
        });
      }
      continue;
    }

    if (block.type === "to_do") {
      bulletItems = [];
      numberedItems = [];
      if (text) {
        todoItems.push(text);
      }
      continue;
    }

    flushLists();

    if (block.type === "sub_sub_header" && text) {
      result.push({ type: "lead", text });
    } else if (block.type === "text" && text) {
      result.push({ type: "paragraph", text });
    } else if (block.type === "callout" && text) {
      appendCallout(result, sourceText);
    } else if (block.type === "quote" && text) {
      result.push(parseStructuredQuote(text) ?? { type: "paragraph", text });
    } else if (block.type === "toggle" && text) {
      result.push({
        type: "toggle",
        title: text,
        blocks: notionBlocksToContentBlocks(block.children ?? []),
      });
    } else if (block.type === "table") {
      if (structuredTable) {
        result.push(structuredTable);
      } else if (text) {
        result.push({ type: "rawTable", text });
      }
    } else if (
      block.type === "image" &&
      block.image &&
      isRenderableContentImage(block.image)
    ) {
      result.push({
        type: "image",
        src: normalizeImageSrc(block.image),
        alt: text || undefined,
      });
    } else if (text) {
      result.push({ type: "paragraph", text });
    }
  }

  flushLists();
  return result;
}

function headingToSection(
  heading: GuideStructureHeading,
  depth = 0,
): GuideSection {
  return {
    id: heading.slug,
    title: heading.title,
    headingLevel: depth === 0 ? 2 : 3,
    blocks: notionBlocksToContentBlocks(heading.blocks),
    children: heading.children.map((child) => headingToSection(child, depth + 1)),
  };
}

function structureChapterToGuideChapter(
  chapter: GuideStructureHeading,
  locale: GuideLocale = defaultGuideLocale,
): GuideChapter {
  return {
    slug: chapter.slug,
    title: chapter.title,
    navTitle: chapter.navTitle,
    updatedAt: formatCapturedAt(getGuideStructure(locale).source.capturedAt, locale),
    coverImage:
      coverImages[chapter.slug]?.[locale] ??
      coverImages[chapter.slug]?.[defaultGuideLocale],
    blocks: notionBlocksToContentBlocks(chapter.blocks),
    sections: chapter.children.map((child) => headingToSection(child)),
  };
}

export function getGuideChapters(
  locale: GuideLocale = defaultGuideLocale,
): GuideChapter[] {
  return getGuideStructureChapters(locale).map((chapter) =>
    structureChapterToGuideChapter(chapter, locale),
  );
}

export const guideChapters: GuideChapter[] = getGuideChapters(defaultGuideLocale);

export const firstGuideSlug = guideChapters[0]?.slug ?? resistanceChapterSlug;

export function getGuideChapter(
  slug: string,
  locale: GuideLocale = defaultGuideLocale,
) {
  return getGuideChapters(locale).find((chapter) => chapter.slug === slug);
}

export function getGuideNavigation(
  activeSlug: string,
  locale: GuideLocale = defaultGuideLocale,
) {
  const availableGuideSlugs = getGuideChapters(locale).map((chapter) => chapter.slug);

  return getGuideStructureNavigation(activeSlug, availableGuideSlugs, locale);
}

export function getGuideNavigationGroups(
  activeSlug: string,
  locale: GuideLocale = defaultGuideLocale,
) {
  const availableGuideSlugs = getGuideChapters(locale).map((chapter) => chapter.slug);

  return getGuideStructureNavigationGroups(activeSlug, availableGuideSlugs, locale);
}
