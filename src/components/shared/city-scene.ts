/**
 * The geometry behind the turntable city, with no React in it.
 *
 * Split out from the component so the projection can be rendered at any angle
 * outside a browser — which is the only way to check isometric maths, since a
 * wrong sign gives you a plausible-looking city with its walls inside out.
 */

// ---------------------------------------------------------------- projection

/** Half-axes of the 2:1 isometric projection, in user units. */
export const AX = 156;
export const AY = 78;
export const ORIGIN = { x: 280, y: 312 };

/** A plate circle of radius 1 projects to this axis-aligned ellipse. */
export const RX = Math.SQRT2 * AX;
export const RY = Math.SQRT2 * AY;
/** How thick the ground disc reads. */
export const RIM = 18;

export type Pt = [number, number];

export const project = (u: number, v: number): Pt => [
  ORIGIN.x + (u - v) * AX,
  ORIGIN.y + (u + v) * AY,
];

const turn = (u: number, v: number, cos: number, sin: number): Pt => [
  u * cos - v * sin,
  u * sin + v * cos,
];

/**
 * The same rotation, as one matrix for everything that lies flat on the ground.
 *
 * Rotating in plate space and projecting is, for flat geometry only, a plain 2D
 * transform: P·R·P⁻¹ works out to a sheared rotation, which is why the disc, the
 * roads and the rings can ride along in a single group instead of being redrawn.
 * Anything with height cannot use it — its walls would lean.
 */
export const groundTransform = (cos: number, sin: number) => {
  const a = cos;
  const b = (AY / AX) * sin;
  const c = -(AX / AY) * sin;
  const d = cos;
  const e = ORIGIN.x - (a * ORIGIN.x + c * ORIGIN.y);
  const f = ORIGIN.y - (b * ORIGIN.x + d * ORIGIN.y);
  return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
};

// --------------------------------------------------------------------- scene

export type Tone = "primary" | "amber" | "teal" | "glass";

export const FILL: Record<Tone, string> = {
  primary: "fill-primary",
  amber: "fill-chart-2",
  teal: "fill-chart-3",
  glass: "fill-card",
};

/**
 * Glazing is the card colour, which sits a shade away from the page: at the
 * opacities the solid tones use, a windscreen would all but vanish. It is
 * carried heavier so the cabin reads against the body under it.
 */
const SHADE_SCALE: Record<Tone, number> = {
  primary: 1,
  amber: 1,
  teal: 1,
  glass: 1.4,
};

export type Block = {
  /** Centre of the footprint, in plate coordinates (the disc is radius 1). */
  u: number;
  v: number;
  /** Half the footprint along the block's own u, in the same coordinates. */
  s: number;
  /** Half the footprint across it. Defaults to `s`; a car is longer than wide. */
  sv?: number;
  /** Height in user units — the one dimension the rotation never touches. */
  h: number;
  /**
   * How far this block is turned on its own footing, in radians.
   *
   * Without it every building would face the same way, so all of them would go
   * flat-on to the camera at the same four angles of the turn — a whole skyline
   * losing its third dimension at once. A few degrees each keeps that from ever
   * lining up, and reads as a city that was not laid out on graph paper.
   */
  yaw: number;
  tone: Tone;
  cols?: number;
  rows?: number;
  marker?: { tone: "primary" | "amber"; gap: number };
  /**
   * Lifts the block off the ground. A car's cabin is the only thing that uses
   * it: it is a second box standing on the roof of the first.
   */
  lift?: number;
  /**
   * Vehicles keep their v (or u) — that fixed value is the lane — and drive
   * along the other axis. `phase` spaces them out, `reverse` sends them the
   * other way so the two lanes of a road are not a convoy.
   */
  drive?: { axis: "u" | "v"; phase: number; reverse?: boolean };
};

/**
 * One car: a body with a cabin standing on it.
 *
 * Two boxes rather than one, because a single box at this size reads as a crate
 * — the step from body to cabin is the whole silhouette of a car when it is
 * twenty pixels long. Both share a centre, so the painter's sort (which is by
 * ground depth) always hands them back in this order and the cabin lands on top
 * of its own roof.
 *
 * `lane` is the offset from the road's centre line, so two cars can pass.
 */
