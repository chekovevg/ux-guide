type PageTocProps = {
  links: Array<{ id: string; title: string; depth?: number }>;
  activeId: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export function PageToc({
  links,
  activeId,
  compact = false,
  onNavigate,
}: PageTocProps) {
  if (!links.length) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className={compact ? "" : ""}
    >
      <p className="mb-4 text-[16px] font-semibold leading-[26px] text-[var(--foreground)]">
        On this page
      </p>
      <ol className="flex flex-col gap-0">
        {links.map((link) => {
          const active = link.id === activeId;
          const nested = (link.depth ?? 0) > 0;

          return (
            <li key={link.id}>
              <a
                className={[
                  "block border-l py-3 pl-4 pr-3 text-[14px] leading-5 transition-colors",
                  nested ? "pl-8" : "",
                  active
                    ? "border-[var(--toc-active)] text-[var(--toc-active)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--toc-active)] hover:text-[var(--toc-active)]",
                ].join(" ")}
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
