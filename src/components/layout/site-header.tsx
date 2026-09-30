"use client";

import { cn } from "cn";
import {
  BriefcaseIcon,
  ChevronDownIcon,
  CircleQuestionMarkIcon,
  HouseIcon,
  InfoIcon,
  LogInIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  MegaphoneIcon,
  MenuIcon,
  PlusIcon,
  ScrollTextIcon,
  SearchIcon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

/**
 * A place in the app, and the hue it lights up in.
 *
 * The hue is only ever decoration — it rides on hover, on the icon in the sheet
 * and on the bar under the current link, and every one of those states is also
 * carried by `aria-current` or by a shape. Nothing here is said in colour alone.
 * The mixing and the contrast that goes with it live in `.cc-nav-link`.
 */
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tint: string;
};

const tintOf = (item: Pick<NavItem, "tint">) =>
  ({ "--cc-nav": item.tint }) as CSSProperties;

/**
 * Home is spelled out even though the logo already goes there.
 *
 * The logo is a convention, not a label — plenty of people look for the word,
 * and on a page deep in a signed-in flow it is the one link that says where the
 * way out is.
 */
const HOME: NavItem = {
  href: routes.home,
  label: "Home",
  icon: HouseIcon,
  tint: "var(--primary)",
};

/** The two that move between the bar and More depending on who is looking. */
const SERVICES: NavItem = {
  href: routes.services.catalog,
  label: "Services",
  icon: BriefcaseIcon,
  tint: "var(--chart-3)",
};

const NEARBY: NavItem = {
  href: routes.nearby,
  label: "Nearby",
  icon: MapPinIcon,
  tint: "var(--chart-5)",
};

const PUBLIC_NAV: NavItem[] = [
  HOME,
  {
    href: routes.track,
    label: "Track a complaint",
    icon: SearchIcon,
    tint: "var(--chart-4)",
  },
  SERVICES,
  NEARBY,
];

/**
 * Signed in, the bar shows the four things that are *yours* and pushes browsing
 * into More. There is only so much middle: a centred nav has the width between
 * the logo and the actions, and at 1024px seven items plus "Report an issue"
 * does not fit in it — they would squeeze rather than wrap.
 */
const CITIZEN_NAV: NavItem[] = [
  HOME,
  {
    href: routes.complaints.list,
    label: "My complaints",
    icon: MegaphoneIcon,
    tint: "var(--chart-4)",
  },
  {
    href: routes.services.requests,
    label: "My requests",
    icon: ScrollTextIcon,
    tint: "var(--chart-3)",
  },
  {
    href: routes.payments.list,
    label: "Payments",
    icon: WalletIcon,
    tint: "var(--chart-2)",
  },
];

const BROWSE_NAV: NavItem[] = [SERVICES, NEARBY];

/** The pages you read once. Same three whether or not you are signed in. */
const INFO_NAV: NavItem[] = [
  {
    href: routes.about,
    label: "About",
    icon: InfoIcon,
    tint: "var(--chart-1)",
  },
  {
    href: routes.faq,
    label: "FAQ",
    icon: CircleQuestionMarkIcon,
    tint: "var(--chart-4)",
  },
  {
    href: routes.contact,
    label: "Contact",
    icon: MailIcon,
    tint: "var(--chart-5)",
  },
];

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

/**
 * A link in the centred bar.
 *
 * A plain anchor, not a ghost `Button`: this is a link, and rendering one
 * through the button primitive hands it `role="button"` — which tells a screen
 * reader it does something to this page rather than going to another one.
 */