const car = (
  axis: "u" | "v",
  lane: number,
  phase: number,
  tone: Tone,
  reverse = false,
): Block[] => {
  const cross = 0.05 + lane;
  const at = axis === "u" ? { u: 0, v: cross } : { u: cross, v: 0 };
  const drive = { axis, phase, reverse };

  // The long side runs along the road, so it swaps with the axis being driven.
  const body = axis === "u" ? { s: 0.09, sv: 0.036 } : { s: 0.036, sv: 0.09 };
  const cabin =
    axis === "u" ? { s: 0.048, sv: 0.031 } : { s: 0.031, sv: 0.048 };

  return [
    { ...at, ...body, h: 8, yaw: 0, tone, drive },
    { ...at, ...cabin, h: 5, lift: 8, yaw: 0, tone: "glass", drive },
  ];
};

const CARS: Block[] = [
  ...car("u", -0.038, 0, "amber"),
  ...car("u", 0.038, 0.45, "primary", true),
  ...car("v", 0.038, 0.7, "teal"),
];

export const BLOCKS: Block[] = [
  {
    u: -0.3,
    v: -0.34,
    s: 0.12,
    h: 124,
    yaw: 0,
    tone: "primary",
    cols: 3,
    rows: 7,
    marker: { tone: "primary", gap: 26 },
  },
  {
    u: -0.74,
    v: 0.28,
    s: 0.108,
    h: 100,
    yaw: 0.21,
    tone: "primary",
    cols: 3,
    rows: 5,
  },
  {
    u: -0.2,
    v: -0.72,
    s: 0.104,
    h: 92,
    yaw: -0.31,
    tone: "amber",
    cols: 2,
    rows: 4,
    marker: { tone: "amber", gap: 24 },
  },
  {
    u: 0.52,
    v: -0.52,
    s: 0.096,
    h: 66,
    yaw: 0.14,
    tone: "teal",
    cols: 2,
    rows: 3,
  },
  {
    u: -0.54,
    v: 0.54,
    s: 0.1,
    h: 58,
    yaw: -0.17,
    tone: "primary",
    cols: 2,
    rows: 3,
    marker: { tone: "primary", gap: 22 },
  },
  {
    u: 0.8,
    v: -0.22,
    s: 0.088,
    h: 40,
    yaw: 0.38,
    tone: "primary",
    cols: 2,
    rows: 2,
  },
  {
    u: -0.3,
    v: 0.66,
    s: 0.096,
    h: 44,
    yaw: -0.1,
    tone: "primary",
    cols: 2,
    rows: 2,
  },
  {
    u: 0.34,
    v: 0.3,
    s: 0.112,
    h: 48,
    yaw: 0.26,
    tone: "amber",
    cols: 2,
    rows: 2,
  },
  {
    u: 0.28,
    v: -0.3,
    s: 0.08,
    h: 34,
    yaw: -0.44,
    tone: "teal",
    cols: 2,
    rows: 2,
  },
  ...CARS,
];

/** Green patches, as [u, v, radius in plate units]. */
export const PARK: [number, number, number][] = [
  [-0.32, -0.12, 0.07],
  [-0.3, 0.28, 0.06],
  [0.4, -0.12, 0.05],
  [-0.12, -0.32, 0.055],
  [0.28, -0.32, 0.045],
  [0.56, 0.52, 0.08],
  [-0.56, 0.7, 0.06],
];

/**
 * One of the two roads, as a parallelogram in plate space. It overshoots the
 * disc because the clip path, not the geometry, decides where a road ends.
 */
export const band = (axis: "u" | "v") => {
  const far = 1.1;
  const half = 0.1;
  const corners: Pt[] =
    axis === "u"
      ? [
          [-far, 0.05 - half],
          [far, 0.05 - half],
          [far, 0.05 + half],
          [-far, 0.05 + half],
        ]
      : [
          [0.05 - half, -far],
          [0.05 + half, -far],
          [0.05 + half, far],
          [0.05 - half, far],
        ];
  return corners
    .map(([u, v]) => project(u, v))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
};

/** One turn of the table. Slow enough to watch, quick enough to notice. */
export const TURN_SECONDS = 24;
/** How long a car takes to cross the disc. */
const DRIVE_SECONDS = 9;

/**
 * Outward normals of the four walls, as plate-space angles. Rotating the block
 * adds the current angle to each, which is all the visibility and the shading
 * need to know.
 */
const WALL_NORMAL = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
/** Fixed to the camera, not to the city, so turning changes what is lit. */
const LIGHT = -Math.PI / 4;

/** Deterministic, so the lit windows do not flicker between renders. */
const isLit = (block: number, wall: number, col: number, row: number) =>
  (block * 7 + wall * 13 + col * 31 + row * 19) % 11 < 3;

