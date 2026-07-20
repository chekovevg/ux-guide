"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  readChecklistState,
  toggleChecklistIndex,
  writeChecklistState,
} from "./checklistState.mjs";

type ArticleChecklistProps = {
  items: string[];
  labels: {
    progress: (done: number, total: number) => string;
    complete: string;
    reset: string;
  };
  storageKey: string;
  title?: string;
};

export function ArticleChecklist({
  items,
  labels,
  storageKey,
  title,
}: ArticleChecklistProps) {
  const [checked, setChecked] = useState(() => new Set<number>());
  const isComplete = checked.size === items.length && items.length > 0;

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      try {
        setChecked(
          readChecklistState(window.localStorage, storageKey, items.length),
        );
      } catch {
        // Access to localStorage can be blocked before its methods are called.
      }
    });

    return () => {
      active = false;
    };
  }, [items.length, storageKey]);

  function persist(next: Set<number>) {
    setChecked(next);

    try {
      writeChecklistState(window.localStorage, storageKey, next);
    } catch {
      // Keep the in-memory checklist usable when localStorage is unavailable.
    }
  }

  function handleToggle(index: number) {
    const next = toggleChecklistIndex(checked, index, items.length);
    persist(next);
  }

  function handleReset() {
    persist(new Set<number>());
  }

  return (
    <div className="article-checklist">
      <div className="article-checklist-header">
        {title ? <h3 className="article-checklist-title">{title}</h3> : null}
        <div
          aria-live="polite"
          className="article-checklist-status"
          role="status"
        >
          <span>{labels.progress(checked.size, items.length)}</span>
          {isComplete ? (
            <>
              {" "}
              <span className="article-checklist-complete">{labels.complete}</span>
            </>
          ) : null}
        </div>
      </div>
      <ul className="article-checklist-list">
        {items.map((item, index) => (
          <li key={`${storageKey}-${index}`}>
            <label
              className="article-checklist-item"
              data-checked={checked.has(index) ? "true" : undefined}
            >
              <input
                checked={checked.has(index)}
                className="article-checklist-input"
                type="checkbox"
                onChange={() => handleToggle(index)}
              />
              <span className="article-checklist-icon" aria-hidden="true">
                <Check aria-hidden="true" className="size-3" strokeWidth={3} />
              </span>
              <span className="article-checklist-text">{item}</span>
            </label>
          </li>
        ))}
      </ul>
      {checked.size > 0 ? (
        <button
          className="article-checklist-reset"
          type="button"
          onClick={handleReset}
        >
          {labels.reset}
        </button>
      ) : null}
    </div>
  );
}
