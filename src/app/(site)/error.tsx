"use client";

import { LogOutIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

/**
 * A page inside the site shell threw.
 *
 * It exists so the header outlives the error. The root boundary replaces the
 * whole tree, nav included, which leaves a signed-in visitor looking at a page
 * with no way off it — and the one failure a retry can never fix is being
 * signed in as the wrong kind of account. Sitting one level down, this keeps
 * the account menu on screen and offers the exit outright.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="page-shell flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" />
      </span>

      <h1 className="h-section max-w-lg">This page did not load</h1>
      <p className="max-w-md text-muted-foreground">
        Nothing you were doing was lost. Try again — and if it keeps happening,
        signing out and back in clears a session that has gone stale.
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

        {isAuthenticated ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOutIcon data-icon="inline-start" />
            Sign out
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            Back to the homepage
          </Button>
        )}
      </div>
    </div>
  );
}
