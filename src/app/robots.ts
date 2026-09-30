import type { MetadataRoute } from "next";
import { PROTECTED_PREFIXES } from "@/routes";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * The crawl rules, taken from the same list the middleware gates on.
 *
 * Written from `PROTECTED_PREFIXES` rather than retyped: a hand-kept copy is a
 * copy that goes stale the first time a route moves, and the failure is silent —
 * nobody notices a crawler collecting redirects. Auth is added on top because
 * those pages are reachable without a session but are worth nothing in an index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PROTECTED_PREFIXES, "/auth"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
