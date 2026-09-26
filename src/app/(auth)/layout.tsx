import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { routes } from "@/routes";

/**
 * The auth shell is deliberately not the site shell: no nav to wander into
 * mid-signup, and the marketing panel only appears once there is room for it.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="page-shell flex h-14 shrink-0 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={routes.track}
            className="rounded-lg px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Track a complaint
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="page-shell shrink-0 py-5 text-center text-xs text-muted-foreground">
        CityCare keeps a security log of every sign-in. If something looks
        wrong, check your devices from your account.
      </footer>
    </div>
  );
}
