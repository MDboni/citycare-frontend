import { ClockIcon, MegaphoneIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { CityIllustration } from "@/components/shared/city-illustration";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { routes } from "@/routes";

const POINTS = [
  {
    icon: MegaphoneIcon,
    title: "Report in a minute",
    body: "A photo and a pin are enough. We work out the ward and the department.",
  },
  {
    icon: ClockIcon,
    title: "Watch the clock, not your inbox",
    body: "Every report gets an SLA and a public status you can check by its id.",
  },
  {
    icon: WalletIcon,
    title: "Apply and pay in one place",
    body: "Trade licences, water connections, holding tax — no second queue.",
  },
] as const;

/**
 * The auth shell is deliberately not the site shell: no nav to wander into
 * mid-signup. The panel beside the form is what the form is for, and it only
 * appears once there is room for it — below `lg` the card takes the screen on
 * its own rather than pushing the fields under the fold.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="page-shell flex h-16 shrink-0 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/*
            Hidden under 360px. Measured, this row is 287px of the 288 a 320px
            screen leaves after the gutters — one pixel of headroom is not
            headroom, and the link is in the footer of every page anyway.
          */}
          <Link
            href={routes.track}
            className="hidden rounded-lg px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 xs:inline-block"
          >
            Track a complaint
          </Link>
        </div>
      </header>

      {/*
        Centred by an auto margin rather than by `items-center`, and that is a
        bug fix, not a preference. A centred flex item that is taller than the
        line overflows it at BOTH ends, and there is nothing above the top of a
        document to scroll to — so on a phone the signup card, which is about
        900px tall against the 540px this row gets, had its title cut off above
        the screen and unreachable. An auto margin in the cross axis centres the
        card while there is room and resolves to zero once there is not, which
        is the behaviour that was wanted in the first place.
      */}
      <main className="page-shell flex flex-1 items-start py-8 sm:py-12">
        <div className="m-auto grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">
          <section className="cc-rise hidden lg:flex lg:flex-col lg:gap-7">
            <CityIllustration className="w-full max-w-[33rem]" />

            <div className="space-y-5">
              <h2 className="h-section max-w-sm text-balance">
                One city, one place to ask.
              </h2>

              <ul className="cc-stagger space-y-4">
                {POINTS.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <point.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {point.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {point.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="mx-auto w-full max-w-md space-y-7 lg:mx-0 lg:space-y-0">
            {children}

            {/*
              What the panel says, for the screens the panel is not on. Three
              lines and no illustration: the form is the reason anybody is here
              and the brand does not get to push it further down the page.
            */}
            <ul className="cc-stagger space-y-2.5 px-1 lg:hidden">
              {POINTS.map((point) => (
                <li
                  key={point.title}
                  className="flex items-center gap-2.5 text-xs text-muted-foreground"
                >
                  <point.icon className="size-3.5 shrink-0 text-primary" />
                  {point.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="page-shell shrink-0 py-5 text-center text-xs text-muted-foreground">
        CityCare keeps a security log of every sign-in. If something looks
        wrong, check your devices from your account.
      </footer>
    </div>
  );
}
