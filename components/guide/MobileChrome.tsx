"use client";

import { useRef } from "react";
import type * as React from "react";
import { X } from "lucide-react";
import { getGuideCopy } from "./guideCopy";
import { getMobileContentsItems } from "./mobileContents.mjs";
import {
  GuideLanguageMenu,
  GuideThemeToggle,
} from "./GuideNavigation";
import type {
  GuideLanguageLink,
  GuideNavigationGroup,
  GuideThemeMode,
} from "./types";
import { useModalDialog } from "./useModalDialog";

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

export function MobileSiteMenu({
  backgroundRef,
  basePath = "/guide",
  languageLinks,
  locale,
  navigationGroups,
  open,
  themeMode,
  onClose,
  onThemeChange,
}: {
  backgroundRef: React.RefObject<HTMLElement | null>;
  basePath?: string;
  languageLinks: GuideLanguageLink[];
  locale: "ru" | "en";
  navigationGroups: GuideNavigationGroup[];
  open: boolean;
  themeMode: GuideThemeMode;
  onClose: () => void;
  onThemeChange: (themeMode: GuideThemeMode) => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copy = getGuideCopy(locale);
  const menuTitle = copy.menu.title;
  const closeLabel = copy.menu.close;
  const navigationItems = getMobileContentsItems(
    navigationGroups.flatMap((group) => group.items),
    basePath,
  );

  useModalDialog({
    open,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
    backgroundRef,
  });

  if (!open) {
    return null;
  }

  return (
    <section
      aria-label={menuTitle}
      aria-modal="true"
      className="mobile-site-menu"
      ref={dialogRef}
      role="dialog"
    >
      <div className="mobile-site-menu-content">
        <div className="mobile-site-menu-header">
          <p className="mobile-site-menu-title">{menuTitle}</p>
          <button
            ref={closeButtonRef}
            className="mobile-site-menu-close"
            type="button"
            onClick={onClose}
          >
            <span className="sr-only">{closeLabel}</span>
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav aria-label={menuTitle} className="mobile-guide-nav">
          <ol className="mobile-guide-list">
            {navigationItems.map((item) => (
              <li key={item.slug}>
                <a
                  aria-current={item.active ? "page" : undefined}
                  aria-disabled={!item.available ? true : undefined}
                  className="mobile-guide-link"
                  data-active={item.active ? "true" : undefined}
                  data-disabled={!item.available ? "true" : undefined}
                  href={item.href}
                  onClick={(event) => {
                    if (!item.available) {
                      event.preventDefault();
                      return;
                    }

                    onClose();
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <footer className="mobile-site-footer">
          <GuideLanguageMenu languageLinks={languageLinks} />
          <GuideThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
        </footer>
      </div>
    </section>
  );
}
