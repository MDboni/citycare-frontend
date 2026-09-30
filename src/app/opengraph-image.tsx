import { ImageResponse } from "next/og";

export const alt = "CityCare — municipal complaints and civic services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The same seeded generator the on-page skyline uses, cut down to one path. */
const skyline = () => {
  let state = 20260930;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  const blocks: string[] = [];
  let x = -40;
  while (x < 1240) {
    const w = 46 + next() * 84;
    const h = 90 + next() * 180;
    blocks.push(
      `M${x},630 L${x},${630 - h} L${x + w},${630 - h} L${x + w},630 Z`,
    );
    x += w + next() * 18;
  }
  return blocks.join(" ");
};

/**
 * The card that shows up when somebody pastes a CityCare link into a chat.
 *
 * Generated rather than exported from a design tool, so it cannot drift from
 * the site the way a checked-in PNG does — the wording here is the wording on
 * the home page. It is drawn with flat shapes on purpose: this renders through
 * satori, which is not a browser, and the full on-page skyline is several
 * hundred paths and four gradients that it has no reason to agree with.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background:
          "linear-gradient(160deg, #04081a 0%, #0b1740 58%, #14306b 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* The city, flat and behind everything. */}
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", left: 0, top: 0 }}
        aria-hidden="true"
      >
        <path d={skyline()} fill="#050a1c" fillOpacity="0.85" />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="68" height="68" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="10" fill="#3b82f6" />
          <path
            transform="translate(4 4) scale(1)"
            fill="#ffffff"
            fillRule="evenodd"
            d="M12 2.4c-3.75 0-6.8 3.02-6.8 6.75 0 2.35 1.34 4.86 2.77 6.83a28 28 0 0 0 3.32 3.79c.4.38 1.02.38 1.42 0a28 28 0 0 0 3.32-3.79c1.43-1.97 2.77-4.48 2.77-6.83C18.8 5.42 15.75 2.4 12 2.4Zm0 9.5a2.62 2.62 0 1 1 0-5.25 2.62 2.62 0 0 1 0 5.25Z"
          />
        </svg>
        <span
          style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          CityCare
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          Tell the city what is broken.
        </span>
        <span style={{ fontSize: 30, color: "#a9c0e8", maxWidth: "880px" }}>
          Every report gets a tracking id, a ward, a department and an SLA clock
          that anyone can see.
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {["Report an issue", "Track by id", "Pay a fee"].map((item) => (
          <span
            key={item}
            style={{
              display: "flex",
              fontSize: 22,
              color: "#cbd9f2",
              padding: "10px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(147,197,253,0.35)",
              background: "rgba(147,197,253,0.10)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>,
    size,
  );
}
