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
        <button
          className="guide-sidebar-icon-button"
          aria-label="Expand sidebar"
          type="button"
          onClick={onToggleSidebar}
        >
          <PanelLeft aria-hidden="true" className="size-[18px]" />
        </button>
        <button
          className="guide-sidebar-icon-button"
          aria-label="Search guide"
          type="button"
          onClick={onSearch}
        >
          <Search aria-hidden="true" className="size-[18px]" />
        </button>
      </div>
    );
  }

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
        <button
          className="guide-sidebar-icon-button"
          aria-label="Collapse sidebar"
          type="button"
          onClick={onToggleSidebar}
        >
          <PanelLeft aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="guide-sidebar-search-wrap">
        <button
          className="search-control sidebar-search"
          aria-label="Search guide"
          type="button"
          onClick={onSearch}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">Search</span>
          </span>
          <kbd className="sidebar-search-kbd">Ctrl K</kbd>
        </button>
      </div>

      <nav aria-label="Guide chapters" className="guide-sidebar-nav">
        {navigationGroups.map((group) => (
          <section className="guide-nav-group" key={group.title}>
            <h2 className="guide-nav-group-title">{group.title}</h2>
            <ol className="guide-nav-list">
              {group.items.map((item) => (
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
                    <span className="guide-nav-link-label">{getNavigationLabel(item.slug, item.title)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ))}
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
      <button
        aria-label="Use light theme"
        className="theme-toggle-button"
        data-active={themeMode === "light" ? "true" : undefined}
        type="button"
        onClick={() => onThemeChange("light")}
      >
        <Sun aria-hidden="true" className="size-3.5" />
      </button>
      <button
        aria-label="Use dark theme"
        className="theme-toggle-button"
        data-active={themeMode === "dark" ? "true" : undefined}
        type="button"
        onClick={() => onThemeChange("dark")}
      >
        <Moon aria-hidden="true" className="size-3.5" />
      </button>
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
