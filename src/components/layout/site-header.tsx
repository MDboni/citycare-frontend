"use client";

import { cn } from "cn";
import { MenuIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
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

const PUBLIC_NAV: NavItem[] = [
  { href: routes.track, label: "Track a complaint" },
  { href: routes.services.catalog, label: "Services" },
  { href: routes.nearby, label: "Nearby" },
  { href: routes.about, label: "About" },
  { href: routes.faq, label: "FAQ" },
];

const CITIZEN_NAV: NavItem[] = [
  { href: routes.complaints.list, label: "My complaints" },
  { href: routes.services.requests, label: "My requests" },
  { href: routes.payments.list, label: "Payments" },
  { href: routes.services.catalog, label: "Services" },
  { href: routes.nearby, label: "Nearby" },
  { href: routes.faq, label: "FAQ" },
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur transition-[box-shadow,border-color,background-color] duration-300 supports-backdrop-filter:bg-background/65",
        scrolled
          ? "border-border shadow-sm supports-backdrop-filter:bg-background/80"
          : "border-transparent",
      )}
    >
      <div className="page-shell flex h-14 items-center gap-3">
        <Logo />

        <nav
          aria-label="Main"
          className="ml-4 hidden items-center gap-1 lg:flex"
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
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
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
                {nav.map((item) => (
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
