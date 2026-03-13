import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(containerRef, { active = true } = {}) {
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof document === "undefined") return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
      );
    };

    const focusFirst = () => {
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;
      const elementToFocus =
        focusable.find((el) => el.getAttribute("data-auto-focus") === "true") ||
        focusable[0];
      elementToFocus.focus();
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || !container.contains(current)) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (current === last || !container.contains(current)) {
          first.focus();
          event.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    focusFirst();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === "function"
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [active, containerRef]);
}

