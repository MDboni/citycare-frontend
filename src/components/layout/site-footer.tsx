import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";
import { routes } from "@/routes";

const COLUMNS = [
  {
    title: "Report",
    links: [
      { href: routes.complaints.new, label: "Report an issue" },
      { href: routes.track, label: "Track a complaint" },
      { href: routes.nearby, label: "Issues near you" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: routes.services.catalog, label: "Service catalogue" },
      { href: routes.services.requests, label: "My applications" },
      { href: routes.payments.list, label: "Payments" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: routes.auth.login, label: "Sign in" },
      { href: routes.auth.register, label: "Create an account" },
      { href: routes.account.security, label: "Security" },
    ],
  },
  {
    title: "CityCare",
    links: [
      { href: routes.about, label: "About" },
      { href: routes.faq, label: "FAQ" },
      { href: routes.contact, label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="page-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-heading text-base font-semibold tracking-tight">
              City<span className="text-primary">Care</span>
            </span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Municipal complaints and civic services, with a tracking id for
            every report and an SLA clock that anyone can see.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className="space-y-3"
          >
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
              {column.title}
            </p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="page-shell flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} CityCare. A civic service portal.
          </p>
          <p>
            Payments are processed by SSLCommerz. CityCare never sees a card
            number.
          </p>
        </div>
      </div>
    </footer>
  );
}
