"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as React from "react";
import { Search } from "lucide-react";
import {
  getSuggestedGuideChapters,
  searchGuideIndex,
} from "@/content/guideSearch";
import { getGuideCopy } from "./guideCopy";
import type {
  GuideSearchMatch,
  GuideSearchRecord,
  GuideSearchResults,
} from "./types";
import { useModalDialog } from "./useModalDialog";

type GuideSearchDialogProps = {
  backgroundRef: React.RefObject<HTMLElement | null>;
  indexHref: string;
  locale: "ru" | "en";
  open: boolean;
  onClose: () => void;
};

type SearchResultItem = GuideSearchRecord | GuideSearchMatch;

const emptySearchResults: GuideSearchResults = {
  chapters: [],
  sections: [],
  text: [],
};

export function GuideSearchDialog({
  backgroundRef,
  indexHref,
  locale,
  open,
  onClose,
}: GuideSearchDialogProps) {
  const [index, setIndex] = useState<GuideSearchRecord[] | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = getGuideCopy(locale);
  const normalizedQuery = query.trim();
  const results = useMemo(
    () =>
      normalizedQuery
        ? searchGuideIndex(index ?? [], normalizedQuery)
        : emptySearchResults,
    [index, normalizedQuery],
  );
  const suggestedChapters = useMemo(
    () =>
      normalizedQuery ? [] : getSuggestedGuideChapters(index ?? []),
    [index, normalizedQuery],
  );
  const hasResults =
    results.chapters.length > 0 ||
    results.sections.length > 0 ||
    results.text.length > 0;

  useEffect(() => {
    if (!open || index !== null) {
      return;
    }

    const controller = new AbortController();
    let active = true;

    void (async () => {
      try {
        const response = await fetch(indexHref, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Search index request failed: ${response.status}`);
        }

        const payload: unknown = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error("Search index response was not an array");
        }

        if (!active) return;
        setIndex(payload as GuideSearchRecord[]);
        setLoadState("ready");
      } catch {
        if (!active || controller.signal.aborted) return;
        setLoadState("error");
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [index, indexHref, open]);

  const handleClose = () => {
    setQuery("");
    if (index === null) {
      setLoadState("loading");
    }
    onClose();
  };

  useModalDialog({
    open,
    onClose: handleClose,
    dialogRef,
    initialFocusRef: inputRef,
    backgroundRef,
    returnFocusSelector: "[data-guide-search-trigger]",
  });

  if (!open) {
    return null;
  }

  return (
    <section
      aria-label={copy.search.label}
      aria-modal="true"
      className="search-dialog-backdrop"
      ref={dialogRef}
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="search-dialog" role="document">
        <div className="search-dialog-control">
          <label className="sr-only" htmlFor="guide-search-input">
            {copy.search.label}
          </label>
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <input
            id="guide-search-input"
            ref={inputRef}
            className="search-dialog-input"
            placeholder={copy.search.placeholder}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            aria-label={copy.search.close}
            className="search-dialog-escape"
            type="button"
            onClick={handleClose}
          >
            ESC
          </button>
        </div>

        <div className="search-dialog-results">
          {index === null ? (
            <p className="search-dialog-status" role="status">
              {loadState === "error"
                ? copy.search.error
                : copy.search.loading}
            </p>
          ) : normalizedQuery ? (
            hasResults ? (
              <>
                <SearchResultGroup
                  id="chapters"
                  items={results.chapters}
                  label={copy.search.chapters}
                  locale={locale}
                  query={normalizedQuery}
                  handleClose={handleClose}
                />
                <SearchResultGroup
                  id="sections"
                  items={results.sections}
                  label={copy.search.sections}
                  locale={locale}
                  query={normalizedQuery}
                  handleClose={handleClose}
                />
                <SearchResultGroup
                  id="text"
                  items={results.text}
                  label={copy.search.textMatches}
                  locale={locale}
                  query={normalizedQuery}
                  handleClose={handleClose}
                />
              </>
            ) : (
              <p className="search-dialog-empty">{copy.search.noResults}</p>
            )
          ) : (
            <SearchResultGroup
              id="suggested"
              items={suggestedChapters}
              label={copy.search.suggested}
              locale={locale}
              query=""
              handleClose={handleClose}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function SearchResultGroup({
  id,
  items,
  label,
  locale,
  query,
  handleClose,
}: {
  id: string;
  items: SearchResultItem[];
  label: string;
  locale: "ru" | "en";
  query: string;
  handleClose: () => void;
}) {
  if (!items.length) {
    return null;
  }

  const labelId = `search-dialog-group-${id}`;

  return (
    <section aria-labelledby={labelId} className="search-dialog-group">
      <h2 className="search-dialog-group-title" id={labelId}>
        {label}
      </h2>
      <div className="search-dialog-group-results">
        {items.map((item) => {
          const resultTitle =
            item.type === "chapter"
              ? item.title
              : item.sectionTitle ?? item.title;
          const resultPath =
            item.type === "chapter"
              ? item.href
              : item.sectionTitle
                ? `${item.chapterTitle} › ${item.sectionTitle}`
                : item.chapterTitle;

          return (
            <a
              key={item.id}
              className="search-dialog-result"
              href={item.href}
              onClick={handleClose}
            >
              <span className="search-dialog-result-title">{resultTitle}</span>
              <small className="search-dialog-result-path">{resultPath}</small>
              {item.type === "text" && isGuideSearchMatch(item) ? (
                <span className="search-dialog-result-excerpt">
                  <HighlightedMatch
                    text={item.excerpt}
                    query={query}
                    locale={locale}
                  />
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}

function isGuideSearchMatch(
  item: SearchResultItem,
): item is GuideSearchMatch {
  return "excerpt" in item;
}

function normalizeForHighlight(value: string, locale: "ru" | "en") {
  return value.normalize("NFKC").toLocaleLowerCase(locale).replace(/\s+/g, " ");
}

function HighlightedMatch({
  text,
  query,
  locale,
}: {
  text: string;
  query: string;
  locale: "ru" | "en";
}) {
  const visibleQuery = query.trim();
  const normalizedText = normalizeForHighlight(text, locale);
  const normalizedQuery = normalizeForHighlight(visibleQuery, locale);

  if (
    !normalizedQuery ||
    normalizedText.length !== text.length ||
    normalizedQuery.length !== visibleQuery.length
  ) {
    return text;
  }

  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return text;
  }

  const matchEnd = matchIndex + normalizedQuery.length;
  const visibleMatch = text.slice(matchIndex, matchEnd);

  if (normalizeForHighlight(visibleMatch, locale) !== normalizedQuery) {
    return text;
  }

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark>{text.slice(matchIndex, matchEnd)}</mark>
      {text.slice(matchEnd)}
    </>
  );
}
