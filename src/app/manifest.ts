import type { MetadataRoute } from "next";

/**
 * The install manifest.
 *
 * Kept deliberately small: this is a form-heavy site with an offline story of
 * "none", so it declares what a name-and-icon install needs and claims nothing
 * about working without a network. `display: standalone` is the honest choice —
 * a report still needs the API, it just stops showing a browser chrome.
 *
 * The theme colour matches the light page, the same value ThemeEffects writes
 * into the meta tag; the manifest cannot follow a theme, so it takes the
 * default one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CityCare — municipal complaints and civic services",
    short_name: "CityCare",
    description:
      "Report a municipal issue, track it by its id, apply for a civic service and pay the fee online.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["government", "utilities"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