export type Wall = { d: string; shade: number };

export type BlockView = {
  /** Painter's depth: bigger is nearer the viewer. */
  depth: number;
  walls: Wall[];
  roof: string;
  panes: string;
  lit: string;
  marker: { leader: string; pin: string } | null;
};

export const viewOf = (
  block: Block,
  index: number,
  angle: number,
  seconds: number,
): BlockView => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let { u, v } = block;
  if (block.drive) {
    // Drives off one edge and comes back on the other, like traffic passing.
    const along = (((seconds / DRIVE_SECONDS + block.drive.phase) % 1) + 1) % 1;
    const pos = block.drive.reverse ? 0.85 - along * 1.7 : along * 1.7 - 0.85;
    if (block.drive.axis === "u") u = pos;
    else v = pos;
  }

  const { s, h, yaw } = block;
  const sv = block.sv ?? s;
  const lift = block.lift ?? 0;
  const yawCos = Math.cos(yaw);
  const yawSin = Math.sin(yaw);

  // The footprint is turned on its own centre first, then carried round by the
  // table — which is the same thing as one rotation by yaw + angle about the
  // centre, but this way the centre itself only moves with the table.
  const corners: Pt[] = (
    [
      [-s, -sv],
      [s, -sv],
      [s, sv],
      [-s, sv],
    ] as Pt[]
  ).map(([ox, oy]) => {
    const [lu, lv] = turn(ox, oy, yawCos, yawSin);
    const [ru2, rv2] = turn(u + lu, v + lv, cos, sin);
    const [px, py] = project(ru2, rv2);
    // Lifting the base is all a raised box needs: the walls, the roof and the
    // window grid are all measured from these four corners.
    return [px, py - lift] as Pt;
  });

  const [ru, rv] = turn(u, v, cos, sin);
  const [cx, cy] = project(ru, rv);

  const walls: Wall[] = [];
  const panes: string[] = [];
  const lit: string[] = [];

  for (let i = 0; i < 4; i++) {
    const psi = WALL_NORMAL[i] + yaw + angle;

    /**
     * Depth grows with u+v, so the camera looks along that diagonal: a wall
     * faces us exactly when its rotated normal has a positive u+v, which is
     * this. Two walls always pass, and they never overlap each other — so the
     * hidden pair can be dropped rather than sorted behind the visible one.
     */
    if (Math.sin(psi + Math.PI / 4) <= 0) {
      walls.push({ d: "", shade: 0 });
      continue;
    }

    const near = corners[i];
    const far = corners[(i + 1) % 4];
    walls.push({
      d: `M${near[0]},${near[1]} L${far[0]},${far[1]} L${far[0]},${far[1] - h} L${near[0]},${near[1] - h} Z`,
      shade: Math.min(
        0.96,
        (0.4 + 0.36 * (0.5 + 0.5 * Math.cos(psi - LIGHT))) *
          SHADE_SCALE[block.tone],
      ),
    });

    const { cols = 0, rows = 0 } = block;
    if (cols === 0 || rows === 0) continue;

    // A point on the wall: `a` runs along the ground edge, `b` down from the
    // roof. The wall is a parallelogram, so interpolating is exact.
    const at = (a: number, b: number) =>
      `${near[0] + (far[0] - near[0]) * a},${near[1] + (far[1] - near[1]) * a - h + b * h}`;

    const across = 1 / cols;
    const down = 0.82 / rows;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const a0 = (c + 0.24) * across;
        const a1 = (c + 0.76) * across;
        const b0 = 0.1 + (r + 0.22) * down;
        const b1 = 0.1 + (r + 0.78) * down;
        const quad = `M${at(a0, b0)} L${at(a1, b0)} L${at(a1, b1)} L${at(a0, b1)} Z`;
        (isLit(index, i, c, r) ? lit : panes).push(quad);
      }
    }
  }

  const roof = `M${corners[0][0]},${corners[0][1] - h} L${corners[1][0]},${corners[1][1] - h} L${corners[2][0]},${corners[2][1] - h} L${corners[3][0]},${corners[3][1] - h} Z`;

  const marker = block.marker
    ? {
        leader: `M${cx},${cy - h - block.marker.gap + 6} L${cx},${cy - h - 2}`,
        pin: `translate(${cx} ${cy - h - block.marker.gap})`,
      }
    : null;

  return {
    depth: ru + rv,
    walls,
    roof,
    panes: panes.join(" "),
    lit: lit.join(" "),
    marker,
  };
};
