import { getGuideChapters } from "@/content/guide";
import { buildGuideSearchIndex } from "@/content/guideSearch";

export const dynamic = "force-static";

export function GET() {
  const locale = "ru";
  const basePath = "/guide";

  return Response.json(
    buildGuideSearchIndex(getGuideChapters(locale), { basePath, locale }),
  );
}
