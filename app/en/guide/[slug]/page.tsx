import type { Metadata } from "next";
import {
  generateGuideMetadata,
  generateGuideStaticParams,
  GuidePageRoute,
  type GuidePageProps,
} from "@/app/guide/GuidePageRoute";

export function generateStaticParams() {
  return generateGuideStaticParams("en");
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  return generateGuideMetadata({ params }, "en");
}

export default function EnglishGuidePage(props: GuidePageProps) {
  return <GuidePageRoute {...props} locale="en" />;
}
