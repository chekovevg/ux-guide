import type { GuideNavigationItem } from "./types";

export type MobileContentsItem = GuideNavigationItem & {
  active: boolean;
  href: string;
  label: string;
};

export declare function getNavigationLabel(
  slug: string,
  fallback: string,
): string;

export declare function getGuideChapterHref(
  slug: string,
  basePath?: string,
): string;

export declare function getMobileContentsItems(
  navigation: readonly GuideNavigationItem[],
  basePath?: string,
): MobileContentsItem[];
