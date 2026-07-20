import { getGuideChapters } from "@/content/guide";
import { buildGuideSearchIndex } from "@/content/guideSearch";

export const dynamic = "force-static";

export function GET() {
  const locale = "en";
  const basePath = "/en/guide";

  return Response.json(
    buildGuideSearchIndex(getGuideChapters(locale), { basePath, locale }),
  );
}
