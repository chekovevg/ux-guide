import Image from "next/image";
import {
  Moon,
  PanelLeft,
  Search,
  Sun,
} from "lucide-react";
import type {
  GuideLanguageLink,
  GuideNavigationGroup,
  GuideThemeMode,
} from "./types";
import {
  getGuideChapterHref,
  getNavigationLabel,
} from "./mobileContents.mjs";
import { GuideButton, GuideIconButton, GuideKbd, GuideSearchTrigger } from "./GuideUi";

export { getNavigationLabel };

type GuideNavigationProps = {
  navigationGroups: GuideNavigationGroup[];
  basePath?: string;
  languageLinks: GuideLanguageLink[];
  sidebarCollapsed: boolean;
  themeMode: GuideThemeMode;
  onSearch?: () => void;
  onThemeChange: (themeMode: GuideThemeMode) => void;
  onToggleSidebar: () => void;
};

export function GuideNavigation({
  navigationGroups,
  basePath = "/guide",
  languageLinks,
  sidebarCollapsed,
  themeMode,
  onSearch,
  onThemeChange,
  onToggleSidebar,
}: GuideNavigationProps) {
  if (sidebarCollapsed) {
    return (
      <div className="guide-sidebar-collapsed-rail">
        <GuideIconButton
          className="guide-sidebar-icon-button"
          aria-label="Expand sidebar"
          onClick={onToggleSidebar}
        >
          <PanelLeft aria-hidden="true" className="size-[18px]" />
        </GuideIconButton>
        <GuideIconButton
          className="guide-sidebar-icon-button"
          aria-label="Search guide"
          onClick={onSearch}
        >
          <Search aria-hidden="true" className="size-[18px]" />
        </GuideIconButton>
      </div>
    );
  }

  const navigationItems = navigationGroups.flatMap((group) => group.items);

  return (
    <div className="guide-sidebar">
      <div className="guide-sidebar-top">
        <a className="guide-sidebar-brand" href="#top" aria-label="Wynde guide home">
          <Image
            alt="Wynde guide"
            className="guide-sidebar-logo"
            height="28"
            src="/figma/logo-desktop.svg"
            width="157"
            priority
          />
        </a>
        <GuideIconButton
          className="guide-sidebar-icon-button"
          aria-label="Collapse sidebar"
          onClick={onToggleSidebar}
        >
          <PanelLeft aria-hidden="true" className="size-4" />
        </GuideIconButton>
      </div>

      <div className="guide-sidebar-search-wrap">
        <GuideSearchTrigger
          className="search-control sidebar-search"
          aria-label="Search guide"
          onClick={onSearch}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">Search</span>
          </span>
          <GuideKbd className="sidebar-search-kbd">Ctrl K</GuideKbd>
        </GuideSearchTrigger>
      </div>

      <nav aria-label="Guide chapters" className="guide-sidebar-nav">
        <ol className="guide-nav-list">
          {navigationItems.map((item) => (
            <li key={item.slug}>
              <a
                aria-current={item.active ? "page" : undefined}
                aria-disabled={!item.available ? true : undefined}
                className="guide-nav-link"
                data-active={item.active ? "true" : undefined}
                data-disabled={!item.available ? "true" : undefined}
                href={item.available ? getGuideChapterHref(item.slug, basePath) : "#"}
                onClick={(event) => {
                  if (!item.available) {
                    event.preventDefault();
                  }
                }}
              >
                <span className="guide-nav-link-label">
                  {getNavigationLabel(item.slug, item.title, item.navTitle)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <GuideSidebarFooter
        languageLinks={languageLinks}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}

export function GuideThemeToggle({
  themeMode,
  onThemeChange,
}: {
  themeMode: GuideThemeMode;
  onThemeChange: (themeMode: GuideThemeMode) => void;
}) {
  return (
    <div className="theme-toggle" aria-label="Theme">
      <GuideButton
        aria-label="Use light theme"
        className="theme-toggle-button"
        data-active={themeMode === "light" ? "true" : undefined}
        onClick={() => onThemeChange("light")}
      >
        <Sun aria-hidden="true" className="size-3.5" />
      </GuideButton>
      <GuideButton
        aria-label="Use dark theme"
        className="theme-toggle-button"
        data-active={themeMode === "dark" ? "true" : undefined}
        onClick={() => onThemeChange("dark")}
      >
        <Moon aria-hidden="true" className="size-3.5" />
      </GuideButton>
    </div>
  );
}

export function GuideLanguageMenu({
  languageLinks,
}: {
  languageLinks: GuideLanguageLink[];
}) {
  const activeLanguage = languageLinks.find((link) => link.active) ?? languageLinks[0];

  return (
    <details className="language-menu">
      <summary className="language-menu-button" aria-label="Choose language">
        <span>{activeLanguage?.label ?? "RU"}</span>
      </summary>
      <div className="language-menu-popover">
        {languageLinks.map((link) => (
          <a
            key={link.locale}
            aria-current={link.active ? "page" : undefined}
            className="language-menu-link"
            data-active={link.active ? "true" : undefined}
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </div>
    </details>
  );
}

function GuideSidebarFooter({
  languageLinks,
  themeMode,
  onThemeChange,
}: {
  languageLinks: GuideLanguageLink[];
  themeMode: GuideThemeMode;
  onThemeChange: (themeMode: GuideThemeMode) => void;
}) {
  return (
    <footer className="guide-sidebar-footer">
      <GuideLanguageMenu languageLinks={languageLinks} />
      <GuideThemeToggle themeMode={themeMode} onThemeChange={onThemeChange} />
    </footer>
  );
}
