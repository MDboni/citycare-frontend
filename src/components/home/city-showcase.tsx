"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type Accent, CitySkyline } from "@/components/shared/city-skyline";
import { useCarousel } from "@/components/shared/use-carousel";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

type Slide = {
  id: string;
  accent: Accent;
  seed: number;
  kicker: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  /**
   * A photograph to use instead of the drawn city. Drop a file in `public/`
   * and put its path here — `{ src: "/banner/skyline.jpg" }` — and the slide
   * uses it, scrim, copy and all. Nothing else has to change.
   */
  image?: { src: string };
};

const SLIDES: Slide[] = [
  {
    id: "coverage",
    accent: "azure",
    seed: 20260930,
    kicker: "Every ward, one map",
    title: "A city that can see itself",
    body: "Each report lands against the ward it came from and the department that owns it, so a pothole in Ward 7 is never somebody else's paperwork.",
    cta: { href: routes.nearby, label: "See what is nearby" },
  },
  {
    id: "clock",
    accent: "violet",
    seed: 77712,
    kicker: "The clock runs in public",
    title: "A deadline you can hold us to",
    body: "Every category carries an SLA, and it starts the moment you file. When it runs out the report escalates on its own — nobody has to notice first.",
    cta: { href: routes.complaints.new, label: "Report an issue" },
  },
  {
    id: "receipt",
    accent: "amber",
    seed: 4410233,
    kicker: "Paid, and provable",
    title: "Fees with a receipt attached",
    body: "Licences and certificates are paid through SSLCommerz — no card details ever touch CityCare, and the PDF receipt is in your email before you are back on the site.",
    cta: { href: routes.services.catalog, label: "Browse services" },
  },
];

const HOLD_MS = 6500;

/**
 * The banner carousel on the home page.
 *
 * Built rather than pulled in: a slider is a transform, a timer and a set of
 * controls, and the accessibility is the part a library gets wrong anyway. The
 * timer and the rules around it are in `useCarousel`, which the contact panel
 * shares — one behaviour, one place to fix it.
 */
export function CityShowcase() {
  const { index, go, running, still, playing, toggle, frameProps, swipeProps } =
    useCarousel(SLIDES.length, HOLD_MS);

  return (
    <section className="page-shell py-16 lg:py-24">
      {/*
        The carousel is the frame, not the section around it. It used to be the
        section, which carries 4rem of padding above and below — so a pointer
        resting in that empty band stopped the rotation from a place nobody
        would read as being on the banner, and the banner looked broken.

        biome-ignore lint/a11y/useSemanticElements: a carousel container is
        role="group" with aria-roledescription (WAI-ARIA APG). The suggested
        <fieldset> groups form controls, which this is not.
      */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="What CityCare does"
        className="cc-reveal relative overflow-hidden rounded-3xl border border-border shadow-lg"
        {...frameProps}
      >
        <div
          // touch-pan-y: a horizontal drag moves the carousel, a vertical one
          // still scrolls the page.
          className="flex touch-pan-y motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
          {...swipeProps}
        >
          {SLIDES.map((slide, position) => {
            const active = position === index;
            return (
              // biome-ignore lint/a11y/useSemanticElements: a carousel slide is role="group" with aria-roledescription (WAI-ARIA APG). The suggested <fieldset> groups form controls, which this is not.
              <div
                key={slide.id}
                className="relative w-full shrink-0 touch-pan-y"
                role="group"
                aria-roledescription="slide"
                aria-label={`${position + 1} of ${SLIDES.length}`}
                // Keeps the off-screen slides out of the tab order and out of
                // the accessibility tree, which is the whole reason a carousel
                // usually fails a keyboard pass.
                inert={!active}
              >
                {slide.image ? (
                  <Image
                    src={slide.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 1200px, 100vw"
                    priority={position === 0}
                    className="object-cover"
                  />
                ) : (
                  <CitySkyline
                    id={`showcase-${slide.id}`}
                    accent={slide.accent}
                    seed={slide.seed}
                    className="absolute inset-0 size-full"
                  />
                )}

                {/* The scrim: copy over a night sky needs its own floor. */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050a1f]/90 via-[#050a1f]/55 to-transparent" />

                <div className="relative flex min-h-[23rem] items-end p-6 sm:min-h-[26rem] sm:p-10 lg:min-h-[30rem] lg:p-14">
                  <div className="max-w-xl space-y-4 pb-10 sm:pb-6">
                    <p className="text-xs font-medium tracking-[0.18em] text-sky-200/90 uppercase">
                      {slide.kicker}
                    </p>
                    <h2 className="h-section-lg text-white">{slide.title}</h2>
                    <p className="lead text-slate-200/90">{slide.body}</p>
                    <Button
                      size="lg"
                      nativeButton={false}
                      render={<Link href={slide.cta.href} />}
                    >
                      {slide.cta.label}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------- controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, position) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(position)}
                aria-label={`Show ${slide.title}`}
                aria-current={position === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  position === index
                    ? "w-8 bg-white"
                    : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* The mechanism WCAG asks for by name. Hidden when the rotation is
                not running anyway, which is what reduced motion means here. */}
            {!still && (
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={
                  playing ? "Pause the slideshow" : "Play the slideshow"
                }
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={toggle}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous slide"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => go(index - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next slide"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => go(index + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* Announced only once the carousel has stopped moving on its own —
          narrating an autoplay to a screen reader is just noise. */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        Slide {index + 1} of {SLIDES.length}: {SLIDES[index].title}
      </p>
    </section>
  );
}
