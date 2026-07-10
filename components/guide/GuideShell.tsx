"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ArticleContent } from "./ArticleContent";
import { GuideHeader } from "./GuideHeader";
import { getNavigationLabel, GuideNavigation } from "./GuideNavigation";
import {
  MobileContentsSection,
  MobileSearchPanel,
  MobileSiteMenu,
} from "./MobileChrome";
import { GuideButton } from "./GuideUi";
import { PageToc } from "./PageToc";
import type {
  GuideChapter,
  GuideLanguageLink,
  GuideNavigationGroup,
  GuideNavigationItem,
  GuideSearchItem,
  GuideSection,
  GuideThemeMode,
} from "./types";

type GuideShellProps = {
  chapter: GuideChapter;
  chapterBasePath?: string;
  languageLinks: GuideLanguageLink[];
  navigation: GuideNavigationItem[];
  navigationGroups: GuideNavigationGroup[];
};

export function GuideShell({
  chapter,
  chapterBasePath = "/guide",
  languageLinks,
  navigation,
  navigationGroups,
}: GuideShellProps) {
  const [activeId, setActiveId] = useState(chapter.sections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeMode, setThemeMode] = useState<GuideThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("wynde-guide-theme");

    return storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : "light";
  });

  const sectionLinks = useMemo(
    () => flattenSectionLinks(chapter.sections),
    [chapter.sections],
  );
  const activeLocale = languageLinks.find((link) => link.active)?.locale ?? "ru";
  const isEnglish = activeLocale === "en";
  const pageTocTitle = isEnglish ? "On this page" : "На этой странице";
  const chapterSearchLabel = isEnglish ? "Chapter" : "Глава";
  const activeLinkIndex = sectionLinks.findIndex((item) => item.id === activeId);
  const activeLink =
    activeLinkIndex >= 0 ? sectionLinks[activeLinkIndex] : sectionLinks[0];
  const activeSectionTitle =
    activeLink?.title ??
    getNavigationLabel(chapter.slug, chapter.title, chapter.navTitle);
  const tocProgress = sectionLinks.length
    ? ((Math.max(activeLinkIndex, 0) + 1) / sectionLinks.length) * 100
    : 0;
  const groupedNavigation = useMemo(
    () => (navigationGroups.length ? navigationGroups : [{ title: "Guide", items: navigation }]),
    [navigation, navigationGroups],
  );
  const flatNavigation = useMemo(
    () => flattenNavigationGroups(groupedNavigation),
    [groupedNavigation],
  );
  const chapterNavigation = useMemo(
    () => getAdjacentNavigation(flatNavigation),
    [flatNavigation],
  );
  const chapterNavLabel = getNavigationLabel(
    chapter.slug,
    chapter.title,
    chapter.navTitle,
  );
  const searchItems = useMemo(
    () => [
      ...flatNavigation
        .filter((item) => item.available)
        .map((item) => ({
          eyebrow: chapterSearchLabel,
          href: getChapterHref(item.slug, chapterBasePath),
          label: getNavigationLabel(item.slug, item.title, item.navTitle),
          type: "chapter" as const,
        })),
      ...sectionLinks.map((item) => ({
        eyebrow: chapterNavLabel,
        href: `#${item.id}`,
        label: item.title,
        type: "section" as const,
      })),
    ],
    [chapterBasePath, chapterNavLabel, chapterSearchLabel, flatNavigation, sectionLinks],
  );

  useEffect(() => {
    const nodes = sectionLinks
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.45],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionLinks]);

  useEffect(() => {
    if (!menuOpen && !contentsOpen && !searchOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setContentsOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, contentsOpen, searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("wynde-guide-theme", themeMode);
  }, [themeMode]);

  return (
    <div className="guide-root">
      <GuideHeader
        contentsOpen={contentsOpen}
        currentTitle={activeSectionTitle}
        menuOpen={menuOpen}
        searchOpen={searchOpen}
        onContents={() => {
          setMenuOpen(false);
          setSearchOpen(false);
          setContentsOpen((value) => !value);
        }}
        onMenu={() => {
          setContentsOpen(false);
          setSearchOpen(false);
          setMenuOpen((value) => !value);
        }}
        onSearch={() => {
          setContentsOpen(false);
          setMenuOpen(false);
          setSearchOpen((value) => !value);
        }}
      />
      {searchOpen ? (
        <GuideSearchPanel
          items={searchItems}
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      ) : null}

      <main
        className="guide-shell guide-grid relative"
        data-sidebar-collapsed={sidebarCollapsed ? "true" : undefined}
      >
        <aside
          className="guide-sidebar-shell"
          data-collapsed={sidebarCollapsed ? "true" : undefined}
        >
          <GuideNavigation
            basePath={chapterBasePath}
            languageLinks={languageLinks}
            navigationGroups={groupedNavigation}
            sidebarCollapsed={sidebarCollapsed}
            themeMode={themeMode}
            onSearch={() => setSearchOpen(true)}
            onThemeChange={setThemeMode}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
          />
        </aside>

        <PageTocDropdown
          activeId={activeId}
          activeTitle={activeSectionTitle}
          links={sectionLinks}
          open={contentsOpen}
          progress={tocProgress}
          title={pageTocTitle}
          onNavigate={() => setContentsOpen(false)}
          onToggle={() => {
            setMenuOpen(false);
            setSearchOpen(false);
            setContentsOpen((value) => !value);
          }}
        />

        <article className="guide-article-area">
          <div className="guide-article w-full">
            <ArticleContent chapter={chapter} />
            <ArticleChapterNavigation
              basePath={chapterBasePath}
              next={chapterNavigation.next}
              previous={chapterNavigation.previous}
            />
          </div>
        </article>

        <aside className="guide-page-toc-shell">
          <PageToc links={sectionLinks} activeId={activeId} title={pageTocTitle} />
        </aside>
      </main>

      <MobileContentsSection
        activeId={activeId}
        label={pageTocTitle}
        links={sectionLinks}
        open={contentsOpen}
        onNavigate={() => setContentsOpen(false)}
      />

      <MobileSiteMenu
        basePath={chapterBasePath}
        languageLinks={languageLinks}
        navigationGroups={groupedNavigation}
        open={menuOpen}
        themeMode={themeMode}
        onClose={() => setMenuOpen(false)}
        onThemeChange={setThemeMode}
      />

      <MobileSearchPanel
        items={searchItems}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

function PageTocDropdown({
  activeId,
  activeTitle,
  links,
  open,
  progress,
  title,
  onNavigate,
  onToggle,
}: {
  activeId: string;
  activeTitle: string;
  links: Array<{ id: string; title: string; depth: number }>;
  open: boolean;
  progress: number;
  title: string;
  onNavigate: () => void;
  onToggle: () => void;
}) {
  if (!links.length) {
    return null;
  }

  const progressStyle = {
    "--guide-toc-progress": `${Math.round(progress)}%`,
  } as CSSProperties;

  return (
    <section className="guide-top-toc-shell" aria-label={title}>
      <GuideButton
        aria-controls="guide-top-toc-panel"
        aria-expanded={open}
        className="guide-top-toc-trigger"
        onClick={onToggle}
      >
        <span
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className="guide-top-toc-progress"
          role="progressbar"
          style={progressStyle}
        />
        <span className="guide-top-toc-label">{activeTitle}</span>
        {open ? (
          <ChevronUp aria-hidden="true" className="size-4" />
        ) : (
          <ChevronDown aria-hidden="true" className="size-4" />
        )}
      </GuideButton>

      {open ? (
        <div className="guide-top-toc-panel" id="guide-top-toc-panel">
          <PageToc
            activeId={activeId}
            compact
            links={links}
            title={title}
            onNavigate={onNavigate}
          />
        </div>
      ) : null}
    </section>
  );
}

function GuideSearchPanel({
  items,
  open,
  onClose,
}: {
  items: GuideSearchItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();

  const results = useMemo(
    () => (normalizedQuery ? getSearchResults(items, normalizedQuery) : []),
    [items, normalizedQuery],
  );

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <section
      aria-label="Search the guide"
      aria-modal="true"
      className="search-dialog-backdrop"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="search-dialog"
        data-has-query={normalizedQuery ? "true" : undefined}
        role="document"
      >
        <label className="search-dialog-control">
          <span className="sr-only">Search</span>
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <input
            autoFocus
            className="search-dialog-input"
            placeholder="Search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <GuideButton
            className="search-dialog-escape"
            aria-label="Close search"
            onClick={handleClose}
          >
            ESC
          </GuideButton>
        </label>

        {normalizedQuery ? (
          <div className="search-dialog-results">
            {results.length ? (
              results.map((item) => (
                <a
                  key={`${item.type}-${item.href}`}
                  className="search-dialog-result"
                  href={item.href}
                  onClick={handleClose}
                >
                  <span>{item.label}</span>
                  <small>{item.eyebrow}</small>
                </a>
              ))
            ) : (
              <p className="search-dialog-empty">No results</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ArticleChapterNavigation({
  basePath,
  next,
  previous,
}: {
  basePath: string;
  next?: GuideNavigationItem;
  previous?: GuideNavigationItem;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav aria-label="Chapter navigation" className="article-chapter-nav">
      {previous ? (
        <a className="article-chapter-card" href={getChapterHref(previous.slug, basePath)}>
          <span className="article-chapter-title-row">
            <ChapterNavIcon direction="previous" />
            <span>{getNavigationLabel(previous.slug, previous.title, previous.navTitle)}</span>
          </span>
          {previous.description ? (
            <span className="article-chapter-description">{previous.description}</span>
          ) : null}
        </a>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <a className="article-chapter-card article-chapter-card-next" href={getChapterHref(next.slug, basePath)}>
          <span className="article-chapter-title-row article-chapter-title-row-next">
            <span>{getNavigationLabel(next.slug, next.title, next.navTitle)}</span>
            <ChapterNavIcon direction="next" />
          </span>
          {next.description ? (
            <span className="article-chapter-description">{next.description}</span>
          ) : null}
        </a>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

function ChapterNavIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className="article-chapter-icon"
      data-direction={direction}
      fill="none"
      height="16"
      style={direction === "next" ? { transform: "rotate(180deg)" } : undefined}
      viewBox="0 0 13 13"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.92208 2.51074L4.54471 5.28434C4.30295 5.56639 4.30295 5.9826 4.54471 6.26465L6.92208 9.03825"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="0.753174"
      />
    </svg>
  );
}

function flattenSectionLinks(
  sections: GuideSection[],
  depth = 0,
): Array<{ id: string; title: string; depth: number }> {
  return sections.flatMap((section) => [
    { id: section.id, title: section.title, depth },
    ...flattenSectionLinks(section.children ?? [], depth + 1),
  ]);
}

function flattenNavigationGroups(groups: GuideNavigationGroup[]) {
  return groups.flatMap((group) => group.items);
}

function getAdjacentNavigation(items: GuideNavigationItem[]) {
  const availableItems = items.filter((item) => item.available);
  const activeIndex = availableItems.findIndex((item) => item.active);

  if (activeIndex < 0) {
    return {};
  }

  return {
    previous: availableItems[activeIndex - 1],
    next: availableItems[activeIndex + 1],
  };
}

function getChapterHref(slug: string, basePath = "/guide") {
  const normalizedBasePath = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;

  return `${normalizedBasePath}/${slug}`;
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
