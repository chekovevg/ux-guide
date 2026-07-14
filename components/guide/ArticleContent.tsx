import Image from "next/image";
import type { MouseEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ArticleCallout,
  ArticleChecklist,
  ArticleExampleCard,
  ArticleQuote,
  ArticleTable,
} from "./ArticleBlocks";
import type { ContentBlock, GuideChapter, GuideSection } from "./types";

const mobileCoverSources: Record<string, string> = {
  "/figma/cover-resistance.svg": "/figma/cover-resistance-mobile.png",
};

export function ArticleContent({ chapter }: { chapter: GuideChapter }) {
  const isEnglish = chapter.updatedAt?.startsWith("Updated") ?? false;
  const calloutBadgeLabel = isEnglish ? "Tip" : "Совет";

  return (
    <>
      <Hero chapter={chapter} />
      {chapter.blocks?.length ? (
        <div className="article-block-stack article-chapter-block-stack">
          {chapter.blocks.map((block, index) => (
            <ContentBlockView
              key={`${chapter.slug}-${index}`}
              block={block}
              blockId={`${chapter.slug}-block-${index + 1}`}
              calloutBadgeLabel={calloutBadgeLabel}
              checklistTitle={block.type === "todoList" ? chapter.title : undefined}
              checklistAccentItemIndex={block.type === "todoList" ? 4 : undefined}
            />
          ))}
        </div>
      ) : null}
      {chapter.sections.map((section) => (
        <GuideSectionView
          key={section.id}
          calloutBadgeLabel={calloutBadgeLabel}
          section={section}
        />
      ))}
      {chapter.updatedAt ? (
        <ArticleUpdateStatus updatedAt={chapter.updatedAt} />
      ) : null}
    </>
  );
}

function Hero({ chapter }: { chapter: GuideChapter }) {
  const mobileCoverSrc = chapter.coverImage
    ? mobileCoverSources[chapter.coverImage.src]
    : undefined;

  return (
    <header id="top" className="article-hero scroll-mt-28">
      <div className="article-hero-text">
        <h1 className="type-h1">{chapter.title}</h1>
        {chapter.subtitle ? (
          <p className="type-lead text-[var(--muted)]">{chapter.subtitle}</p>
        ) : null}
      </div>
      {chapter.coverImage ? (
        <figure className="article-hero-cover overflow-hidden rounded-[var(--radius-standard)] bg-[var(--subtle)]">
          <picture className="article-hero-cover-media block">
            {mobileCoverSrc ? (
              <source
                media="(max-width: 63.999rem)"
                srcSet={mobileCoverSrc}
                type="image/png"
              />
            ) : null}
            <Image
              src={chapter.coverImage.src}
              alt={chapter.coverImage.alt}
              width={906}
              height={464}
              priority
              className="h-auto w-full"
            />
          </picture>
        </figure>
      ) : null}
    </header>
  );
}

function GuideSectionView({
  calloutBadgeLabel,
  section,
  depth = 0,
}: {
  calloutBadgeLabel: string;
  section: GuideSection;
  depth?: number;
}) {
  const Heading = section.headingLevel === 3 ? "h3" : "h2";
  const headingClass = section.headingLevel === 3 ? "type-h3" : "type-h2";
  const sectionClass =
    depth === 0 ? "article-section" : "article-section article-subsection";

  return (
    <section className={sectionClass}>
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
        <figure className="article-section-image overflow-hidden rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--subtle)]">
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
        <div className="article-block-stack article-section-block-stack">
          {section.blocks.map((block, index) => (
            <ContentBlockView
              key={`${section.id}-${index}`}
              block={block}
              blockId={`${section.id}-block-${index + 1}`}
              calloutBadgeLabel={calloutBadgeLabel}
            />
          ))}
        </div>
      ) : null}
      {section.children?.length ? (
        <div className="article-subsection-stack">
          {section.children.map((child) => (
            <GuideSectionView
              key={child.id}
              calloutBadgeLabel={calloutBadgeLabel}
              section={child}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ContentBlockView({
  block,
  blockId,
  calloutBadgeLabel,
  checklistTitle,
  checklistAccentItemIndex,
}: {
  block: ContentBlock;
  blockId: string;
  calloutBadgeLabel: string;
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
      if (block.variant === "example") {
        return <ArticleExampleCard block={block} blockId={blockId} />;
      }

      return (
        <ArticleCallout
          block={block}
          blockId={blockId}
          calloutBadgeLabel={calloutBadgeLabel}
        />
      );
    case "bulletedList":
      return (
        <ul className="article-list article-list-bulleted type-body">
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
        <details className="article-toggle rounded-[var(--radius-standard)] border border-[var(--line)] bg-[var(--surface-raised)] p-5">
          <summary className="article-toggle-summary cursor-pointer text-[15px] font-semibold">
            {block.title}
          </summary>
          {block.text ? <p className="type-body mt-4">{block.text}</p> : null}
          {block.blocks.length ? (
            <div className="article-block-stack article-toggle-blocks">
              {block.blocks.map((childBlock, childIndex) => {
                const childBlockId = `${blockId}-child-${childIndex + 1}`;

                return (
                  <ContentBlockView
                    key={childBlockId}
                    block={childBlock}
                    blockId={childBlockId}
                    calloutBadgeLabel={calloutBadgeLabel}
                  />
                );
              })}
            </div>
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
      return <ArticleTable block={block} blockId={blockId} />;
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

function ArticleUpdateStatus({ updatedAt }: { updatedAt: string }) {
  const isEnglish = updatedAt.startsWith("Updated");
  const helpHref = "https://pathway.zendesk.com/hc/en-us";
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
        <a className="article-update-help-link" href={helpHref}>
          {helpLinkText}
        </a>
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
