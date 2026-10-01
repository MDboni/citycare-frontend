import type { NextConfig } from "next";

/**
 * The API is on a different origin and which one depends on the environment, so
 * `connect-src` is derived from the same variable the browser client reads
 * rather than hard-coded. Getting this wrong is silent at build time and fatal
 * in the browser: every fetch is blocked with nothing but a console message.
 */
const apiOrigin = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:5000";
  }
})();

const isDev = process.env.NODE_ENV === "development";

/**
 * No nonce, deliberately.
 *
 * Next inlines its hydration bootstrap, so a strict `script-src` needs a
 * per-request nonce — and a nonce forces every page to render dynamically,
 * which would turn this app's prerendered pages into serverless functions. The
 * trade is stated plainly: `'unsafe-inline'` does not stop an injected inline
 * script. What the rest of this policy stops is that script loading more code,
 * reaching any origin but our own API, rewriting `<base>`, posting a form
 * somewhere else, or framing the page — which is most of what an XSS is worth.
 */
const csp = [
  "default-src 'self'",
  // accounts.google.com serves the Google Identity client the sign-in button loads.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com`,
  // Google Identity pulls a stylesheet of its own from the same origin as its
  // script, and without it the sign-in button renders unstyled.
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  // next/font/google self-hosts at build time, so no external font origin.
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
  // The dev entry covers Next's HMR websocket.
  `connect-src 'self' ${apiOrigin} https://accounts.google.com${isDev ? " ws: wss:" : ""}`,
  // The Google sign-in button renders inside an iframe from this origin.
  "frame-src https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // geolocation stays on: /nearby and the new-complaint form both ask for it.
    key: "Permissions-Policy",
    value:
      "geolocation=(self), clipboard-write=(self), camera=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    /**
     * Complaint photos and avatars are uploaded to Cloudinary by the API, so the
     * optimiser has to be told that host is allowed. Without this entry
     * next/image refuses the URL rather than serving an unoptimised original.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Google profile pictures, for accounts that signed up with Google.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
