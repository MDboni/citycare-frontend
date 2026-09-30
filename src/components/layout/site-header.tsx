"use client";

import { cn } from "cn";
import { ChevronDownIcon, MenuIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

type NavItem = { href: string; label: string };

/**
 * Home is spelled out even though the logo already goes there.
 *
 * The logo is a convention, not a label — plenty of people look for the word,
 * and on a page deep in a signed-in flow it is the one link that says where the
 * way out is.
 */
const HOME: NavItem = { href: routes.home, label: "Home" };

const PUBLIC_NAV: NavItem[] = [
  HOME,
  { href: routes.track, label: "Track a complaint" },
  { href: routes.services.catalog, label: "Services" },
  { href: routes.nearby, label: "Nearby" },
];

/**
 * Signed in, the bar shows the four things that are *yours* and pushes browsing
 * into More. There is only so much middle: a centred nav has the width between
 * the logo and the actions, and at 1024px seven items plus "Report an issue"
 * does not fit in it — they would squeeze rather than wrap.
 */
const CITIZEN_NAV: NavItem[] = [
  HOME,
  { href: routes.complaints.list, label: "My complaints" },
  { href: routes.services.requests, label: "My requests" },
  { href: routes.payments.list, label: "Payments" },
];

const BROWSE_NAV: NavItem[] = [
  { href: routes.services.catalog, label: "Services" },
  { href: routes.nearby, label: "Nearby" },
];

/** The pages you read once. Same three whether or not you are signed in. */
const INFO_NAV: NavItem[] = [
  { href: routes.about, label: "About" },
  { href: routes.faq, label: "FAQ" },
  { href: routes.contact, label: "Contact" },
];

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

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
      */}
      <div className="page-shell grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* The wrapper keeps the logo link the size of the logo, not of the column. */}
        <div className="flex min-w-0 items-center">
          <Logo />
        </div>

        <nav
          aria-label="Main"
          className="hidden min-w-0 items-center justify-center gap-1 lg:flex"
        >
          {nav.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              className={cn(
                "text-muted-foreground transition-colors",
                isActive(pathname, item.href) && "bg-muted text-foreground",
              )}
              render={
                <Link
                  href={item.href}
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                />
              }
            >
              {item.label}
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground transition-colors",
                    more.some((item) => isActive(pathname, item.href)) &&
                      "bg-muted text-foreground",
                  )}
                />
              }
            >
              More
              <ChevronDownIcon data-icon="inline-end" className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-44">
              {more.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      aria-current={
                        isActive(pathname, item.href) ? "page" : undefined
                      }
                    />
                  }
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          <ThemeToggle />

          {isLoading ? (
            <Skeleton className="size-7 rounded-full" />
          ) : isAuthenticated ? (
            <>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
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
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={routes.auth.login} />}
              >
                Sign in
              </Button>
              <Button
                size="sm"
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
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {isAuthenticated && (
                  <>
                    <Button
                      className="mb-2 justify-start"
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
                {[...nav, ...more].map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "justify-start text-muted-foreground",
                      isActive(pathname, item.href) &&
                        "bg-muted text-foreground",
                    )}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Button>
                ))}
                {!isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="outline"
                      className="justify-start"
                      nativeButton={false}
                      render={<Link href={routes.auth.login} />}
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
