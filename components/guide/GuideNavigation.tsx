import { Search } from "lucide-react";
import type { GuideNavigationItem } from "./types";
import { getNavigationLabel } from "./mobileContents.mjs";

export { getNavigationLabel };

type GuideNavigationProps = {
  navigation: GuideNavigationItem[];
  compact?: boolean;
  onSearch?: () => void;
};

export function GuideNavigation({
  navigation,
  compact = false,
  onSearch,
}: GuideNavigationProps) {
  return (
    <nav
      aria-label="Guide chapters"
      className={
        compact ? "" : "px-6 pb-10 pl-6 pr-8 pt-5"
      }
    >
      {!compact ? (
        <button
          className="search-control sidebar-search mb-11"
          aria-label="Search guide"
          onClick={onSearch}
        >
          <span className="flex items-center gap-3 truncate">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <span>Search guide</span>
          </span>
          <kbd className="shrink-0 text-[14px] text-[var(--figma-color-grays-800)]">
            K
          </kbd>
        </button>
      ) : null}
      <ol className="flex flex-col gap-1">
        {navigation.map((item) => (
          <li key={item.slug}>
            <a
              aria-current={item.active ? "page" : undefined}
              aria-disabled={!item.available ? true : undefined}
              className={[
                "group flex min-h-10 items-center rounded-[10px] px-3 py-2.5 text-[14px] leading-5 transition-colors",
                item.active
                  ? "bg-[var(--figma-color-grays-200)] text-[var(--foreground)]"
                  : item.available
                    ? "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                    : "cursor-not-allowed text-[var(--muted)] opacity-65",
              ].join(" ")}
              href={item.available ? `/guide/${item.slug}` : "#"}
              onClick={(event) => {
                if (!item.available) {
                  event.preventDefault();
                }
              }}
            >
              <span>{getNavigationLabel(item.slug, item.title)}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
