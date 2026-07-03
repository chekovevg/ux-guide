import type {
  GuideNavigationGroup,
  GuideNavigationItem,
} from "@/components/guide/types";
import guideStructureEnJson from "./guide-structure.en.json";
import guideStructureRuJson from "./guide-structure.ru.json";

export type GuideLocale = "ru" | "en";
export const defaultGuideLocale: GuideLocale = "ru";
export const guideLocales = ["ru", "en"] as const;
export const availableGuideLocales = ["ru", "en"] as const;

export type GuideStructureHeading = {
  slug: string;
  title: string;
  navTitle?: string;
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
  en: guideStructureEnJson as GuideStructure,
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

const guideNavigationGroupConfigs = [
  {
    title: {
      ru: "Начало",
      en: "Start",
    },
    slugs: [
      "intro",
      "zachem-tratit-vremya-na-issledovaniya",
      "soprotivlenie-issledovaniyam-i-kak-s-etim-rabotat",
      "ob-udalennyh-issledovaniyah",
    ],
  },
  {
    title: {
      ru: "Подготовка",
      en: "Planning",
    },
    slugs: [
      "gotovimsya-k-issledovaniyu",
      "chek-list-o-chem-esche-podumat-pered-zapuskom",
      "auditoriya-kak-vybrat-i-poschitat-nuzhnoe-kolichestvo",
    ],
  },
  {
    title: {
      ru: "Методы и прототипы",
      en: "Methods and Prototypes",
    },
    slugs: [
      "metody-kak-vybrat-i-zapustit",
      "prototipy-kakie-byvayut-i-kak-podgotovit-k-testirovaniyu",
    ],
  },
  {
    title: {
      ru: "Результаты",
      en: "Results",
    },
    slugs: [
      "kak-rabotat-s-rezultatami",
      "chto-uchest-prezhde-chem-delat-vyvody",
      "kak-vystroit-vse-tak-chtoby-pomogat-issledovaniyami-biznesu",
    ],
  },
] as const;

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

function getHeadingDescription(heading: GuideStructureHeading) {
  return heading.blocks.find((block) => block.text?.trim())?.text?.trim();
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
      navTitle: chapter.navTitle,
      description: getHeadingDescription(chapter),
      available: available.has(chapter.slug),
      active: chapter.slug === activeSlug,
    }));
}

export function getGuideStructureNavigationGroups(
  activeSlug: string,
  availableSlugs: string[] = [],
  locale: GuideLocale = defaultGuideLocale,
): GuideNavigationGroup[] {
  const navigationBySlug = new Map(
    getGuideStructureNavigation(activeSlug, availableSlugs, locale).map((item) => [
      item.slug,
      item,
    ]),
  );
  const groupedSlugs = new Set<string>(
    guideNavigationGroupConfigs.flatMap((group) => [...group.slugs]),
  );
  const groups: GuideNavigationGroup[] = guideNavigationGroupConfigs
    .map((group) => ({
      title: group.title[locale],
      items: group.slugs
        .map((slug) => navigationBySlug.get(slug))
        .filter((item): item is GuideNavigationItem => Boolean(item)),
    }))
    .filter((group) => group.items.length > 0);
  const ungroupedItems = [...navigationBySlug.values()].filter(
    (item) => !groupedSlugs.has(item.slug),
  );

  if (ungroupedItems.length > 0) {
    groups.push({
      title: locale === "en" ? "More" : "Дополнительно",
      items: ungroupedItems,
    });
  }

  return groups;
}
