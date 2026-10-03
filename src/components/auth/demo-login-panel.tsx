"use client";

import { Loader2Icon, UserCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEMO_ACCOUNTS,
  DEMO_LOGINS_ENABLED,
  DEMO_ROLES,
  type DemoRole,
} from "@/lib/demo-accounts";

/**
 * One-click sign-in for the role this app owns.
 *
 * CityCare ships as two apps against one API, and each signs in its own people:
 * residents here, officers and administrators on the console. A staff session
 * on this side 403s on every page, so there is nothing to offer them — and
 * nothing here navigates to the other app.
 */
export function DemoLoginPanel({
  onDemo,
  pending,
}: {
  onDemo: (role: DemoRole) => void;
  pending: DemoRole | null;
}) {
  if (!DEMO_LOGINS_ENABLED) return null;

  return (
    <section
      aria-labelledby="demo-logins-heading"
      className="space-y-3 rounded-xl border border-dashed border-border bg-muted/40 p-4"
    >
      <div className="flex items-start gap-2.5">
        <UserCheckIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-0.5">
          <h2 id="demo-logins-heading" className="text-sm font-medium">
            Demo login
          </h2>
          <p className="text-xs text-muted-foreground">
            A seeded resident account for reviewing the app. No typing.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {DEMO_ROLES.map((role) => {
          const account = DEMO_ACCOUNTS[role];
          const busy = pending === role;

          return (
            <li key={role}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 bg-background py-2.5 text-left"
                disabled={pending !== null && !busy}
                onClick={() => onDemo(role)}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                  {account.label.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    Sign in as {account.label}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {account.blurb}
                  </span>
                </span>
                {busy ? (
                  <Loader2Icon className="size-4 shrink-0 animate-spin" />
                ) : null}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
