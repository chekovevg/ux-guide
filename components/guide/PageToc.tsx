type PageTocProps = {
  links: Array<{ id: string; title: string; depth?: number }>;
  activeId: string;
  title: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export function PageToc({
  links,
  activeId,
  title,
  compact = false,
  onNavigate,
}: PageTocProps) {
  if (!links.length) {
    return null;
  }

  return (
    <nav
      aria-label={title}
      className={compact ? "page-toc page-toc-compact" : "page-toc"}
    >
      {!compact ? (
        <p className="page-toc-title">
          {title}
        </p>
      ) : null}
      <ol className="page-toc-list">
        {links.map((link) => {
          const active = link.id === activeId;
          const nested = (link.depth ?? 0) > 0;

          return (
            <li key={link.id}>
              <a
                aria-current={active ? "location" : undefined}
                className="page-toc-link"
                data-active={active ? "true" : undefined}
                data-nested={nested ? "true" : undefined}
                href={`#${link.id}`}
                onClick={onNavigate}
              >
                {link.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
