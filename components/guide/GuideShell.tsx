"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ArticleContent } from "./ArticleContent";
import { GuideHeader } from "./GuideHeader";
import { getNavigationLabel, GuideNavigation } from "./GuideNavigation";
import {
  MobileContentsSection,
  MobileContentsTrigger,
  MobileSearchPanel,
  MobileSiteMenu,
} from "./MobileChrome";
import { PageToc } from "./PageToc";
import type { GuideChapter, GuideNavigationItem, GuideSection } from "./types";

type GuideShellProps = {
  chapter: GuideChapter;
  navigation: GuideNavigationItem[];
};

export function GuideShell({ chapter, navigation }: GuideShellProps) {
  const [activeId, setActiveId] = useState(chapter.sections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const sectionLinks = useMemo(
    () => flattenSectionLinks(chapter.sections),
    [chapter.sections],
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
    if (!menuOpen && !contentsOpen && !searchOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, contentsOpen, searchOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <GuideHeader
        currentTitle={getNavigationLabel(chapter.slug, chapter.title)}
        menuOpen={menuOpen}
        searchOpen={searchOpen}
        onContents={() => {
          setMenuOpen(false);
          setSearchOpen(false);
          setContentsOpen(true);
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
      <GuideSearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="guide-shell guide-grid relative">
        <aside className="guide-sidebar-shell">
          <GuideNavigation
            navigation={navigation}
            onSearch={() => setSearchOpen(true)}
          />
        </aside>

        <article className="guide-article-area">
          <div className="guide-article w-full">
            <ArticleContent chapter={chapter} />
          </div>
        </article>

        <aside className="guide-page-toc-shell">
          <PageToc links={sectionLinks} activeId={activeId} />
        </aside>
      </main>

      <MobileContentsTrigger
        open={contentsOpen}
        onOpen={() => {
          setMenuOpen(false);
          setSearchOpen(false);
          setContentsOpen(true);
        }}
      />

      <MobileContentsSection
        open={contentsOpen}
        navigation={navigation}
        onClose={() => setContentsOpen(false)}
      />

      <MobileSiteMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <MobileSearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

function GuideSearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <section
      aria-label="Search the guide"
      aria-modal="true"
      className="fixed inset-x-0 top-[60px] z-50 hidden border-b border-[var(--line)] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] lg:block"
      role="dialog"
    >
      <div className="mx-auto flex w-[min(554px,calc(100vw-48px))] flex-col gap-5 py-5">
        <div className="search-control" data-active="true">
          <Search aria-hidden="true" className="size-4 shrink-0 text-[var(--muted)]" />
          <input
            autoFocus
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--muted)]"
            placeholder="Search guide"
            type="search"
          />
          <button className="icon-button size-7" aria-label="Close search" onClick={onClose}>
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <p className="text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[var(--muted)]">
          No recent searches
        </p>
      </div>
    </section>
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