function NavLink({ item, current }: { item: NavItem; current: boolean }) {
  return (
    <Link
      href={item.href}
      className="cc-nav-link"
      style={tintOf(item)}
      aria-current={current ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

/** The same link, full width, for the sheet and its 44px thumb target. */
function NavRow({
  item,
  current,
  onNavigate,
}: {
  item: NavItem;
  current: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      className="cc-nav-row"
      style={tintOf(item)}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
    >
      <item.icon className="size-4" />
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * The bar sits flush with the page until it has something to sit on top of,
   * then earns a shadow. Listening passively keeps it off the scroll critical
   * path, and the initial call covers a restored scroll position on reload.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = isAuthenticated ? CITIZEN_NAV : PUBLIC_NAV;
  /** Whatever the bar could not hold, so nothing is only in one place. */
  const more = isAuthenticated ? [...BROWSE_NAV, ...INFO_NAV] : INFO_NAV;
  const moreIsCurrent = more.some((item) => isActive(pathname, item.href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur transition-[box-shadow,border-color,background-color] duration-300 supports-backdrop-filter:bg-background/65",
        scrolled
          ? "border-border shadow-sm supports-backdrop-filter:bg-background/80"
          : "border-transparent",
      )}
    >
      {/*
        Three columns rather than a flex row, and the two outer ones share the
        leftover width equally (1fr each) so the nav lands on the centre of the
        header rather than the centre of whatever the logo left behind. With
        `justify-center` in a flex row it would drift sideways every time the
        right-hand side changed width — one notification bell, a longer name, a
        Sign in button instead of an avatar.

        When the sides genuinely need more than their half, the track grows past
        1fr and the nav slides off centre. That is the wanted failure: better
        off-centre than sitting underneath the avatar.

        h-16 rather than h-14: the links are a 36px target with a bar under them
        now, and 56px left the bar sitting on the header's own border.

        The grid only starts at lg, which is also the only width the centred nav
        exists at. Below that it is a plain flex row: logo hard left, controls
        hard right, nothing in between. A three-column grid with its middle
        column display:none still carries both of its gaps and still asks two
        1fr tracks to agree on a split — all of which is machinery for centring
        something that is not on the screen.
      */}
      <div className="page-shell flex h-16 items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-3">
        {/* The wrapper keeps the logo link the size of the logo, not of the column. */}
        <div className="flex min-w-0 shrink items-center">
          <Logo />
        </div>

        <nav
          aria-label="Main"
          className="hidden min-w-0 items-center justify-center gap-1 lg:flex"
        >
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              current={isActive(pathname, item.href)}
            />
          ))}

          <DropdownMenu>
            {/* Not a Button: the trigger wears the same pill as its neighbours,
                and the primitive already gives it the button semantics it needs. */}
            <DropdownMenuTrigger
              className="cc-nav-link"
              style={tintOf({ tint: "var(--chart-1)" })}
              data-current={moreIsCurrent || undefined}
            >
              More
              <ChevronDownIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52 p-1.5">
              {more.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  className="h-9 gap-2.5 px-2"
                  render={
                    <Link
                      href={item.href}
                      aria-current={
                        isActive(pathname, item.href) ? "page" : undefined
                      }
                    />
                  }
                >
                  {/* The hue is set on the element, not in a class: the menu
                      recolours everything inside a highlighted row, and an
                      inline colour is the one thing that survives it. */}
                  <item.icon style={{ color: item.tint }} />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
          <ThemeToggle />

          {isLoading ? (
            <Skeleton className="size-7 rounded-full" />
          ) : isAuthenticated ? (
            <>
              <Button
                size="lg"
                className="cc-sheen hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href={routes.complaints.new} />}
              >
                <PlusIcon data-icon="inline-start" />
                Report an issue
              </Button>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              {/*
                Both of these used to sit here at every width, and the bar was
                365px wide inside the 288px a 320px screen has — it overflowed
                on every phone narrower than about 414px. They step in as the
                room arrives, and until then they are the first two things in
                the menu.
              */}
              <Button
                variant="ghost"
                size="lg"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href={routes.auth.login} />}
              >
                Sign in
              </Button>
              <Button
                size="lg"
                className="cc-sheen hidden xs:inline-flex"
                nativeButton={false}
                render={<Link href={routes.auth.register} />}
              >
                Get started
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 max-w-[85vw]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              {/* px-2, not the header's p-4: the rows carry their own 12px, and this
                  is what lines their icons up under the panel title. */}
              <nav aria-label="Mobile" className="flex flex-col gap-0.5 px-2">
                {!isAuthenticated && (
                  <>
                    <Button
                      size="lg"
                      className="cc-sheen mb-2 justify-start"
                      nativeButton={false}
                      render={<Link href={routes.auth.register} />}
                      onClick={() => setOpen(false)}
                    >
                      <UserPlusIcon data-icon="inline-start" />
                      Get started
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="mb-2 justify-start"
                      nativeButton={false}
                      render={<Link href={routes.auth.login} />}
                      onClick={() => setOpen(false)}
                    >
                      <LogInIcon data-icon="inline-start" />
                      Sign in
                    </Button>
                    <Separator className="mb-2" />
                  </>
                )}
                {isAuthenticated && (
                  <>
                    <Button
                      size="lg"
                      className="cc-sheen mb-2 justify-start"
                      nativeButton={false}
                      render={<Link href={routes.complaints.new} />}
                      onClick={() => setOpen(false)}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Report an issue
                    </Button>
                    <Separator className="mb-2" />
                  </>
                )}
                {nav.map((item) => (
                  <NavRow
                    key={item.href}
                    item={item}
                    current={isActive(pathname, item.href)}
                    onNavigate={() => setOpen(false)}
                  />
                ))}

                {/* The overflow, kept visibly apart from the four that matter
                    rather than run on from them. */}
                <Separator className="my-2" />
                {more.map((item) => (
                  <NavRow
                    key={item.href}
                    item={item}
                    current={isActive(pathname, item.href)}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
