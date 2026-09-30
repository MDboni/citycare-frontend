"use client";

import { useEffect, useState } from "react";

/**
 * A dot on the pointer, and a ring that catches up with it.
 *
 * The idea is borrowed; the implementation is not. The reference moves the ring
 * by scheduling a `setTimeout` inside `mousemove` — one timer per event, which
 * on a fast mouse is a few hundred timers a second, and the result is a ring
 * that jumps between the positions the mouse was at 60ms ago rather than one
 * that trails. This runs a single animation frame loop and closes a fraction of
 * the remaining distance each frame, which is what makes the lag read as weight
 * instead of stutter. It also moves them with the `translate` property rather
 * than `left`/`top`, so the browser shifts a composited layer instead of laying
 * the page out again.
 *
 * `translate` and not `transform`, and that is not a preference. The hover
 * state grows the ring with the `scale` property, and a matrix is built from
 * `translate`, then `rotate`, then `scale`, then `transform` — so a position
 * written into `transform` sits AFTER the scale and gets multiplied by it. With
 * `transform: translate3d(x, y, 0)` and `scale: 1.55`, the ring landed at 1.55x
 * and 1.55y: over a link near the middle of the page it jumped a few hundred
 * pixels down and to the right. In `translate` the position comes first in the
 * chain, so the scale only ever grows the ring about its own centre.
 *
 * It is off unless the pointer is a mouse and the machine has not asked for
 * less motion. Hiding the system cursor on a touch screen does nothing useful,
 * and replacing it with something that glides is exactly what reduced motion is
 * about. Text fields keep their own cursor either way: an I-beam is the only
 * thing on screen that says "you can type here", and no drawn dot says it.
 */

/** How much of the gap the ring closes each frame. Higher is tighter. */
const EASE = 0.19;

/** Anything worth reacting to. Matched by delegation, so React can re-render freely. */
const HOT =
  'a, button, [role="button"], [role="menuitem"], [role="tab"], summary, select, label[for], input[type="checkbox"], input[type="radio"], [data-cursor="hot"]';

/** Where the drawn cursor stands down and the native I-beam takes over. */
const TEXT =
  'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

const flag = (node: HTMLElement, name: string, on: boolean) => {
  if (on) node.setAttribute(name, "");
  else node.removeAttribute(name);
};

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !still.matches);

    sync();
    fine.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Built here rather than rendered: nothing should exist in the markup for
    // the visitors who never get one, and there is no state React needs to own.
    const dot = document.createElement("div");
    dot.className = "cc-cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cc-cursor-ring";
    document.body.append(dot, ring);
    document.documentElement.classList.add("cc-cursor");

    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let started = false;
    let visible = false;
    let raf = 0;

    const show = () => {
      if (visible || !started) return;
      visible = true;
      flag(dot, "data-on", true);
      flag(ring, "data-on", true);
    };
    const hide = () => {
      if (!visible) return;
      visible = false;
      flag(dot, "data-on", false);
      flag(ring, "data-on", false);
    };

    const paint = () => {
      ringX += (x - ringX) * EASE;
      ringY += (y - ringY) * EASE;
      ring.style.translate = `${ringX}px ${ringY}px`;
      raf = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      // A touchscreen laptop reports a fine pointer as well, and a tap on it
      // should not drag the drawn cursor across the page.
      if (event.pointerType !== "mouse") return;

      x = event.clientX;
      y = event.clientY;
      dot.style.translate = `${x}px ${y}px`;

      if (!started) {
        // Put the ring where the pointer already is, so the first movement does
        // not drag it in from the top-left corner of the screen.
        started = true;
        ringX = x;
        ringY = y;
      }
      show();
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const typing = Boolean(target.closest(TEXT));
      const hot = !typing && Boolean(target.closest(HOT));

      for (const node of [dot, ring]) {
        flag(node, "data-typing", typing);
        flag(node, "data-hot", hot);
      }
    };

    const onDown = () => flag(ring, "data-press", true);
    const onUp = () => flag(ring, "data-press", false);
    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide();
    };

    /** A ring thrown off by the click, which is where the reference's ripple lands. */
    const onClick = (event: MouseEvent) => {
      if (dot.hasAttribute("data-typing")) return;
      const ripple = document.createElement("div");
      ripple.className = "cc-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    /*
      `mouseleave` on document is not fired reliably everywhere; a `mouseout`
      with no relatedTarget is the portable way of saying "the pointer left the
      window". The next real move brings it back.
    */
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("blur", hide);
    raf = requestAnimationFrame(paint);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("cc-cursor");
      dot.remove();
      ring.remove();
      for (const ripple of document.querySelectorAll(".cc-ripple"))
        ripple.remove();
    };
  }, [enabled]);

  return null;
}
