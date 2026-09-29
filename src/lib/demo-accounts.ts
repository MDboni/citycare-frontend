import { STAFF_URL } from "@/lib/app-urls";

export type DemoRole = "citizen" | "officer" | "admin";

/**
 * The seeded evaluation accounts, behind the one-click buttons on the sign-in
 * page.
 *
 * These are in the bundle on purpose. They are the credentials the seed prints
 * and the README publishes, they only exist on a demo database, and the whole
 * point of the panel is that a reviewer does not have to type them. Set
 * `NEXT_PUBLIC_DEMO_LOGINS=off` and the panel — and with it these strings —
 * never renders.
 *
 * All three have two-factor off, which is what makes the click actually land
 * somewhere instead of on an OTP screen. citizen2-5 do have it on, so this has
 * to stay pointed at citizen1.
 */
export const DEMO_ACCOUNTS = {
  citizen: {
    label: "Citizen",
    email: "citizen1@citycare.com",
    password: "Citizen@12345",
    blurb: "Report an issue, follow it, pay a fee",
  },
  officer: {
    label: "Officer",
    email: "officer1@citycare.com",
    password: "Officer@12345",
    blurb: "Work a ward queue and close complaints",
  },
  admin: {
    label: "Administrator",
    email: "admin@citycare.com",
    password: "Admin@12345",
    blurb: "Everything, plus roles and permissions",
  },
} as const satisfies Record<
  DemoRole,
  { label: string; email: string; password: string; blurb: string }
>;

export const DEMO_ROLES = ["citizen", "officer", "admin"] as const;

export const isDemoRole = (value: string | null): value is DemoRole =>
  value === "citizen" || value === "officer" || value === "admin";

/** Whether the panel renders at all. */
export const DEMO_LOGINS_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_LOGINS !== "off";

/**
 * This app signs a citizen in itself; staff belong to the console, so those two
 * buttons hand over with `?demo=` and the console finishes the job in one hop.
 */
export const demoHandoffUrl = (role: DemoRole) =>
  `${STAFF_URL}/login?demo=${role}`;
