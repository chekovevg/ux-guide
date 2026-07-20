"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ArticleContent } from "./ArticleContent";
import { getGuideCopy } from "./guideCopy";
import { GuideHeader } from "./GuideHeader";
import { getNavigationLabel, GuideNavigation } from "./GuideNavigation";
import { GuideSearchDialog } from "./GuideSearchDialog";
import { MobileContentsSection, MobileSiteMenu } from "./MobileChrome";
import { PageToc } from "./PageToc";
import type {
  GuideChapter,
  GuideLanguageLink,
  GuideNavigationGroup,
  GuideNavigationItem,
  GuideSearchRecord,
  GuideSection,
  GuideThemeMode,
} from "./types";

type GuideShellProps = {
  chapter: GuideChapter;
  chapterBasePath?: string;
  languageLinks: GuideLanguageLink[];
  locale: "ru" | "en";
  navigation: GuideNavigationItem[];
  navigationGroups: GuideNavigationGroup[];
  searchIndex: GuideSearchRecord[];
};

export function GuideShell({
  chapter,
  chapterBasePath = "/guide",
  languageLinks,
  locale,
  navigation,
  navigationGroups,
  searchIndex,
}: GuideShellProps) {
  const appContentRef = useRef<HTMLDivElement>(null);
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
  const copy = getGuideCopy(locale);
  const pageTocTitle = copy.pageContents;
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
    if (!contentsOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContentsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [contentsOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setContentsOpen(false);
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    const onDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMenuOpen(false);
        setContentsOpen(false);
      }
    };

    desktopQuery.addEventListener("change", onDesktopChange);
    return () => desktopQuery.removeEventListener("change", onDesktopChange);
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div ref={appContentRef} className="guide-app-content">
        <GuideHeader
          closeMenuLabel={copy.menu.close}
          closeSearchLabel={copy.search.close}
          contentsOpen={contentsOpen}
          currentTitle={activeSectionTitle}
          menuLabel={copy.menu.title}
          menuOpen={menuOpen}
          pageContentsLabel={copy.pageContents}
          searchLabel={copy.search.label}
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
              navigationLabel={copy.menu.title}
              navigationGroups={groupedNavigation}
              searchLabel={copy.search.label}
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
      </div>

      {searchOpen ? (
        <GuideSearchDialog
          backgroundRef={appContentRef}
          index={searchIndex}
          locale={locale}
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      ) : null}

      <MobileSiteMenu
        backgroundRef={appContentRef}
        basePath={chapterBasePath}
        languageLinks={languageLinks}
        locale={locale}
        navigationGroups={groupedNavigation}
        open={menuOpen}
        themeMode={themeMode}
        onClose={() => setMenuOpen(false)}
        onThemeChange={setThemeMode}
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
      <button
        aria-controls="guide-top-toc-panel"
        aria-expanded={open}
        className="guide-top-toc-trigger"
        type="button"
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
      </button>

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
