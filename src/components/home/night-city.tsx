/**
 * A city at night with a data network laid over it, drawn rather than
 * photographed.
 *
 * This is the one place in the app that does NOT paint itself from palette
 * tokens. It stands in for a night photograph, and a photograph does not go
 * light when the theme does — the panel is dark in both, and the copy on it is
 * light in both. The accents are the only colour that moves, and they are fixed
 * so the glow reads on a near-black sky, which a mid-tone token would not.
 *
 * Every shape comes out of a seeded generator, so the same slide draws the same
 * skyline on the server and in the browser — an unseeded `Math.random` here
 * would be a hydration mismatch on every load.
 */

export type Accent = "azure" | "violet" | "amber";

const ACCENT: Record<Accent, { line: string; node: string; beam: string }> = {
  azure: { line: "#38bdf8", node: "#7dd3fc", beam: "#22d3ee" },
  violet: { line: "#a78bfa", node: "#c4b5fd", beam: "#e879f9" },
  amber: { line: "#fbbf24", node: "#fde68a", beam: "#fb923c" },
};

/**
 * The sky lifts towards the horizon and the buildings go darker than all of it.
 * A skyline is a silhouette: if the blocks sit at the same value as the sky —
 * which is what the first cut did — all you see is windows hanging in the dark.
 */
const SKY = { top: "#04081a", mid: "#0b1740", low: "#1e3f86" };
const FAR = "#0a1130";
const NEAR = "#050a1c";

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

/** The lights that are on. One path for the lot, as on the isometric city. */
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

export function NightCity({
  id,
  accent = "azure",
  seed,
  className,
}: {
  /** Unique per instance: the gradients are referenced by id. */
  id: string;
  accent?: Accent;
  seed: number;
  className?: string;
}) {
  const next = random(seed);
  const tone = ACCENT[accent];

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

  /** Beams standing on roofs, the way the references have data leaving a block. */
  const beams = near.roofs
    .filter((_, i) => i % 3 === 0)
    .map((roof) => ({
      x: roof.x + roof.w / 2,
      top: roof.y - (90 + next() * 190),
      base: roof.y,
      delay: `${(next() * 4).toFixed(2)}s`,
    }));

  const stars = Array.from({ length: 40 }, () => ({
    x: next() * WIDTH,
    y: next() * 380,
    r: 0.6 + next() * 1.1,
  }));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY.top} />
          <stop offset="58%" stopColor={SKY.mid} />
          <stop offset="100%" stopColor={SKY.low} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor={tone.beam} stopOpacity="0.55" />
          <stop offset="100%" stopColor={tone.beam} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY.top} stopOpacity="0" />
          <stop offset="100%" stopColor={SKY.top} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient
          id={`${id}-beam`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={GROUND}
          x2="0"
          y2={GROUND - 420}
        >
          <stop offset="0%" stopColor={tone.beam} stopOpacity="0.7" />
          <stop offset="100%" stopColor={tone.beam} stopOpacity="0" />
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

      {/* The haze a city throws up, which is what makes a skyline read as night. */}
      <ellipse
        cx={WIDTH / 2}
        cy={GROUND - 90}
        rx={WIDTH * 0.75}
        ry={300}
        fill={`url(#${id}-glow)`}
      />

      <path
        d={far.d}
        fill={FAR}
        stroke={tone.line}
        strokeOpacity={0.14}
        strokeWidth={1}
      />

      <path
        d={near.d}
        fill={NEAR}
        stroke={tone.line}
        strokeOpacity={0.35}
        strokeWidth={1}
      />
      <path
        className="cc-twinkle"
        d={panes}
        fill="#fcd34d"
        opacity={0.9}
        style={{ animationDuration: "3.4s" }}
      />

      {/* Drifts as one piece: the whole network breathing, not fifteen dots. */}
      <g className="cc-mesh">
        <g stroke={tone.line} strokeWidth={1.1} opacity={0.5}>
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
              fill={tone.node}
              opacity={0.18}
            />
            <circle cx={node.x} cy={node.y} r={3} fill={tone.node} />
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
            <circle cx={beam.x} cy={beam.top} r={2.6} fill={tone.beam} />
          </g>
        ))}
      </g>

      {/* Foreground fade, so the copy sitting on the bottom-left always has a
          surface dark enough to read against. */}
      <rect
        y={HEIGHT - 260}
        width={WIDTH}
        height={260}
        fill={`url(#${id}-floor)`}
      />
    </svg>
  );
}
