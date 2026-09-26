"use client";

import { cn } from "cn";
import {
  GlobeIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRevokeSession, useSessions } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, formatRelative } from "@/lib/format";
import { clearDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";

/** A crude but useful read of a user agent — enough to recognise your own laptop. */
const describeDevice = (userAgent: string | null) => {
  if (!userAgent) return "Unknown device";

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : /Firefox\//.test(userAgent)
            ? "Firefox"
            : "Browser";

  const platform = /Windows/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad/.test(userAgent)
        ? "iOS"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown";

  return `${browser} on ${platform}`;
};

export function SessionsView() {
  const { signOut } = useAuth();
  const { data, isPending, isError, error, refetch } = useSessions();
  const revoke = useRevokeSession();

  const sessions = data ?? [];

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="h-card">Where you are signed in</h2>
            <p className="text-sm text-muted-foreground">
              Each row is a live session. Revoking one kills its tokens
              immediately — a refresh from that device will not bring it back.
            </p>
          </div>

          <Separator />

          {isPending && <TableSkeleton rows={3} columns={3} />}

          {isError && (
            <ErrorState error={error} onRetry={() => void refetch()} />
          )}

          {!isPending && !isError && sessions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No active sessions, which is unusual given that you are reading
              this. Try refreshing.
            </p>
          )}

          {sessions.length > 0 && (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
                    session.current
                      ? "border-primary/30 bg-primary/[0.03]"
                      : "border-border",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MonitorSmartphoneIcon className="size-4" />
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {session.deviceName ??
                            describeDevice(session.userAgent)}
                        </p>
                        {session.current && (
                          <Badge variant="secondary">This device</Badge>
                        )}
                      </div>

                      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {session.ip && (
                          <span className="flex items-center gap-1">
                            <GlobeIcon className="size-3" aria-hidden />
                            {session.ip}
                          </span>
                        )}
                        <span title={formatDateTime(session.lastUsedAt)}>
                          Last used {formatRelative(session.lastUsedAt)}
                        </span>
                        <span>Started {formatDateTime(session.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      disabled={revoke.isPending}
                      onClick={async () => {
                        try {
                          await revoke.mutateAsync(session.id);
                          toast.success("That session is gone.");
                        } catch (caught) {
                          toast.error(errorMessage(caught));
                        }
                      }}
                    >
                      {revoke.isPending ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <LogOutIcon />
                      )}
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/25">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="h-card">Sign out everywhere</h2>
            <p className="text-sm text-muted-foreground">
              Revokes every session including this one, and forgets any trusted
              device. Use this if you think someone else has your password.
            </p>
          </div>

          <Button
            variant="destructive"
            className="shrink-0"
            onClick={() => {
              clearDeviceToken();
              void signOut({ everywhere: true });
            }}
          >
            <LogOutIcon data-icon="inline-start" />
            Sign out everywhere
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
