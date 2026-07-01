import {
  Bookmark,
  Info,
  Menu,
  Search,
  X,
} from "lucide-react";
import { getMobileContentsItems } from "./mobileContents.mjs";
import type { GuideNavigationItem } from "./types";

export function MobileContentsTrigger({
  open,
  onOpen,
}: {
  open: boolean;
  onOpen: () => void;
}) {
  if (open) {
    return null;
  }

  return (
    <button
      className="mobile-contents-trigger"
      aria-label="Open contents"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <Menu aria-hidden="true" className="size-5" />
    </button>
  );
}

export function MobileContentsSection({
  open,
  navigation,
  onClose,
}: {
  open: boolean;
  navigation: GuideNavigationItem[];
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  const items = getMobileContentsItems(navigation);

  return (
    <section
      aria-label="Contents"
      aria-modal="true"
      className="mobile-contents-section"
      role="dialog"
    >
      <nav aria-label="Guide chapters">
        <ol className="mobile-contents-list">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                aria-current={item.active ? "page" : undefined}
                aria-disabled={!item.available ? true : undefined}
                className="mobile-contents-link"
                data-active={item.active ? "true" : undefined}
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
      <div className="mobile-contents-close-row">
        <button
          className="mobile-contents-close"
          aria-label="Close contents"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
    </section>
  );
}

export function MobileSearchPanel({
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
      <p className="mobile-search-empty">No recent searches</p>
    </section>
  );
}

export function MobileSiteMenu({
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
      aria-label="Navigation menu"
      aria-modal="true"
      className="mobile-site-menu"
      role="dialog"
    >
      <div className="mobile-site-menu-content">
        <div>
          <div className="mobile-site-actions">
            <div className="mobile-site-bookmark">
              <Bookmark aria-hidden="true" className="size-5" />
              <span>Bookmarks</span>
            </div>
            <div className="mobile-site-info">
              <Info aria-hidden="true" className="size-2.5" />
              <span>Log in to use</span>
            </div>
          </div>
          <div className="mobile-site-auth">
            <a className="button-secondary" href="/login" onClick={onClose}>
              Log in
            </a>
            <a className="button-primary" href="/signup" onClick={onClose}>
              Start for free
            </a>
          </div>
        </div>

        <footer className="mobile-site-footer">
          <div className="mobile-site-social">
            <a href="https://www.linkedin.com" aria-label="LinkedIn">
              <span aria-hidden="true">in</span>
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <span aria-hidden="true">X</span>
            </a>
          </div>
          <div className="mobile-site-footer-links">
            <a href="/terms" onClick={onClose}>
              Terms of Service
            </a>
            <a href="/privacy" onClick={onClose}>
              Privacy Policy
            </a>
          </div>
          <p>© 2025 Pathway Research Solutions Ltd</p>
        </footer>
      </div>
    </section>
  );
}
