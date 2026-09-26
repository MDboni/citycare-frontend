"use client";

import { ExternalLinkIcon, ShieldIcon } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

const STAFF_URL = process.env.NEXT_PUBLIC_STAFF_URL ?? "http://localhost:3001";
const STAFF_LOGIN = `${STAFF_URL}/login`;

const LABEL: Record<Exclude<Role, "CITIZEN">, string> = {
  OFFICER: "an officer",
  ADMIN: "an administrator",
};

/**
 * A staff account that tried to sign in on the resident app.
 *
 * This renders *instead of* storing the session, and that is the whole point.
 * Every page on this side calls an endpoint behind `authorize("CITIZEN")`, so
 * an officer or admin who got a session here would hold a perfectly valid one
 * that 403s on all of it — including Account, which is the screen that would
 * have let them sign back out. Refusing the session up front is what keeps the
 * back button working.
 */
export function StaffAccountNotice({
  name,
  role,
  onBack,
}: {
  name: string;
  role: Exclude<Role, "CITIZEN">;
  onBack: () => void;
}) {
  return (
    <AuthCard
      title="That is a staff account"
      description={
        <span className="flex items-start gap-1.5">
          <ShieldIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <strong className="font-medium text-foreground">{name}</strong> is{" "}
            {LABEL[role]}, and this is the resident app. Staff work from the
            CityCare console, which is where the queues, assignments and
            reporting live.
          </span>
        </span>
      }
      footer={
        <>
          Have a resident account too?{" "}
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in with that one
          </button>
        </>
      }
    >
      <Button
        size="lg"
        className="w-full"
        nativeButton={false}
        // A different origin, so this is a real navigation, not a route push.
        // biome-ignore lint/a11y/useAnchorContent: Button supplies the children to the element it renders.
        render={<a href={STAFF_LOGIN} aria-label="Open the staff console" />}
      >
        <ExternalLinkIcon data-icon="inline-start" />
        Open the staff console
      </Button>
    </AuthCard>
  );
}
