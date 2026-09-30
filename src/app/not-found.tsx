import { HouseIcon, SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="page-shell flex h-16 items-center">
        <Logo />
      </header>

      <main className="page-shell flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="h-display max-w-lg">This page is not here</h1>
        <p className="max-w-md text-muted-foreground">
          The link may be old, or the address may have a typo in it. If you were
          following a complaint, its tracking id will always find it.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            <HouseIcon data-icon="inline-start" />
            Back to the homepage
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={routes.track} />}
          >
            <SearchIcon data-icon="inline-start" />
            Track a complaint
          </Button>
        </div>
      </main>
    </div>
  );
}
