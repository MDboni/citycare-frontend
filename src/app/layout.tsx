import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** A second family for headings, so a page has a voice as well as a palette. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CityCare — municipal complaints and civic services",
    template: "%s · CityCare",
  },
  description:
    "Report a municipal issue, track it by its id, apply for a civic service and pay the fee online. CityCare gives every report an SLA clock.",
  applicationName: "CityCare",
  keywords: [
    "municipal complaints",
    "civic services",
    "city services",
    "complaint tracking",
  ],
  openGraph: {
    title: "CityCare",
    description:
      "Report a municipal issue, track it by its id, and apply for civic services online.",
    type: "website",
  },
  /**
   * Tells Dark Reader to leave the page alone.
   *
   * CityCare ships its own dark theme through next-themes, so the extension
   * has nothing to add — it only re-tints a palette that is already correct.
   * It was also rewriting the stroke on every icon between the server render
   * and hydration, which React reports as a hydration mismatch it cannot
   * patch up. This is the opt-out Dark Reader documents for sites that theme
   * themselves; it is a statement about this site, not a silenced warning.
   */
  other: { "darkreader-lock": "true" },
};

/**
 * One colour, not a pair behind prefers-color-scheme media queries.
 *
 * The app does not follow the operating system any more, so the OS is the wrong
 * thing to ask: a phone in dark mode would have tinted the address bar dark
 * above a light page. This is the light value, and ThemeEffects rewrites it
 * when the theme is dark.
 */
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
          {/* Draws nothing at all unless the pointer is a mouse and the machine
              has not asked for less motion; see the component. */}
          <CustomCursor />
        </Providers>
      </body>
    </html>
  );
}
