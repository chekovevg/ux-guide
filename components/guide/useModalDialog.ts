"use client";

import { useEffect, useRef } from "react";
import type * as React from "react";
import { getFocusRestoreTarget } from "./modalFocus";

type ModalDialogOptions = {
  open: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  backgroundRef: React.RefObject<HTMLElement | null>;
  returnFocusSelector?: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useModalDialog({
  open,
  onClose,
  dialogRef,
  initialFocusRef,
  backgroundRef,
  returnFocusSelector,
}: ModalDialogOptions): void {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    const background = backgroundRef.current;

    if (!dialog || !background) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const backgroundWasInert = background.hasAttribute("inert");
    background.setAttribute("inert", "");

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => {
          const style = window.getComputedStyle(element);

          return (
            !element.hasAttribute("disabled") &&
            element.getAttribute("aria-disabled") !== "true" &&
            !element.hidden &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            element.getClientRects().length > 0
          );
        },
      );

    const focusFrame = requestAnimationFrame(() => {
      const focusableElements = getFocusableElements();
      const focusTarget = initialFocusRef?.current ?? focusableElements[0];
      focusTarget?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstFocusable || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastFocusable || !dialog.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);

      if (!backgroundWasInert) {
        background.removeAttribute("inert");
      }

      if (returnFocusSelector) {
        const focusTarget = getFocusRestoreTarget(
          previouslyFocused,
          document.querySelectorAll<HTMLElement>(returnFocusSelector),
        );
        focusTarget?.focus();
      } else if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [backgroundRef, dialogRef, initialFocusRef, open, returnFocusSelector]);
}
