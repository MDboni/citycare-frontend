"use client";

import { useEffect, useRef } from "react";
import {
  AX,
  AY,
  BLOCKS,
  band,
  FILL,
  groundTransform,
  ORIGIN,
  PARK,
  project,
  RIM,
  RX,
  RY,
  TURN_SECONDS,
  viewOf,
} from "./city-scene";

/**
 * The city block, on a turntable.
 *
 * Drawn rather than dropped in as a raster for two reasons: every fill is a
 * palette token, so it re-tones itself in dark mode instead of sitting on the
 * page as a lit rectangle, and it stays sharp at any panel width without
 * shipping a second asset. It carries no information the copy beside it does not
 * already say, so it is hidden from assistive tech.
 *
 * The rotation is a real one, not a spinning picture: the scene is rebuilt every
 * frame from plate coordinates turned by the current angle, so each block shows
 * the faces that are actually pointing at you and is shaded by how far it has
 * turned away from the light. Spinning the finished drawing instead — a CSS
 * rotate on the svg — would tip the buildings over and hand you the back of the
 * card twice per revolution.
 *
 * The ground is a disc rather than the square it used to be, because a disc is
 * the one footprint a turntable does not change: a square would swing its
 * corners out past the viewBox every 45°.
 */

const FIRST_FRAME = BLOCKS.map((block, index) => viewOf(block, index, 0, 0));

/**
 * Cropped to what the scene actually uses at any angle — measured over a full
 * revolution, x runs 82..478 and y 39..441 — so the city fills the panel instead
 * of floating in a field of margin.
 */
const VIEW_BOX = "40 24 480 432";

// ----------------------------------------------------------------- component

type Nodes = {
  group: SVGGElement | null;
  walls: (SVGPathElement | null)[];
  roof: SVGPathElement | null;
  panes: SVGPathElement | null;
  lit: SVGPathElement | null;
  leader: SVGPathElement | null;
  pin: SVGGElement | null;
};

