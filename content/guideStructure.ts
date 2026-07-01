import type { GuideNavigationItem } from "@/components/guide/types";
import guideStructureRuJson from "./guide-structure.ru.json";

export type GuideLocale = "ru" | "en";
export const defaultGuideLocale: GuideLocale = "ru";
export const guideLocales = ["ru", "en"] as const;
export const availableGuideLocales = ["ru"] as const;

export type GuideStructureHeading = {
  slug: string;
  title: string;
  level: 1 | 2 | 3;
  notionBlockType: "header" | "sub_header" | "sub_sub_header";
  sourceBlockIndex: number;
  blocks: GuideStructureBlock[];
  children: GuideStructureHeading[];
};

export type GuideStructureBlock = {
  type: string;
  sourceBlockIndex: number;
  text?: string;
  image?: string;
};

export type GuideStructure = {
  schemaVersion: 2;
  source: {
    type: "notion";
    notionPageId: string;
    url: string;
    publicUrl: string;
    title: string;
    capturedAt: string;
  };
  chapters: GuideStructureHeading[];
};

export const guideStructures: Partial<Record<GuideLocale, GuideStructure>> = {
  ru: guideStructureRuJson as GuideStructure,
};

export function resolveGuideLocale(locale?: string): GuideLocale {
  return guideLocales.includes(locale as GuideLocale)
    ? (locale as GuideLocale)
    : defaultGuideLocale;
}

export function hasGuideStructure(locale: GuideLocale) {
  return Boolean(guideStructures[locale]);
}

export function getGuideStructure(
  locale: GuideLocale = defaultGuideLocale,
): GuideStructure {
  return guideStructures[locale] ?? guideStructures[defaultGuideLocale]!;
}

export function getGuideStructureChapters(
  locale: GuideLocale = defaultGuideLocale,
) {
  return getGuideStructure(locale).chapters;
}

export const guideStructure = getGuideStructure(defaultGuideLocale);
export const guideStructureChapters = getGuideStructureChapters(defaultGuideLocale);

export function getGuideStructureChapter(
  slug: string,
  locale: GuideLocale = defaultGuideLocale,
) {
  return getGuideStructureChapters(locale).find((chapter) => chapter.slug === slug);
}

export function flattenGuideStructureHeadings(
  headings: GuideStructureHeading[] = guideStructureChapters,
): GuideStructureHeading[] {
  return headings.flatMap((heading) => [
    heading,
    ...flattenGuideStructureHeadings(heading.children),
  ]);
}

export function getGuideStructureNavigation(
  activeSlug: string,
  availableSlugs: string[] = [],
  locale: GuideLocale = defaultGuideLocale,
): GuideNavigationItem[] {
  const available = new Set(availableSlugs);
  const order = new Map(
    [
      "intro",
      "zachem-tratit-vremya-na-issledovaniya",
      "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
      "ob-udalennyh-issledovaniyah",
      "gotovimsya-k-issledovaniyu",
      "chek-list-o-chem-esche-podumat-pered-zapuskom",
      "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo",
      "metody-kak-vybrat-i-zapustit",
      "prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu",
      "kak-rabotat-s-rezultatami",
      "chto-uchest-prezhde-chem-delat-vyvody",
      "kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu",
    ].map((slug, index) => [slug, index]),
  );

  return [...getGuideStructureChapters(locale)]
    .sort(
      (a, b) =>
        (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
    )
    .map((chapter) => ({
      slug: chapter.slug,
      title: chapter.title,
      available: available.has(chapter.slug),
      active: chapter.slug === activeSlug,
    }));
}
