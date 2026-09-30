import type { LucideIcon } from "lucide-react";

/**
 * A city with a data network laid over it, drawn rather than photographed.
 *
 * This is the one thing in the app that does NOT paint itself from palette
 * tokens. It stands in for a photograph, and a photograph does not go light
 * when the theme does — the panel is dark in both, and the copy on it is light
 * in both. The accent is the only colour that moves, and the values are fixed
 * so the glow reads against a near-black sky, which a mid-tone token would not.
 *
 * Every shape comes out of a seeded generator, so the same seed draws the same
 * city on the server and in the browser — an unseeded `Math.random` here would
 * be a hydration mismatch on every load. Change the seed and you get a
 * different skyline; that is how each page gets its own picture without a
 * second file.
 */

export type Accent = "azure" | "violet" | "amber" | "teal";
export type Tone = "night" | "dusk";

const ACCENT: Record<Accent, { line: string; node: string; beam: string }> = {
  azure: { line: "#38bdf8", node: "#7dd3fc", beam: "#22d3ee" },
  violet: { line: "#a78bfa", node: "#c4b5fd", beam: "#e879f9" },
  amber: { line: "#fbbf24", node: "#fde68a", beam: "#fb923c" },
  teal: { line: "#2dd4bf", node: "#99f6e4", beam: "#34d399" },
};

/**
 * Two times of day, and both of them dark.
 *
 * A daylight version was drawn and thrown away: everything on top of this —
 * white captions, the accent glow, the scrim a banner puts over it — assumes
 * the picture is darker than the text, and a pale sky breaks all three at once.
 * Dusk gets the colour of an evening without giving that up, because the
 * buildings stay far darker than the sky behind them. That gap is the whole
 * trick: a skyline is a silhouette, and when the blocks sit at the same value
 * as the sky — which is what the first cut did — all you see is windows
 * hanging in the dark.
 */
const TONES: Record<
  Tone,
  {
    sky: [string, string, string];
    far: string;
    near: string;
    pane: string;
    chip: string;
    stars: number;
    glow: number;
  }
> = {
  night: {
    sky: ["#04081a", "#0b1740", "#1e3f86"],
    far: "#0a1130",
    near: "#050a1c",
    pane: "#fcd34d",
    chip: "#0a132c",
    stars: 40,
    glow: 0.55,
  },
  dusk: {
    sky: ["#1b1340", "#6d2f5f", "#f0995a"],
    far: "#3d2450",
    near: "#1a1030",
    pane: "#ffe3a8",
    chip: "#251642",
    stars: 16,
    glow: 0.3,
  },
};

const WIDTH = 1200;
const HEIGHT = 700;
const GROUND = 640;

