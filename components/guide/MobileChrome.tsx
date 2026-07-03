"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  getGuideChapterHref,
  getNavigationLabel,
} from "./mobileContents.mjs";
import {
  GuideLanguageMenu,
  GuideThemeToggle,
} from "./GuideNavigation";
import type {
  GuideLanguageLink,
  GuideNavigationGroup,
  GuideSearchItem,
  GuideThemeMode,
} from "./types";

type PageTocLink = {
  depth?: number;
  id: string;
  title: string;
};

export function MobileContentsSection({
  activeId,
  label,
  links,
  open,
  onNavigate,
}: {
  activeId: string;
  label: string;
  links: PageTocLink[];
  open: boolean;
  onNavigate: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <section
      aria-label={label}
      className="mobile-contents-section"
    >
      <nav aria-label={label}>
        <ol className="mobile-contents-list">
          {links.map((item) => (
            <li key={item.id}>
              <a
                aria-current={item.id === activeId ? "location" : undefined}
                className="mobile-contents-link"
                data-active={item.id === activeId ? "true" : undefined}
                data-depth={item.depth ?? 0}
                href={`#${item.id}`}
                onClick={onNavigate}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}

export function MobileSearchPanel({
  items,
  open,
  onClose,
}: {
  items: GuideSearchItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => getSearchResults(items, query), [items, query]);

  if (!open) {
    return null;
  }

  return (
    <section
      aria-label="Search the guide"
      aria-modal="true"
      className="mobile-search-panel"
      role="dialog"
    >
      <label className="mobile-search-control">
        <span className="sr-only">Search</span>
        <Search aria-hidden="true" className="size-5 shrink-0" />
        <input
          autoFocus
          className="mobile-search-input"
          placeholder="Search guide"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className="mobile-search-close"
          aria-label="Close search"
          type="button"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </label>
      <div className="mobile-search-results">
        {results.length ? (
          results.map((item) => (
            <a
              key={`${item.type}-${item.href}`}
              className="mobile-search-result"
              href={item.href}
              onClick={() => {
                setQuery("");
                onClose();
              }}
            >
              <span>{item.label}</span>
              <small>{item.eyebrow}</small>
            </a>
          ))
        ) : (
          <p className="mobile-search-empty">No results</p>
        )}
      </div>
    </section>
  );
}

export function MobileSiteMenu({
  basePath = "/guide",
  languageLinks,
  navigationGroups,
  open,
  themeMode,
  onClose,
  onThemeChange,
}: {
  basePath?: string;
  languageLinks: GuideLanguageLink[];
  navigationGroups: GuideNavigationGroup[];
  open: boolean;
  themeMode: GuideThemeMode;
  onClose: () => void;
  onThemeChange: (themeMode: GuideThemeMode) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <section
      aria-label="Guide navigation"
      aria-modal="true"
      className="mobile-site-menu"
      role="dialog"
    >
      <div className="mobile-site-menu-content">
        <nav aria-label="Guide chapters" className="mobile-guide-nav">
          {navigationGroups.map((group) => (
            <section className="mobile-guide-group" key={group.title}>
              <h2 className="mobile-guide-group-title">{group.title}</h2>
              <ol className="mobile-guide-list">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <a
                      aria-current={item.active ? "page" : undefined}
                      aria-disabled={!item.available ? true : undefined}
                      className="mobile-guide-link"
                      data-active={item.active ? "true" : undefined}
                      data-disabled={!item.available ? "true" : undefined}
                      href={item.available ? getGuideChapterHref(item.slug, basePath) : "#"}
                      onClick={(event) => {
                        if (!item.available) {
                          event.preventDefault();
                          return;
                        }

                        onClose();
                      }}
                    >
                      {getNavigationLabel(item.slug, item.title, item.navTitle)}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </nav>

        <footer className="mobile-site-footer">
          <GuideLanguageMenu languageLinks={languageLinks} />
          <GuideThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
        </footer>
      </div>
    </section>
  );
}

function getSearchResults(items: GuideSearchItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items.slice(0, 8);
  }

  return items
    .filter((item) => {
      const haystack = `${item.label} ${item.eyebrow}`.toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .slice(0, 12);
}
