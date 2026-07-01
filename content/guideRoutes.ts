import type { GuideLanguageLink } from "@/components/guide/types";
import { defaultGuideLocale, type GuideLocale } from "./guideStructure";

export function getGuideBasePath(
  locale: GuideLocale = defaultGuideLocale,
): string {
  return locale === "en" ? "/en/guide" : "/guide";
}

export function getGuideChapterHref(
  slug: string,
  locale: GuideLocale = defaultGuideLocale,
): string {
  return `${getGuideBasePath(locale)}/${slug}`;
}

export function getGuideLanguageLinks(
  slug: string,
  activeLocale: GuideLocale = defaultGuideLocale,
): GuideLanguageLink[] {
  return [
    {
      locale: "ru",
      label: "RU",
      href: getGuideChapterHref(slug, "ru"),
      active: activeLocale === "ru",
      ariaLabel: "Switch to Russian",
    },
    {
      locale: "en",
      label: "EN",
      href: getGuideChapterHref(slug, "en"),
      active: activeLocale === "en",
      ariaLabel: "Switch to English",
    },
  ];
}
