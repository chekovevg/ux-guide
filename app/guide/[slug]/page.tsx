import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/GuideShell";
import {
  getGuideChapter,
  getGuideNavigation,
  guideChapters,
} from "@/content/guide";
import { resolveGuideLocale } from "@/content/guideStructure";

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export function generateStaticParams() {
  return guideChapters.map((chapter) => ({
    slug: chapter.slug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = resolveGuideLocale((await searchParams)?.lang);
  const chapter = getGuideChapter(slug, locale);

  if (!chapter) {
    return {};
  }

  return {
    title: `${chapter.title} | Pathway / Wynde Guide`,
    description: chapter.subtitle,
  };
}

export default async function GuidePage({ params, searchParams }: GuidePageProps) {
  const { slug } = await params;
  const locale = resolveGuideLocale((await searchParams)?.lang);
  const chapter = getGuideChapter(slug, locale);

  if (!chapter) {
    notFound();
  }

  return (
    <GuideShell
      chapter={chapter}
      navigation={getGuideNavigation(chapter.slug, locale)}
    />
  );
}
