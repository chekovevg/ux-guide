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
  const chapter = getGuideChapter(slug, locale);

  if (!chapter) {
    notFound();
  }

  return (
    <GuideShell
      chapter={chapter}
      chapterBasePath={getGuideBasePath(locale)}
      languageLinks={getGuideLanguageLinks(chapter.slug, locale)}
      navigation={getGuideNavigation(chapter.slug, locale)}
      navigationGroups={getGuideNavigationGroups(chapter.slug, locale)}
    />
  );
}
