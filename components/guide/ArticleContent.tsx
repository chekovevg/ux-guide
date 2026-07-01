import Image from "next/image";
import type { MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Link as LucideLink } from "lucide-react";
import type { ContentBlock, GuideChapter, GuideSection } from "./types";

export function ArticleContent({ chapter }: { chapter: GuideChapter }) {
  return (
    <>
      <Hero chapter={chapter} />
      {chapter.blocks?.length ? (
        <div className="article-block-stack mt-8">
          {chapter.blocks.map((block, index) => (
            <ContentBlockView
              key={`${chapter.slug}-${index}`}
              block={block}
              blockId={`${chapter.slug}-block-${index + 1}`}
              checklistTitle={block.type === "todoList" ? chapter.title : undefined}
              checklistAccentItemIndex={block.type === "todoList" ? 4 : undefined}
            />
          ))}
        </div>
      ) : null}
      {chapter.sections.map((section) => (
        <GuideSectionView key={section.id} section={section} />
      ))}
      {chapter.updatedAt ? (
        <ArticleUpdateStatus updatedAt={chapter.updatedAt} />
      ) : null}
    </>
  );
}

function Hero({ chapter }: { chapter: GuideChapter }) {
  return (
    <header id="top" className="scroll-mt-28">
      <h1 className="type-h1">{chapter.title}</h1>
      {chapter.subtitle ? (
        <p className="type-lead mt-[14px] text-[var(--muted)]">{chapter.subtitle}</p>
      ) : null}
      {chapter.coverImage ? (
        <figure className="mt-[52px] overflow-hidden rounded-[var(--radius-standard)] bg-[var(--subtle)]">
          <Image
            src={chapter.coverImage.src}
            alt={chapter.coverImage.alt}
            width={906}
            height={464}
            priority
            className="h-auto w-full"
          />
        </figure>
      ) : null}
    </header>
  );
}

