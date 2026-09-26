/**
 * The isometric city on the auth screens.
 *
 * Drawn rather than dropped in as a raster for two reasons: every fill is a
 * palette token, so it re-tones itself in dark mode instead of sitting on the
 * page as a lit rectangle, and it stays sharp at any panel width without
 * shipping a second asset. It carries no information the copy beside it does
 * not already say, so it is hidden from assistive tech.
 */

/**
 * Half of one ground-plate axis, in the 2:1 projection the whole scene uses.
 * Everything is positioned in plate coordinates — both axes run -1 to 1 — so a
 * building cannot accidentally be placed off the ground.
 */
const AX = 125;
const AY = 62.5;
const ORIGIN = { x: 280, y: 290 };

const plate = (u: number, v: number): [number, number] => [
  ORIGIN.x + (u - v) * AX,
  ORIGIN.y + (u + v) * AY,
];

const poly = (...points: [number, number][]) =>
  points.map(([x, y]) => `${x},${y}`).join(" ");

type Tone = "primary" | "amber" | "teal";

const TONES: Record<Tone, { top: string; right: string; left: string }> = {
  primary: {
    top: "fill-primary/90",
    right: "fill-primary/70",
    left: "fill-primary/50",
  },
  amber: {
    top: "fill-chart-2/85",
    right: "fill-chart-2/65",
    left: "fill-chart-2/45",
  },
  teal: {
    top: "fill-chart-3/85",
    right: "fill-chart-3/65",
    left: "fill-chart-3/45",
  },
};

type BuildingProps = {
  /** Plate coordinates of the base centre. */
  u: number;
  v: number;
  /** Half-width of the footprint, in user units. */
  w: number;
  h: number;
  tone?: Tone;
  cols?: number;
  rows?: number;
};

function Building({
  u,
  v,
  w,
  h,
  tone = "primary",
  cols = 0,
  rows = 0,
}: BuildingProps) {
  const [x, base] = plate(u, v);
  const dep = w / 2;
  const top = base - h;

  const faces = TONES[tone];

  /**
   * A point on one of the two visible faces. `u` runs 0 at the near vertical
   * edge to 1 at the far one, `off` is the drop from the roof line.
   */
  const at = (side: 1 | -1, along: number, off: number) =>
    `${x + side * w * along},${top + dep * (1 - along) + off}`;

  const pane = (side: 1 | -1, a0: number, a1: number, o0: number, o1: number) =>
    `M${at(side, a0, o0)} L${at(side, a1, o0)} L${at(side, a1, o1)} L${at(side, a0, o1)} Z`;

  const panes: string[] = [];
  if (cols > 0 && rows > 0) {
    const across = 0.74 / cols;
    const down = (h - 22) / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const a0 = 0.13 + c * across + across * 0.22;
        const a1 = 0.13 + (c + 1) * across - across * 0.22;
        const o0 = 13 + r * down + down * 0.24;
        const o1 = 13 + (r + 1) * down - down * 0.24;
        panes.push(pane(1, a0, a1, o0, o1), pane(-1, a0, a1, o0, o1));
      }
    }
  }

  return (
    <g>
      <path
        d={`M${x - w},${top} L${x},${top + dep} L${x},${base + dep} L${x - w},${base} Z`}
        className={faces.left}
      />
      <path
        d={`M${x + w},${top} L${x},${top + dep} L${x},${base + dep} L${x + w},${base} Z`}
        className={faces.right}
      />
      <path
        d={`M${x},${top - dep} L${x + w},${top} L${x},${top + dep} L${x - w},${top} Z`}
        className={faces.top}
      />
      {panes.map((d) => (
        <path key={d} d={d} className="fill-card/70" />
      ))}
    </g>
  );
}

/** A report hovering over the block it came from, on its dotted leader. */
function Marker({
  u,
  v,
  roof,
  gap = 30,
  tone,
  delay,
}: {
  u: number;
  v: number;
  /** The height of the block underneath, so the leader stops at its roof. */
  roof: number;
  /** Clear air between that roof and the pin's tip. */
  gap?: number;
  tone: "primary" | "amber";
  delay: string;
}) {
  const [x, ground] = plate(u, v);
  const tip = ground - roof - gap;
  const head = tip - 26;
  const body = tone === "amber" ? "fill-chart-2" : "fill-primary";
  const line = tone === "amber" ? "stroke-chart-2/50" : "stroke-primary/50";

  return (
    <g>
      {/* Only the length that shows: a leader drawn down to the ground
          would be hidden behind the block for all but the last few pixels. */}
      <path
        d={`M${x},${tip + 5} L${x},${ground - roof - 2}`}
        className={`cc-dash ${line}`}
        strokeWidth={1.6}
        strokeDasharray="2 6"
        strokeLinecap="round"
        fill="none"
      />
      <g className="cc-float" style={{ animationDelay: delay }}>
        <path
          d={`M${x},${tip} C${x - 6},${tip - 11} ${x - 11},${tip - 16} ${x - 11},${head} A11 11 0 1 1 ${x + 11},${head} C${x + 11},${tip - 16} ${x + 6},${tip - 11} ${x},${tip} Z`}
          className={body}
        />
        <circle cx={x} cy={head} r={4.4} className="fill-card" />
      </g>
    </g>
  );
}

