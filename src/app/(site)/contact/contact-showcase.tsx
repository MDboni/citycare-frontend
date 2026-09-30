"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { type Accent, CitySkyline } from "@/components/shared/city-skyline";
import { useCarousel } from "@/components/shared/use-carousel";
import { Button } from "@/components/ui/button";

type Panel = {
  id: string;
  accent: Accent;
  seed: number;
  kicker: string;
  line: string;
};

/**
 * Three things this page already says, given a picture each.
 *
 * Decoration that repeats the copy rather than adding to it, on purpose: a
 * caption on a banner is the last thing anyone reads, so it is the wrong place
 * to put a fact that appears nowhere else.
 */
const PANELS: Panel[] = [
  {
    id: "clock",
    accent: "azure",
    seed: 51207,
    kicker: "Around the clock",
    line: "Reports and service applications are taken at any hour, and the SLA clock does not pause for a weekend.",
  },
  {
    id: "ward",
    accent: "violet",
    seed: 990413,
    kicker: "Routed by ward",
    line: "A report picks up the officer covering the ward it was filed in, so the desk that answers is the one that owns it.",
  },
  {
    id: "desk",
    accent: "amber",
    seed: 3308871,
    kicker: "A desk, not an inbox",
    line: "Every department here is reachable directly — and a filed report reaches the same officers with a tracking id attached.",
  },
];

const HOLD_MS = 5500;

/**
 * The panel beside the contact heading.
 *
 * Same behaviour as the home banner, from the same hook, at a quarter of the
 * size: it slides, it keeps sliding, and the slide that is up is pushed slowly
 * into the frame so a drawn city does not sit there as a flat picture.
 */
export function ContactShowcase() {
  const { index, go, running, still, playing, toggle, frameProps, swipeProps } =
    useCarousel(PANELS.length, HOLD_MS);

  return (
    <div className="cc-rise cc-delay-2">
      {/*
        biome-ignore lint/a11y/useSemanticElements: a carousel container is
        role="group" with aria-roledescription (WAI-ARIA APG). The suggested
        <fieldset> groups form controls, which this is not.
      */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="CityCare at a glance"
        className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-xl ring-1 ring-foreground/10 sm:aspect-16/11"
        {...frameProps}
      >
        <div
          className="flex size-full touch-pan-y motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
          {...swipeProps}
        >
          {PANELS.map((panel, position) => {
            const active = position === index;
            return (
              // biome-ignore lint/a11y/useSemanticElements: as above — a slide is role="group".
              <div
                key={panel.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${position + 1} of ${PANELS.length}`}
                // Off-screen slides leave the tab order and the accessibility
                // tree, which is where carousels usually fail a keyboard pass.
                inert={!active}
                className="relative size-full shrink-0 overflow-hidden"
              >
                {/* The zoom rides a wrapper, not the svg: the class comes and
                    goes with the active slide, and restarting an animation on
                    the element that also carries the artwork would restart the
                    artwork's own animations with it. */}
                <div className={active ? "cc-zoom size-full" : "size-full"}>
                  <CitySkyline
                    id={`contact-${panel.id}`}
                    accent={panel.accent}
                    seed={panel.seed}
                    // A shorter window than the banner's: this panel is close
                    // to square, and the full drawing would spend its top
                    // fifth on empty sky.
                    view="0 140 1200 560"
                    className="size-full"
                  />
                </div>

                {/* The caption's floor. Darkest at the bottom, where it sits. */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a1f]/92 via-[#050a1f]/35 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 sm:p-6">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-sky-200/90 uppercase">
                    {panel.kicker}
                  </p>
                  <p className="max-w-md text-sm leading-relaxed text-slate-100/90">
                    {panel.line}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top right, because the caption owns the bottom of the frame. */}
        <div className="absolute top-0 right-0 flex items-center gap-2 p-4">
          <div className="flex items-center gap-1.5">
            {PANELS.map((panel, position) => (
              <button
                key={panel.id}
                type="button"
                onClick={() => go(position)}
                aria-label={`Show ${panel.kicker}`}
                aria-current={position === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  position === index
                    ? "w-6 bg-white"
                    : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {!still && (
            <Button
              variant="outline"
              size="icon-xs"
              aria-label={
                playing ? "Pause the slideshow" : "Play the slideshow"
              }
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={toggle}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
          )}
        </div>
      </div>

      {/* Announced only once it has stopped moving on its own — narrating an
          autoplay to a screen reader is noise. */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Slide {index + 1} of {PANELS.length}: {PANELS[index].kicker}
      </p>
    </div>
  );
}