function GuideSectionView({
  section,
  depth = 0,
}: {
  section: GuideSection;
  depth?: number;
}) {
  const Heading = section.headingLevel === 3 ? "h3" : "h2";
  const headingClass = section.headingLevel === 3 ? "type-h3" : "type-h2";
  const spacingClass = depth === 0 ? "pt-[84px]" : "pt-10";

  return (
    <section className={spacingClass}>
      {section.eyebrow ? (
        <p className="text-[12px] leading-none text-[var(--muted)]">{section.eyebrow}</p>
      ) : null}
      <Heading id={section.id} className={`article-heading scroll-mt-28 ${headingClass}`}>
        <a
          className="article-heading-link"
          href={`#${section.id}`}
          onClick={(event) => handleHeadingLinkClick(event, section.id)}
        >
          {section.title}
        </a>
        <HeadingLinkIcon />
      </Heading>
      {section.image ? (
        <figure className="mt-8 overflow-hidden rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--subtle)]">
          <Image
            src={section.image.src}
            alt={section.image.alt}
            width={680}
            height={348}
            className="h-auto w-full"
          />
        </figure>
      ) : null}
      {section.blocks.length ? (
        <div className="article-block-stack mt-8">
          {section.blocks.map((block, index) => (
            <ContentBlockView
              key={`${section.id}-${index}`}
              block={block}
              blockId={`${section.id}-block-${index + 1}`}
            />
          ))}
        </div>
      ) : null}
      {section.children?.length ? (
        <div className={depth === 0 ? "mt-10 flex flex-col gap-8" : "mt-8 flex flex-col gap-6"}>
          {section.children.map((child) => (
            <GuideSectionView key={child.id} section={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ContentBlockView({
  block,
  blockId,
  checklistTitle,
  checklistAccentItemIndex,
}: {
  block: ContentBlock;
  blockId: string;
  checklistTitle?: string;
  checklistAccentItemIndex?: number;
}) {
  switch (block.type) {
    case "lead":
      return <p className="type-lead">{block.text}</p>;
    case "paragraph":
      return (
        <p
          className="article-paragraph type-body"
          data-terminal-colon={block.text.trim().endsWith(":") ? "true" : undefined}
        >
          {block.text}
        </p>
      );
    case "callout":
      return <ArticleCallout block={block} blockId={blockId} />;
    case "bulletedList":
      return (
        <div className="article-paragraph-list">
          {block.items.map((item) => (
            <p key={item} className="article-paragraph type-body">
              {item}
            </p>
          ))}
        </div>
      );
    case "numberedList":
      return (
        <ol className="article-list article-list-numbered type-body">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "todoList":
      return (
        <ArticleChecklist
          title={checklistTitle}
          items={block.items}
          accentItemIndex={checklistAccentItemIndex}
        />
      );
    case "image":
      return (
        <figure className="overflow-hidden rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--subtle)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt ?? ""}
            className="h-auto w-full"
            loading="lazy"
          />
          {block.alt ? (
            <figcaption className="type-caption px-4 py-3 text-[var(--muted)]">
              {block.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    case "toggle":
      return (
        <details className="rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
          <summary className="cursor-pointer text-[15px] font-semibold">
            {block.title}
          </summary>
          {block.text ? (
            <p className="type-body mt-4">{block.text}</p>
          ) : null}
        </details>
      );
    case "rawTable":
      return (
        <div className="overflow-x-auto rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
          <p className="type-table whitespace-pre-wrap break-words text-[var(--foreground)]">
            {block.text}
          </p>
        </div>
      );
    case "steps":
      return (
        <div className="rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
          <h3 className="text-[17px] font-semibold">{block.title}</h3>
          <ol className="mt-5 flex flex-col gap-4">
            {block.items.map((item, index) => (
              <li key={item} className="type-body grid grid-cols-[28px_1fr] gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--foreground)] text-[12px] text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "checklist":
      return (
        <ArticleChecklist title={block.title} items={block.items} />
      );
    case "quote":
      return (
        <ArticleQuote block={block} />
      );
    case "table":
      return (
        <div className="article-table">
          <table>
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td
                      key={cell}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "pathway":
      return (
        <aside className="rounded-[var(--radius-standard)] border border-[var(--foreground)] bg-[var(--foreground)] p-5 text-white">
          <h3 className="text-[19px] font-semibold">{block.title}</h3>
          <ol className="type-body mt-5 flex flex-col gap-3 text-white/82">
            {block.items.map((item, index) => (
              <li key={item} className="grid grid-cols-[24px_1fr] gap-3">
                <span className="text-white/55">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <button className="mt-6 inline-flex h-9 items-center rounded-[6px] bg-white px-3 text-[13px] font-medium text-[var(--foreground)]">
            {block.cta}
          </button>
        </aside>
      );
    case "related":
      return (
        <nav aria-label="Related chapters" className="grid gap-3 sm:grid-cols-2">
          <a className="related-link" href="#">
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>{block.previous}</span>
          </a>
          <a className="related-link justify-end text-right" href="#">
            <span>{block.next}</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </nav>
      );
  }
}

function ArticleCallout({
  block,
  blockId,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  blockId: string;
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
          {isTip ? <p className="article-callout-badge">Pro-tip</p> : null}
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

function handleHeadingLinkClick(
  _event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
) {
  if (typeof window === "undefined" || !window.navigator.clipboard) {
    return;
  }

  const sectionUrl = new URL(window.location.href);
  sectionUrl.hash = sectionId;

  void window.navigator.clipboard.writeText(sectionUrl.toString()).catch(() => {
    // The hash link still works when browser permissions block clipboard writes.
  });
}

function HeadingLinkIcon() {
  return (
    <svg
      aria-label="Link to section"
      className="article-heading-icon"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.1563 11.128L14.6776 9.60672C16.078 8.20639 16.078 5.93599 14.6776 4.53566C13.2773 3.13532 11.0069 3.13532 9.60656 4.53565L8.08524 6.05698M11.1279 13.1565L9.60656 14.6778C8.20622 16.0781 5.93582 16.0781 4.53549 14.6778C3.13515 13.2775 3.13515 11.0071 4.53549 9.60672L6.05681 8.0854"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.3"
      />
      <path
        d="M11.1281 8.08541L8.08545 11.1281"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function ArticleChecklist({
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

function ArticleQuote({
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

function ArticleUpdateStatus({ updatedAt }: { updatedAt: string }) {
  const isEnglish = updatedAt.startsWith("Updated");
  const helpText = isEnglish
    ? "Have questions about the platform?"
    : "Есть вопросы о платформе?";
  const helpLinkText = isEnglish
    ? "Visit the Help Center."
    : "Перейти в Help Center.";

  return (
    <footer className="article-update-status" aria-label="Guide update status">
      <p className="article-update-help">
        <span>{helpText}</span>
        <span className="article-update-help-link">{helpLinkText}</span>
      </p>
      <p className="article-update-date">
        <TimeCircleIcon />
        <span>{updatedAt}</span>
      </p>
    </footer>
  );
}

function TimeCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="article-update-icon"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 9.19995V11.7993C12 11.9246 12.0627 12.0417 12.167 12.1113L14.1 13.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
