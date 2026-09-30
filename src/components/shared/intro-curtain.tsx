"use client";

import { useEffect, useState } from "react";

/**
 * The curtain the site opens with.
 *
 * Every frame of it is in `globals.css`, on purpose. A preloader driven by
 * JavaScript cannot be down at first paint — it arrives with hydration, which
 * means the page is visible for a moment and *then* gets covered, which is the
 * one thing a preloader must not do. This renders on the server, so the curtain
 * is in the first bytes of the document and the animation starts as the CSS is
 * parsed. The CSS also ends it: the overlay hides itself at the end of the
 * timeline whether or not this component ever hydrated.
 *
 * So all that is left for the script is the tidying up — take the node out of
 * the DOM once it has played, skip the rest of it the moment somebody reaches
 * for the page, and never run it at all on a machine that asked for less motion.
 *
 * It does not pause the entrance animations underneath it. `cc-rise` and friends
 * are a few hundred milliseconds and will have played behind the curtain on a
 * cold load; they are still there on every navigation after it, which is most of
 * what anybody sees. Holding them would mean either a class on `<html>` that
 * strands the page invisible if the script never runs, or flattening the
 * staggers — and neither is worth what it buys.
 */

/** What the `--gone` step in the stylesheet adds up to. */
const TOTAL_MS = 2490;

/** Reaching for the page is a good enough reason to get out of the way. */
const SKIP_ON = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export function IntroCurtain() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const finish = () => setDone(true);

    /*
      The animation is what times the curtain, not this. The timer is the
      backstop for the case where the animation never ran and `animationend`
      is therefore never coming.
    */
    const timer = window.setTimeout(finish, TOTAL_MS + 500);
    for (const type of SKIP_ON) {
      window.addEventListener(type, finish, { once: true, passive: true });
    }

    return () => {
      window.clearTimeout(timer);
      for (const type of SKIP_ON) window.removeEventListener(type, finish);
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      className="cc-intro"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        // Every child animation bubbles through here too; this is the last one.
        if (event.animationName === "cc-intro-gone") setDone(true);
      }}
    >
      <span className="cc-intro-wash" />
      <span className="cc-intro-panel" data-layer="front" data-edge="left" />
      <span className="cc-intro-panel" data-layer="front" data-edge="right" />
      <span className="cc-intro-panel" data-layer="back" data-edge="left" />
      <span className="cc-intro-panel" data-layer="back" data-edge="right" />

      <div className="cc-intro-content">
        {/* The same pin the header, the tab icon and the share card carry. Not
            LogoMark itself: that one is a link target sized for a 16px row, and
            this is 44px on a dark ground with its own glow. */}
        <span className="cc-intro-mark">
          <svg viewBox="0 0 24 24" role="presentation">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M12 2.4c-3.75 0-6.8 3.02-6.8 6.75 0 2.35 1.34 4.86 2.77 6.83a28 28 0 0 0 3.32 3.79c.4.38 1.02.38 1.42 0a28 28 0 0 0 3.32-3.79c1.43-1.97 2.77-4.48 2.77-6.83C18.8 5.42 15.75 2.4 12 2.4Zm0 9.5a2.62 2.62 0 1 1 0-5.25 2.62 2.62 0 0 1 0 5.25Z"
            />
          </svg>
        </span>

        <p className="cc-intro-mask">
          <span className="cc-intro-word">Welcome</span>
        </p>

        <span className="cc-intro-bar">
          <span className="cc-intro-fill">
            <span className="cc-intro-fill-2" />
          </span>
        </span>
      </div>
    </div>
  );
}