export function CityIllustration({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groundRef = useRef<SVGGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const nodes = useRef<Nodes[]>(
    BLOCKS.map(() => ({
      group: null,
      walls: [null, null, null, null],
      roof: null,
      panes: null,
      lit: null,
      leader: null,
      pin: null,
    })),
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    /** The last painting order, so the DOM is only reshuffled when it changes. */
    let order = "";
    /**
     * Time is accumulated rather than read off the clock, so a city that was
     * paused — scrolled past, or in a background tab — picks up where it stopped
     * instead of snapping to wherever the angle would have been by now. Long
     * gaps are clamped for the same reason.
     */
    let seconds = 0;
    let last = 0;

    const paint = (now: number) => {
      seconds += Math.min(now - last, 100) / 1000;
      last = now;
      const angle = (seconds / TURN_SECONDS) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      groundRef.current?.setAttribute("transform", groundTransform(cos, sin));

      const views = BLOCKS.map((block, index) =>
        viewOf(block, index, angle, seconds),
      );

      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        const node = nodes.current[i];

        for (let w = 0; w < 4; w++) {
          const wall = node.walls[w];
          if (!wall) continue;
          wall.setAttribute("d", view.walls[w].d);
          wall.setAttribute("fill-opacity", view.walls[w].shade.toFixed(3));
        }
        node.roof?.setAttribute("d", view.roof);
        node.panes?.setAttribute("d", view.panes);
        node.lit?.setAttribute("d", view.lit);
        if (view.marker) {
          node.leader?.setAttribute("d", view.marker.leader);
          node.pin?.setAttribute("transform", view.marker.pin);
        }
      }

      const sorted = views
        .map((view, index) => ({ index, depth: view.depth }))
        .sort((a, b) => a.depth - b.depth)
        .map((entry) => entry.index);
      const key = sorted.join(",");
      if (key !== order) {
        order = key;
        const layer = layerRef.current;
        if (layer) {
          for (const index of sorted) {
            const group = nodes.current[index].group;
            if (group) layer.appendChild(group);
          }
        }
      }

      raf = requestAnimationFrame(paint);
    };

    const start = () => {
      if (raf || still.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(paint);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /** Off-screen and hidden tabs cost nothing: a decoration is not worth a frame. */
    const watcher = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "80px" },
    );
    watcher.observe(svg);

    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop();
    const onMotionPreference = () => (still.matches ? stop() : start());

    document.addEventListener("visibilitychange", onVisibility);
    still.addEventListener("change", onMotionPreference);

    return () => {
      stop();
      watcher.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      still.removeEventListener("change", onMotionPreference);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={VIEW_BOX}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <title>An isometric city block on a slowly turning disc</title>

      <defs>
        <clipPath id="cc-city-disc">
          <ellipse cx={ORIGIN.x} cy={ORIGIN.y} rx={RX} ry={RY} />
        </clipPath>
      </defs>

      {/* A wash under the disc, so it reads as floating rather than pasted. */}
      <ellipse
        cx={ORIGIN.x}
        cy={ORIGIN.y + RIM + 8}
        rx={RX * 0.94}
        ry={RY * 0.82}
        className="fill-primary/10"
      />

      {/* The rim is simply the deck drawn again, lower down. */}
      <ellipse
        cx={ORIGIN.x}
        cy={ORIGIN.y + RIM}
        rx={RX}
        ry={RY}
        className="fill-primary/25"
      />
      <ellipse
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        rx={RX}
        ry={RY}
        className="fill-accent"
      />

      {/* Everything flat rides one matrix; see groundTransform. */}
      <g ref={groundRef} clipPath="url(#cc-city-disc)">
        <g className="fill-muted-foreground/20">
          <polygon points={band("u")} />
          <polygon points={band("v")} />
        </g>

        {/* Planting, kept flat on purpose: anything with a trunk would lean
            under the ground matrix, and a park from above is canopy anyway. */}
        {PARK.map(([u, v, r]) => {
          const [x, y] = project(u, v);
          return (
            <ellipse
              key={`park-${u}-${v}`}
              cx={x}
              cy={y}
              rx={Math.SQRT2 * r * AX}
              ry={Math.SQRT2 * r * AY}
              className="fill-chart-5/45"
            />
          );
        })}

        {/* A report landing, rippling out across the ward it came from. */}
        {BLOCKS.filter((block) => block.marker).map((block) => {
          const [x, y] = project(block.u, block.v);
          return (
            <ellipse
              key={`ring-${block.u}-${block.v}`}
              className={`cc-radar ${block.marker?.tone === "amber" ? "stroke-chart-2/60" : "stroke-primary/60"}`}
              cx={x}
              cy={y}
              rx={Math.SQRT2 * 0.24 * AX}
              ry={Math.SQRT2 * 0.24 * AY}
              fill="none"
              strokeWidth={2}
              style={{ animationDelay: `${block.h % 3}s` }}
            />
          );
        })}
      </g>

      {/* The edge, on top of the roads it crops. */}
      <ellipse
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        rx={RX}
        ry={RY}
        className="cc-dash stroke-primary/35"
        fill="none"
        strokeWidth={1.6}
        strokeDasharray="3 9"
        strokeLinecap="round"
      />

      <g ref={layerRef}>
        {BLOCKS.map((block, index) => {
          const view = FIRST_FRAME[index];
          const fill = FILL[block.tone];

          return (
            <g
              // biome-ignore lint/suspicious/noArrayIndexKey: the scene is a fixed list; the index IS the identity, and every node is held by ref for the animation frame.
              key={index}
              ref={(node) => {
                nodes.current[index].group = node;
              }}
            >
              {view.walls.map((wall, w) => (
                <path
                  // biome-ignore lint/suspicious/noArrayIndexKey: four walls, always in the same order.
                  key={w}
                  ref={(node) => {
                    nodes.current[index].walls[w] = node;
                  }}
                  d={wall.d}
                  className={fill}
                  fillOpacity={wall.shade}
                />
              ))}
              <path
                ref={(node) => {
                  nodes.current[index].roof = node;
                }}
                d={view.roof}
                className={fill}
                fillOpacity={0.95}
              />
              <path
                ref={(node) => {
                  nodes.current[index].panes = node;
                }}
                d={view.panes}
                className="fill-card"
                fillOpacity={0.72}
              />
              {/* The lights that are on. Twinkling is the cheapest way to say a
                  city is inhabited: one path, one animation, no per-window work. */}
              <path
                ref={(node) => {
                  nodes.current[index].lit = node;
                }}
                d={view.lit}
                className="cc-twinkle fill-chart-2"
                style={{ animationDelay: `${(index % 5) * 0.45}s` }}
              />

              {block.marker && (
                <>
                  <path
                    ref={(node) => {
                      nodes.current[index].leader = node;
                    }}
                    d={view.marker?.leader}
                    className={`cc-dash ${block.marker.tone === "amber" ? "stroke-chart-2/50" : "stroke-primary/50"}`}
                    strokeWidth={1.6}
                    strokeDasharray="2 6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <g
                    ref={(node) => {
                      nodes.current[index].pin = node;
                    }}
                    transform={view.marker?.pin}
                  >
                    {/* Drawn around its own tip, so the frame only moves it. */}
                    <g
                      className="cc-float"
                      style={{ animationDelay: `${index * 0.7}s` }}
                    >
                      <path
                        d="M0,0 C-6,-11 -11,-16 -11,-26 A11 11 0 1 1 11,-26 C11,-16 6,-11 0,0 Z"
                        className={
                          block.marker.tone === "amber"
                            ? "fill-chart-2"
                            : "fill-primary"
                        }
                      />
                      <circle cx={0} cy={-26} r={4.4} className="fill-card" />
                    </g>
                  </g>
                </>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
