export type DemoRole = "citizen";

/**
 * The seeded evaluation account behind the one-click button on the sign-in
 * page.
 *
 * It is in the bundle on purpose. These are the credentials the seed prints and
 * the README publishes, they only exist on a demo database, and the whole point
 * of the panel is that a reviewer does not have to type them. Set
 * `NEXT_PUBLIC_DEMO_LOGINS=off` and the panel — and with it this string — never
 * renders.
 *
 * Only the resident role lives here. CityCare ships as two apps against one
 * API: officers and administrators sign in on the console, which owns those
 * sessions, and nothing on this side offers to take you there. citizen1 has
 * two-factor off, which is what makes the click land on a page rather than on
 * an OTP screen — citizen2-5 have it on, so this has to stay pointed at
 * citizen1.
 */
export const DEMO_ACCOUNTS = {
  citizen: {
    label: "Citizen",
    email: "citizen1@citycare.com",
    password: "Citizen@12345",
    blurb: "Report an issue, follow it, pay a fee",
  },
} as const satisfies Record<
  DemoRole,
  { label: string; email: string; password: string; blurb: string }
>;

export const DEMO_ROLES = ["citizen"] as const;

/** Whether the panel renders at all. */
export const DEMO_LOGINS_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_LOGINS !== "off";
