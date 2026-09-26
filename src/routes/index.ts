/**
 * Every internal href in one place. A typo here is a build error rather than a
 * 404 a user finds first.
 */
export const routes = {
  home: "/",
  track: "/track",
  nearby: "/nearby",

  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    twoFactor: "/auth/two-factor",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },

  complaints: {
    list: "/complaints",
    new: "/complaints/new",
    detail: (id: string) => `/complaints/${id}`,
  },

  services: {
    catalog: "/services",
    apply: (serviceTypeId: string) => `/services/apply?type=${serviceTypeId}`,
    requests: "/services/requests",
    request: (id: string) => `/services/requests/${id}`,
  },

  payments: {
    list: "/payments",
    result: "/payments/result",
  },

  notifications: "/notifications",

  account: {
    profile: "/account",
    security: "/account/security",
    sessions: "/account/sessions",
    data: "/account/data",
  },
} as const;

/** Routes `proxy.ts` refuses without a session cookie. */
export const PROTECTED_PREFIXES = [
  "/complaints",
  "/services/requests",
  "/services/apply",
  "/payments",
  "/notifications",
  "/account",
];

/**
 * Carved back out of the prefixes above.
 *
 * The payment gateway sends the browser to `/payments/result` on its way back
 * from SSLCommerz, and that page only reads a status and a transaction id out of
 * the query string — it fetches nothing. Gating it would mean that a session
 * which lapsed during the checkout swallows the one screen telling the user
 * whether their money moved.
 */
export const PROTECTED_EXCEPTIONS = ["/payments/result"];

/** Signed-in users get bounced away from these. */
export const GUEST_ONLY_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];
