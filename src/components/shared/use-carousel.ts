"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The behaviour behind every carousel on the site, in one place.
 *
 * There are two of them now — the home banner and the panel on the contact
 * page — and the rules they have to follow are the ones a carousel usually gets
 * wrong, so they are worth writing once:
 *
 *   - It keeps rotating. A manual move restarts the hold rather than stopping
 *     the rotation for good; the first cut of the banner stopped for ever on
 *     the first press of a dot, which made it look broken.
 *   - It pauses while the pointer is on the frame, while focus is inside it and
 *     while the tab is in the background, and none of those are a decision —
 *     they undo themselves.
 *   - `playing` is the decision, and the pause button is the mechanism WCAG
 *     2.2.2 asks for by name.
 *   - An operating system asking for less motion turns the whole thing off.
 */
export function useCarousel(count: number, holdMs: number) {
  const [index, setIndex] = useState(0);
  /** Hovering, focus and background tabs: a circumstance, not a decision. */
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(false);

  const running = playing && !paused && !still;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onVisibility = () =>
      setPaused(document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /**
   * A timeout keyed on the slide rather than one interval running underneath
   * the whole thing: it re-arms on every change of index, so a slide arrived at
   * by hand is held as long as one that came up on its own instead of being cut
   * short by whatever was left of a tick.
   */
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex((index + 1) % count), holdMs);
    return () => clearTimeout(timer);
  }, [running, index, count, holdMs]);

  const go = useCallback(
    (to: number) => setIndex((to + count) % count),
    [count],
  );

  /** Spread onto the frame — the visible panel, never a padded section around it. */
  const frameProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    },
  };

  /**
   * Spread onto whatever actually moves. Pointer events rather than touch
   * events, so a trackpad drag and a finger are the same gesture; the element
   * still needs `touch-pan-y` so a vertical drag scrolls the page.
   */
  const start = useRef<number | null>(null);
  const swipeProps = {
    onPointerDown: (event: PointerEvent) => {
      start.current = event.clientX;
    },
    onPointerUp: (event: PointerEvent) => {
      const from = start.current;
      start.current = null;
      if (from === null) return;
      const moved = event.clientX - from;
      /** Under 44px it is a tap that wobbled, not a swipe. */
      if (Math.abs(moved) < 44) return;
      go(index + (moved < 0 ? 1 : -1));
    },
  };

  return {
    index,
    go,
    running,
    still,
    playing,
    toggle: () => setPlaying((on) => !on),
    frameProps,
    swipeProps,
  };
}
