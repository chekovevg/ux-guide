import Image from "next/image";
import { Menu, Search, X } from "lucide-react";

type GuideHeaderProps = {
  currentTitle: string;
  menuOpen: boolean;
  searchOpen: boolean;
  onContents: () => void;
  onMenu: () => void;
  onSearch: () => void;
};

export function GuideHeader({
  currentTitle,
  menuOpen,
  searchOpen,
  onContents,
  onMenu,
  onSearch,
}: GuideHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 backdrop-blur lg:h-[60px]">
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
          />
          <Image
            alt="Wynde guide"
            className="guide-header-logo guide-header-logo-desktop"
            height="28"
            src="/figma/logo-desktop.svg"
            width="157"
          />
        </a>

        <div className="guide-header-search-area">
          <button
            className="search-control header-search"
            aria-label="Search guide"
            aria-expanded={searchOpen}
            data-active={searchOpen ? "true" : undefined}
            onClick={onSearch}
          >
            <span className="flex items-center gap-3 font-normal text-[var(--muted)]">
              <Search aria-hidden="true" className="size-4" />
              <span>Search guide</span>
            </span>
            <kbd className="text-[14px] text-[var(--figma-color-grays-800)]">K</kbd>
          </button>
        </div>

        <div className="guide-header-auth">
          <a className="button-secondary" href="/login">
            Log in
          </a>
          <a className="button-primary" href="/signup">
            Start for free
          </a>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            className="icon-button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={onSearch}
          >
            <Search aria-hidden="true" className="size-5" />
          </button>
          <button
            className="icon-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={onMenu}
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>
      {!menuOpen && !searchOpen ? (
        <button
          className="guide-header-nav-panel lg:hidden"
          aria-label="Open contents"
          onClick={onContents}
        >
          <span>{currentTitle}</span>
        </button>
      ) : null}
    </header>
  );
}
