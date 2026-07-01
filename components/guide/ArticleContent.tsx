import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ContentBlock, GuideChapter, GuideSection } from "./types";

const headingLinkIcon = "/figma/icon-link-heading.svg";
const calloutLinkIcon = "/figma/icon-link-callout.svg";
const checkboxCheckedIcon = "/figma/icon-checkbox-checked.svg";

export function ArticleContent({ chapter }: { chapter: GuideChapter }) {
  return (
    <>
      <Hero chapter={chapter} />
      {chapter.blocks?.length ? (
        <div className="mt-8 flex flex-col gap-7">
          {chapter.blocks.map((block, index) => (
            <ContentBlockView
              key={`${chapter.slug}-${index}`}
              block={block}
              blockId={`${chapter.slug}-block-${index + 1}`}
            />
          ))}
        </div>
      ) : null}
      {chapter.sections.map((section) => (
        <GuideSectionView key={section.id} section={section} />
      ))}
    </>
  );
}

function Hero({ chapter }: { chapter: GuideChapter }) {
  const hasMeta = chapter.updatedAt || chapter.readTime;

  return (
    <header id="top" className="scroll-mt-28">
      {hasMeta ? (
        <div className="article-meta flex flex-wrap items-center gap-2">
          {chapter.updatedAt ? <span>{chapter.updatedAt}</span> : null}
          {chapter.updatedAt && chapter.readTime ? <span aria-hidden="true">/</span> : null}
          {chapter.readTime ? <span>{chapter.readTime}</span> : null}
        </div>
      ) : null}
      <h1 className={hasMeta ? "type-h1 mt-6" : "type-h1"}>{chapter.title}</h1>
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
    <section id={section.id} className={`scroll-mt-28 ${spacingClass}`}>
      {section.eyebrow ? (
        <p className="text-[12px] leading-none text-[var(--muted)]">{section.eyebrow}</p>
      ) : null}
      <div className="article-heading">
        <a className="article-heading-anchor" href={`#${section.id}`} aria-label={`Link to ${section.title}`}>
          <Image alt="" aria-hidden="true" src={headingLinkIcon} width={20} height={20} />
        </a>
        <Heading className={headingClass}>{section.title}</Heading>
      </div>
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
        <div className="mt-8 flex flex-col gap-7">
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
}: {
  block: ContentBlock;
  blockId: string;
}) {
  switch (block.type) {
    case "lead":
      return <p className="type-lead">{block.text}</p>;
    case "paragraph":
      return <p className="type-body">{block.text}</p>;
    case "callout":
      return <ArticleCallout block={block} blockId={blockId} />;
    case "bulletedList":
      return (
        <ul className="article-list type-body">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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
        <ArticleChecklist items={block.items} />
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
        <details className="rounded-[var(--radius-standard)] border border-[var(--line)] bg-white p-5">
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
        <div className="overflow-x-auto rounded-[var(--radius-standard)] border border-[var(--line)] bg-white p-5">
          <p className="type-table whitespace-pre-wrap break-words text-[var(--foreground)]">
            {block.text}
          </p>
        </div>
      );
    case "steps":
      return (
        <div className="rounded-[var(--radius-standard)] border border-[var(--line)] bg-white p-5">
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

  return (
    <aside id={blockId} className={`article-callout article-callout-${block.variant}`}>
      <div className="article-callout-content">
        <div className={isTip ? "article-callout-stack article-callout-stack-tip" : "article-callout-stack"}>
          {isTip ? <p className="article-callout-badge">Pro-tip</p> : null}
          {block.title ? <p className="article-callout-title">{block.title}</p> : null}
          <p className="article-callout-text">{block.text}</p>
          {block.href && block.linkLabel ? (
            <a className="article-link article-callout-link" href={block.href}>
              {block.linkLabel}
            </a>
          ) : null}
        </div>
      </div>
      <a className="article-callout-anchor" href={linkHref} aria-label="Link to callout">
        <Image alt="" aria-hidden="true" src={calloutLinkIcon} width={16} height={16} />
      </a>
    </aside>
  );
}

function ArticleChecklist({
  title,
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <div className="article-checklist">
      {title ? <h3 className="article-checklist-title">{title}</h3> : null}
      <ul className="article-checklist-list">
        {items.map((item) => (
          <li key={item} className="article-checklist-item">
            <Image alt="" aria-hidden="true" src={checkboxCheckedIcon} width={20} height={20} />
            <span>{item}</span>
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
