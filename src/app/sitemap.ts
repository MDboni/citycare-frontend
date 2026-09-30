import type { MetadataRoute } from "next";
import { routes } from "@/routes";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Only the pages a stranger can open.
 *
 * Nothing behind the sign-in is listed, and neither is anything with an id in
 * it: a complaint's tracking page is public by design but it is public to
 * whoever holds the id, which is not the same as public to a search engine.
 */
const PUBLIC = [
  { path: routes.home, priority: 1, changeFrequency: "weekly" },
  { path: routes.services.catalog, priority: 0.9, changeFrequency: "weekly" },
  { path: routes.track, priority: 0.8, changeFrequency: "monthly" },
  { path: routes.nearby, priority: 0.7, changeFrequency: "daily" },
  { path: routes.about, priority: 0.6, changeFrequency: "monthly" },
  { path: routes.faq, priority: 0.6, changeFrequency: "monthly" },
  { path: routes.contact, priority: 0.6, changeFrequency: "monthly" },
] as const satisfies readonly {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}[];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC.map((entry) => ({
    url: new URL(entry.path, appUrl).toString(),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
