import Image from "next/image";
import { Check, Link as LucideLink } from "lucide-react";
import type { ContentBlock } from "./types";

export function ArticleExampleCard({
  block,
  blockId,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  blockId: string;
}) {
  const textParagraphs = block.text
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean);

  return (
    <aside id={blockId} className="article-example-card">
      <div className="article-example-card-stack">
        {block.title ? <p className="article-example-card-title">{block.title}</p> : null}
        {textParagraphs.map((text, index) => (
          <p key={`${blockId}-text-${index + 1}`} className="article-example-card-text">
            {text}
          </p>
        ))}
        {block.href && block.linkLabel ? (
          <a className="article-link article-example-card-link" href={block.href}>
            {block.linkLabel}
          </a>
        ) : null}
      </div>
    </aside>
  );
}

export function ArticleCallout({
  block,
  blockId,
  calloutBadgeLabel,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  blockId: string;
  calloutBadgeLabel: string;
}) {
  const isTip = block.variant === "tip";
  const linkHref = block.href ?? `#${blockId}`;
  const textParagraphs = block.text
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean);

  return (
    <aside id={blockId} className={`article-callout article-callout-${block.variant}`}>
      <div className="article-callout-content">
        <div className={isTip ? "article-callout-stack article-callout-stack-tip" : "article-callout-stack"}>
          {isTip ? <p className="article-callout-badge">{calloutBadgeLabel}</p> : null}
          {block.title ? <p className="article-callout-title">{block.title}</p> : null}
          {textParagraphs.map((text, index) => (
            <p key={`${blockId}-text-${index + 1}`} className="article-callout-text">
              {text}
            </p>
          ))}
          {block.href && block.linkLabel ? (
            <a className="article-link article-callout-link" href={block.href}>
              {block.linkLabel}
            </a>
          ) : null}
        </div>
      </div>
      <a className="article-callout-anchor" href={linkHref} aria-label="Link to callout">
        <LucideLink aria-hidden="true" className="size-3.5" />
      </a>
    </aside>
  );
}

export function ArticleChecklist({
  title,
  items,
  accentItemIndex,
}: {
  title?: string;
  items: string[];
  accentItemIndex?: number;
}) {
  return (
    <div className="article-checklist">
      {title ? <h3 className="article-checklist-title">{title}</h3> : null}
      <ul className="article-checklist-list">
        {items.map((item, index) => (
          <li key={item} className="article-checklist-item">
            <span className="article-checklist-icon" aria-hidden="true">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span
              className="article-checklist-text"
              data-accent={index === accentItemIndex ? "true" : undefined}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleQuote({
  block,
}: {
  block: Extract<ContentBlock, { type: "quote" }>;
}) {
  const authorName = block.authorName ?? block.byline;
  const authorInitial = authorName?.trim().charAt(0).toUpperCase();

  return (
    <blockquote className="article-quote">
      <p className="article-quote-text">{block.text}</p>
      {authorName ? (
        <footer className="article-quote-author">
          {block.authorImage ? (
            <Image
              alt={block.authorImage.alt}
              src={block.authorImage.src}
              width={46}
              height={46}
              className="article-quote-avatar"
            />
          ) : authorInitial ? (
            <span className="article-quote-avatar article-quote-avatar-placeholder" aria-hidden="true">
              {authorInitial}
            </span>
          ) : null}
          <div className="article-quote-author-text">
            <p className="article-quote-author-name">{authorName}</p>
            {block.authorTitle ? (
              <p className="article-quote-author-title">{block.authorTitle}</p>
            ) : null}
          </div>
        </footer>
      ) : null}
    </blockquote>
  );
}

export function ArticleTable({
  block,
  blockId,
}: {
  block: Extract<ContentBlock, { type: "table" }>;
  blockId: string;
}) {
  const showColumnHeaders = block.showColumnHeaders !== false;
  const rowHeaders = block.rowHeaders === true;
  const isWide = block.columns.length >= 5;
  const regionLabel = block.columns.filter(Boolean).join(", ");

  return (
    <div
      id={blockId}
      className="article-table"
      data-column-headers={showColumnHeaders ? "visible" : "hidden"}
      data-row-headers={rowHeaders ? "true" : undefined}
      data-wide={isWide ? "true" : undefined}
      role={isWide ? "region" : undefined}
      aria-label={isWide ? regionLabel : undefined}
      tabIndex={isWide ? 0 : undefined}
    >
      <table>
        <thead className={showColumnHeaders ? undefined : "sr-only"}>
          <tr>
            {block.columns.map((column, columnIndex) => {
              const isBlankCorner = rowHeaders && columnIndex === 0 && !column;

              return (
                <th
                  key={columnIndex}
                  scope={isBlankCorner ? undefined : "col"}
                  aria-hidden={isBlankCorner ? true : undefined}
                >
                  {column}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) =>
                rowHeaders && cellIndex === 0 ? (
                  <th
                    key={`${rowIndex}-${cellIndex}`}
                    scope="row"
                    className="article-table-row-header"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