/** Deterministic, because both sides of hydration have to draw the same city. */
const random = (seed: number) => {
  let state = (seed || 1) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

type Roof = { x: number; y: number; w: number };

const skyline = (
  next: () => number,
  baseline: number,
  low: number,
  high: number,
) => {
  const blocks: string[] = [];
  const roofs: Roof[] = [];
  let x = -60;

  while (x < WIDTH + 40) {
    const w = 34 + next() * 72;
    const y = baseline - (low + next() * (high - low));
    blocks.push(
      `M${x},${baseline} L${x},${y} L${x + w},${y} L${x + w},${baseline} Z`,
    );
    roofs.push({ x, y, w });
    x += w + next() * 16;
  }

  return { d: blocks.join(" "), roofs };
};

/** The lights that are on. One path for the lot. */
const windows = (next: () => number, roofs: Roof[]) => {
  const panes: string[] = [];

  for (const roof of roofs) {
    const cols = Math.max(1, Math.floor((roof.w - 8) / 13));
    // Capped: past sixteen floors the panes are behind the copy's scrim or off
    // the bottom of the crop, and each one still costs its own subpath.
    const rows = Math.min(16, Math.max(1, Math.floor((roof.y + 300) / 17)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Most windows are dark: a fully lit tower reads as a lightbox.
        if (next() > 0.34) continue;
        const wx = roof.x + 6 + c * 13;
        const wy = roof.y + 11 + r * 17;
        panes.push(`M${wx},${wy} h4.5 v6 h-4.5 Z`);
      }
    }
  }

  return panes.join(" ");
};

export function CitySkyline({
  id,
  accent = "azure",
  tone = "night",
  seed,
  chips,
  view,
  className,
}: {
  /** Unique per instance: the gradients are referenced by id. */
  id: string;
  accent?: Accent;
  tone?: Tone;
  seed: number;
  /**
   * Icons floating over the city on dotted leaders, each one tied down to a
   * rooftop — the smart-city diagram. They are decoration and carry no label,
   * so the page has to say in words whatever they are standing for.
   */
  chips?: LucideIcon[];
  /**
   * The window onto the drawing, when the default one is the wrong shape.
   *
   * The city is composed for a wide band, and `slice` only ever crops the long
   * axis — so in a panel taller than about 12:7 the whole 700 is shown and the
   * top fifth is bare sky. Handing a shorter window, `"0 140 1200 560"`, pushes
   * the horizon up and fills the panel with city instead. Anything with chips
   * wants the full window: they live in the top third.
   */
  view?: string;
  className?: string;
}) {
  const next = random(seed);
  const hue = ACCENT[accent];
  const paint = TONES[tone];

  const far = skyline(next, GROUND + 8, 90, 250);
  const near = skyline(next, HEIGHT + 24, 190, 410);
  const panes = windows(next, near.roofs);

  /** The mesh: points in the sky, each tied to the two nearest to it. */
  const nodes = Array.from({ length: 15 }, () => ({
    x: next() * (WIDTH + 80) - 40,
    y: 150 + next() * 330,
  }));

  const edges: [number, number][] = [];
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        d: Math.hypot(other.x - node.x, other.y - node.y),
      }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of nearest)
      if (!edges.some(([a, b]) => a === j && b === i)) edges.push([i, j]);
  });

  /** Beams standing on roofs, the way a reference has data leaving a block. */
  const beams = near.roofs
    .filter((_, i) => i % 3 === 0)
    .map((roof) => ({
      x: roof.x + roof.w / 2,
      top: roof.y - (90 + next() * 190),
      base: roof.y,
      delay: `${(next() * 4).toFixed(2)}s`,
    }));

  const stars = Array.from({ length: paint.stars }, () => ({
    x: next() * WIDTH,
    y: next() * 380,
    r: 0.6 + next() * 1.1,
  }));

  /**
   * Drawn last, and only when asked for, so a skyline without chips draws
   * exactly what it drew before this existed — the generator is a sequence, and
   * spending numbers from it earlier would redraw every city on the site.
   */
  const marks = (chips ?? []).map((Icon, i) => {
    // Kept to the right half. A banner's scrim is heaviest on the left, where
    // the heading sits, and the first draft put a chip under the darkest part
    // of it — drawn, paid for, and invisible.
    const span = (WIDTH * 0.52) / ((chips?.length ?? 1) + 1);
    const x = WIDTH * 0.46 + span * (i + 1) + (next() - 0.5) * span * 0.5;
    // Low enough that a short banner's window still contains the whole chip:
    // at r=30 these span 210..330, and the band a banner shows starts at 203.
    const y = 240 + next() * 60;
    const roof = near.roofs.reduce((best, current) =>
      Math.abs(current.x + current.w / 2 - x) <
      Math.abs(best.x + best.w / 2 - x)
        ? current
        : best,
    );
    return { Icon, x, y, foot: roof.y, key: `${i}-${Math.round(x)}` };
  });

  return (
    <svg
      viewBox={view ?? `0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paint.sky[0]} />
          <stop offset="58%" stopColor={paint.sky[1]} />
          <stop offset="100%" stopColor={paint.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor={hue.beam} stopOpacity={paint.glow} />
          <stop offset="100%" stopColor={hue.beam} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paint.sky[0]} stopOpacity="0" />
          <stop offset="100%" stopColor={paint.sky[0]} stopOpacity="0.85" />
        </linearGradient>
        {/* userSpaceOnUse, not the default: a vertical line has a zero-width
            bounding box, and an objectBoundingBox gradient on one degenerates
            to nothing at all. */}
        <linearGradient
          id={`${id}-beam`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={GROUND}
          x2="0"
          y2={GROUND - 420}
        >
          <stop offset="0%" stopColor={hue.beam} stopOpacity="0.7" />
          <stop offset="100%" stopColor={hue.beam} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-sky)`} />

      <g fill="#dbeafe">
        {stars.map((star) => (
          <circle
            key={`${star.x}-${star.y}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            opacity={0.35 + star.r / 4}
          />
        ))}
      </g>

      {/* The haze a city throws up, which is what makes a skyline read as one. */}
      <ellipse
        cx={WIDTH / 2}
        cy={GROUND - 90}
        rx={WIDTH * 0.75}
        ry={300}
        fill={`url(#${id}-glow)`}
      />

      <path
        d={far.d}
        fill={paint.far}
        stroke={hue.line}
        strokeOpacity={0.14}
        strokeWidth={1}
      />

      <path
        d={near.d}
        fill={paint.near}
        stroke={hue.line}
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <path
        className="cc-twinkle"
        d={panes}
        fill={paint.pane}
        opacity={0.9}
        style={{ animationDuration: "3.4s" }}
      />

      {/* Drifts as one piece: the whole network breathing, not fifteen dots. */}
      <g className="cc-mesh">
        <g stroke={hue.line} strokeWidth={1.1} opacity={0.5}>
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
            />
          ))}
        </g>
        {nodes.map((node, i) => (
          <g key={`${node.x}-${node.y}`}>
            <circle
              className="cc-twinkle"
              style={{ animationDelay: `${(i % 5) * 0.6}s` }}
              cx={node.x}
              cy={node.y}
              r={9}
              fill={hue.node}
              opacity={0.18}
            />
            <circle cx={node.x} cy={node.y} r={3} fill={hue.node} />
          </g>
        ))}
      </g>

      <g>
        {beams.map((beam) => (
          <g
            key={`${beam.x}-${beam.top}`}
            className="cc-beam"
            style={{ animationDelay: beam.delay }}
          >
            <line
              x1={beam.x}
              y1={beam.base}
              x2={beam.x}
              y2={beam.top}
              stroke={`url(#${id}-beam)`}
              strokeWidth={2.2}
            />
            <circle cx={beam.x} cy={beam.top} r={2.6} fill={hue.beam} />
          </g>
        ))}
      </g>

      {marks.map((mark, i) => (
        <g
          key={mark.key}
          className="cc-float"
          style={{ animationDelay: `${i * 0.6}s` }}
        >
          <line
            x1={mark.x}
            y1={mark.y + 30}
            x2={mark.x}
            y2={mark.foot}
            stroke={hue.line}
            strokeOpacity={0.4}
            strokeWidth={1.4}
            strokeDasharray="3 7"
            strokeLinecap="round"
          />
          <circle
            cx={mark.x}
            cy={mark.foot}
            r={3}
            fill={hue.line}
            opacity={0.7}
          />
          <circle
            cx={mark.x}
            cy={mark.y}
            r={30}
            fill={paint.chip}
            fillOpacity={0.85}
            stroke={hue.line}
            strokeOpacity={0.7}
            strokeWidth={1.4}
          />
          {/* A nested <svg>: lucide draws on a 24-box, and x/y/width/height
              place that box without touching the icon's own paths. */}
          <mark.Icon
            x={mark.x - 13}
            y={mark.y - 13}
            width={26}
            height={26}
            color={hue.node}
            strokeWidth={1.7}
          />
        </g>
      ))}

      {/* Foreground fade, so copy sitting low on the panel always has a surface
          dark enough to read against. */}
      <rect
        y={HEIGHT - 260}
        width={WIDTH}
        height={260}
        fill={`url(#${id}-floor)`}
      />
    </svg>
  );
}
