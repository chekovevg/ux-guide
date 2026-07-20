import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  PanelLeft,
  Search,
  X,
} from "lucide-react";

type GuideHeaderProps = {
  closeMenuLabel: string;
  closeSearchLabel: string;
  contentsOpen: boolean;
  currentTitle: string;
  hasContents: boolean;
  menuLabel: string;
  menuOpen: boolean;
  pageContentsLabel: string;
  searchLabel: string;
  searchOpen: boolean;
  onContents: () => void;
  onMenu: () => void;
  onSearch: () => void;
};

export function GuideHeader({
  closeMenuLabel,
  closeSearchLabel,
  contentsOpen,
  currentTitle,
  hasContents,
  menuLabel,
  menuOpen,
  pageContentsLabel,
  searchLabel,
  searchOpen,
  onContents,
  onMenu,
  onSearch,
}: GuideHeaderProps) {
  return (
    <header className="guide-header">
      <div className="guide-header-inner">
        <a
          className="guide-header-brand"
          href="#top"
          aria-label="Wynde guide home"
        >
          <Image
            alt="Wynde guide"
            className="guide-header-logo guide-header-logo-mobile"
            height="23"
            src="/figma/logo-mobile.svg"
            width="128"
            priority
          />
        </a>

        <div className="guide-header-actions">
          <button
            className="icon-button"
            aria-label={searchOpen ? closeSearchLabel : searchLabel}
            aria-expanded={searchOpen}
            data-guide-search-trigger=""
            type="button"
            onClick={onSearch}
          >
            {searchOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Search aria-hidden="true" className="size-5" />
            )}
          </button>
          <button
            className="icon-button"
            aria-label={menuOpen ? closeMenuLabel : menuLabel}
            aria-expanded={menuOpen}
            data-guide-menu-return-focus=""
            type="button"
            onClick={onMenu}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <PanelLeft aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>
      {!menuOpen && !searchOpen ? (
        hasContents ? (
          <button
            className="guide-header-nav-panel"
            aria-label={pageContentsLabel}
            aria-expanded={contentsOpen}
            type="button"
            onClick={onContents}
          >
            <span className="guide-header-nav-dot" aria-hidden="true" />
            <span>{currentTitle}</span>
            {contentsOpen ? (
              <ChevronUp aria-hidden="true" className="size-4" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-4" />
            )}
          </button>
        ) : (
          <div
            className="guide-header-nav-panel"
            data-static="true"
            aria-label={currentTitle}
          >
            <span className="guide-header-nav-dot" aria-hidden="true" />
            <span>{currentTitle}</span>
          </div>
        )
      ) : null}
    </header>
  );
}
