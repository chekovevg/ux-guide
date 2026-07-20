import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/GuideShell";
import {
  getGuideBasePath,
  getGuideLanguageLinks,
} from "@/content/guideRoutes";
import {
  getGuideChapter,
  getGuideChapters,
  getGuideNavigation,
  getGuideNavigationGroups,
} from "@/content/guide";
import { buildGuideSearchIndex } from "@/content/guideSearch";
import type { GuideLocale } from "@/content/guideStructure";

export type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateGuideStaticParams(locale: GuideLocale) {
  return getGuideChapters(locale).map((chapter) => ({
    slug: chapter.slug,
  }));
}

export async function generateGuideMetadata(
  { params }: GuidePageProps,
  locale: GuideLocale,
): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getGuideChapter(slug, locale);

  if (!chapter) {
    return {};
  }

  return {
    title: `${chapter.title} | Pathway / Wynde Guide`,
    description: chapter.subtitle,
  };
}

export async function GuidePageRoute({
  params,
  locale,
}: GuidePageProps & { locale: GuideLocale }) {
  const { slug } = await params;
  const chapters = getGuideChapters(locale);
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter) {
    notFound();
  }

  const chapterBasePath = getGuideBasePath(locale);
  const searchIndex = buildGuideSearchIndex(chapters, {
    basePath: chapterBasePath,
    locale,
  });

  return (
    <GuideShell
      chapter={chapter}
      chapterBasePath={chapterBasePath}
      languageLinks={getGuideLanguageLinks(chapter.slug, locale)}
      locale={locale}
      navigation={getGuideNavigation(chapter.slug, locale)}
      navigationGroups={getGuideNavigationGroups(chapter.slug, locale)}
      searchIndex={searchIndex}
    />
  );
}
