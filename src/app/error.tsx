"use client";

import { LogOutIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

/**
 * The last resort for a render that threw. Data failures are handled inside the
 * pages by ErrorState, so anything arriving here is a genuine bug — which is why
 * the digest is shown rather than a friendly guess at what went wrong.
 *
 * This one replaces the site shell, header and all, so Sign out is offered
 * outright: the account menu it would normally live in is gone, and "try again"
 * is no help at all when the thing that broke is the session itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="page-shell flex h-14 items-center">
        <Logo />
      </header>

      <main className="page-shell flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-6" />
        </span>

        <h1 className="h-section max-w-lg">Something broke on our side</h1>
        <p className="max-w-md text-muted-foreground">
          Nothing you were doing was lost. Try again, and if it keeps happening
          the reference below will help whoever looks into it.
        </p>

        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Reference {error.digest}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <RefreshCwIcon data-icon="inline-start" />
            Try again
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            Back to the homepage
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOutIcon data-icon="inline-start" />
              Sign out
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
