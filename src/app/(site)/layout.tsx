import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* First in the DOM, so it is first in the tab order. */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      {/*
        tabIndex -1 so the skip link actually moves focus here. Without it the
        browser scrolls to the target and leaves focus on the link, and the next
        Tab goes straight back into the header the reader was skipping.
      */}
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