function Tree({ u, v }: { u: number; v: number }) {
  const [x, y] = plate(u, v);
  return (
    <g>
      <rect
        x={x - 1.4}
        y={y - 8}
        width={2.8}
        height={8}
        className="fill-chart-5/55"
      />
      <circle cx={x} cy={y - 12} r={5.4} className="fill-chart-5/80" />
    </g>
  );
}

export function CityIllustration({ className }: { className?: string }) {
  const [bottom] = [plate(1, 1)];
  const [right] = [plate(1, -1)];
  const [left] = [plate(-1, 1)];

  return (
    <svg
      viewBox="0 0 560 460"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <title>An isometric city block</title>

      {/* The plate, given a little thickness so it reads as ground rather
          than as a flat diamond painted on the background. */}
      <polygon
        points={poly(
          [left[0], left[1]],
          [bottom[0], bottom[1]],
          [bottom[0], bottom[1] + 14],
          [left[0], left[1] + 14],
        )}
        className="fill-primary/25"
      />
      <polygon
        points={poly(
          [right[0], right[1]],
          [bottom[0], bottom[1]],
          [bottom[0], bottom[1] + 14],
          [right[0], right[1] + 14],
        )}
        className="fill-primary/20"
      />
      <polygon
        points={poly(plate(-1, -1), plate(1, -1), plate(1, 1), plate(-1, 1))}
        className="fill-accent"
      />

      {/* Two roads crossing. Buildings are placed clear of both bands. */}
      <polygon
        points={poly(
          plate(-1, -0.05),
          plate(1, -0.05),
          plate(1, 0.15),
          plate(-1, 0.15),
        )}
        className="fill-muted-foreground/20"
      />
      <polygon
        points={poly(
          plate(-0.05, -1),
          plate(0.15, -1),
          plate(0.15, 1),
          plate(-0.05, 1),
        )}
        className="fill-muted-foreground/20"
      />

      <Tree u={-0.34} v={-0.12} />
      <Tree u={-0.34} v={0.3} />
      <Tree u={0.42} v={-0.12} />
      <Tree u={-0.12} v={-0.34} />
      <Tree u={0.3} v={-0.34} />

      {/* Back to front, so the near blocks occlude the far ones. */}
      <Building u={-0.58} v={-0.52} w={30} h={142} cols={3} rows={7} />
      <Building u={-0.88} v={-0.18} w={27} h={108} cols={3} rows={5} />
      <Building
        u={-0.18}
        v={-0.88}
        w={26}
        h={98}
        tone="amber"
        cols={2}
        rows={4}
      />
      <Building
        u={0.42}
        v={-0.78}
        w={24}
        h={66}
        tone="teal"
        cols={2}
        rows={3}
      />
      <Building u={-0.78} v={0.42} w={25} h={58} cols={2} rows={3} />
      <Building u={0.85} v={-0.3} w={22} h={36} cols={2} rows={2} />
      <Building u={-0.3} v={0.85} w={24} h={40} cols={2} rows={2} />
      <Building u={0.3} v={0.42} w={28} h={44} tone="amber" cols={2} rows={2} />

      {/* Two vehicles on the crossing roads. */}
      <Building u={0.52} v={0.05} w={17} h={13} tone="amber" />
      <Building u={0.05} v={-0.46} w={14} h={11} tone="teal" />

      <Marker u={-0.58} v={-0.52} roof={142} tone="primary" delay="0s" />
      <Marker
        u={-0.18}
        v={-0.88}
        roof={98}
        gap={28}
        tone="amber"
        delay="1.4s"
      />
      <Marker
        u={-0.78}
        v={0.42}
        roof={58}
        gap={26}
        tone="primary"
        delay="2.6s"
      />
    </svg>
  );
}
