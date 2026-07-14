import Image from "next/image";
import type { MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Link as LucideLink } from "lucide-react";
import {
  ArticleCallout,
  ArticleChecklist,
  ArticleExampleCard,
  ArticleQuote,
  ArticleTable,
} from "./ArticleBlocks";
import type { ContentBlock, GuideChapter, GuideSection } from "./types";

export function ArticleContent({ chapter }: { chapter: GuideChapter }) {
  const isEnglish = chapter.updatedAt?.startsWith("Updated") ?? false;
  const calloutBadgeLabel = isEnglish ? "Tip" : "Совет";

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
  return (
    <header id="top" className="scroll-mt-28">
      <h1 className="type-h1">{chapter.title}</h1>
      {chapter.subtitle ? (
        <p className="article-hero-subtitle type-lead">{chapter.subtitle}</p>
      ) : null}
      {chapter.coverImage ? (
        <figure className="article-media-frame article-hero-media">
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
  const spacingClass = depth === 0 ? "pt-[84px]" : "pt-10";

  return (
    <section className={spacingClass}>
      {section.eyebrow ? (
        <p className="article-section-eyebrow">{section.eyebrow}</p>
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
        <figure className="article-media-frame mt-8">
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
              calloutBadgeLabel={calloutBadgeLabel}
            />
          ))}
        </div>
      ) : null}
      {section.children?.length ? (
        <div className={depth === 0 ? "mt-10 flex flex-col gap-8" : "mt-8 flex flex-col gap-6"}>
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
        <figure className="article-media-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt ?? ""}
            className="h-auto w-full"
            loading="lazy"
          />
          {block.alt ? (
            <figcaption className="article-media-caption type-caption">
              {block.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    case "toggle":
      return (
        <details className="article-toggle">
          <summary className="article-toggle-summary">
            {block.title}
          </summary>
          {block.text ? (
            <p className="type-body mt-4">{block.text}</p>
          ) : null}
          {block.blocks.length ? (
            <div className="article-block-stack article-toggle-blocks">
              {block.blocks.map((childBlock, childIndex) => {
                const childBlockId = `${blockId}-child-${childIndex + 1}`;

                return (
                  <ContentBlockView
                    key={childBlockId}
                    block={childBlock}
                    blockId={`${blockId}-child-${childIndex + 1}`}
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
        <div className="article-raw-table">
          <p className="article-raw-table-text type-table">
            {block.text}
          </p>
        </div>
      );
    case "steps":
      return (
        <div className="article-steps">
          <h3 className="article-steps-title">{block.title}</h3>
          <ol className="article-steps-list">
            {block.items.map((item, index) => (
              <li key={item} className="article-step-item type-body">
                <span className="article-step-index">
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
        <ArticleTable block={block} blockId={blockId} />
      );
    case "pathway":
      return (
        <aside className="article-pathway">
          <h3 className="article-pathway-title">{block.title}</h3>
          <ol className="article-pathway-list type-body">
            {block.items.map((item, index) => (
              <li key={item} className="article-pathway-item">
                <span className="article-pathway-index">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <button className="article-pathway-cta">
            {block.cta}
          </button>
        </aside>
      );
    case "related":
      return (
        <nav aria-label="Related chapters" className="article-related-nav">
          <a className="related-link" href="#">
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>{block.previous}</span>
          </a>
          <a className="related-link related-link-next" href="#">
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
    <LucideLink
      aria-hidden="true"
      className="article-heading-icon"
      strokeWidth={1.5}
    />
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
