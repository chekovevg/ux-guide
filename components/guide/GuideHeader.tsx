import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  PanelLeft,
  Search,
  X,
} from "lucide-react";

type GuideHeaderProps = {
  contentsOpen: boolean;
  currentTitle: string;
  menuOpen: boolean;
  searchOpen: boolean;
  onContents: () => void;
  onMenu: () => void;
  onSearch: () => void;
};

export function GuideHeader({
  contentsOpen,
  currentTitle,
  menuOpen,
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
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
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
            aria-label={menuOpen ? "Close guide navigation" : "Open guide navigation"}
            aria-expanded={menuOpen}
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
        <button
          className="guide-header-nav-panel"
          aria-label="Open page contents"
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
      ) : null}
    </header>
  );
}
