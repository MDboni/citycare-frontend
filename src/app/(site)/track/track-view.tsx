"use client";

import { MapPinIcon, SearchXIcon, TriangleAlertIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { StatusTimeline } from "@/components/complaints/status-timeline";
import { TrackWidget } from "@/components/complaints/track-widget";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  ComplaintStatusPill,
  PriorityPill,
} from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaintTracking } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { TRACKING_ID_PATTERN } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export function TrackView() {
  const searchParams = useSearchParams();
  const raw = (searchParams.get("id") ?? "").trim().toUpperCase();
  const valid = TRACKING_ID_PATTERN.test(raw);

  const { data, isLoading, isError, error, refetch } = useComplaintTracking(
    raw,
    valid,
  );

  const notFound = isError && toApiError(error).status === 404;

  return (
    <div className="page-shell space-y-6 py-10">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h1 className="h-section">Track a complaint</h1>
        <p className="text-muted-foreground">
          Anyone with the tracking id can see where a complaint stands. Names,
          addresses and comments stay private.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-5">
          <TrackWidget autoFocus={!raw} />
        </CardContent>
      </Card>

      {raw && !valid && (
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={TriangleAlertIcon}
            title="That does not look like a tracking id"
            description="They are shaped like CC-2026-000123 — the year CityCare received the complaint, then a six digit number."
          />
        </div>
      )}

      {valid && isLoading && (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4 p-5" aria-hidden>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      )}

      {valid && notFound && (
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={SearchXIcon}
            title="No complaint with that id"
            description="Check the id against your confirmation email. A deleted complaint also stops being trackable."
          />
        </div>
      )}

      {valid && isError && !notFound && (
        <div className="mx-auto max-w-2xl">
          <ErrorState error={error} onRetry={() => void refetch()} />
        </div>
      )}

      {data && (
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <CardTitle className="font-mono text-base">
                  {data.trackingId}
                </CardTitle>
                <CopyButton
                  value={data.trackingId}
                  label="Tracking id copied"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <ComplaintStatusPill status={data.status} />
                <PriorityPill priority={data.priority} />
                {data.isEscalated && (
                  <Badge variant="destructive">Escalated</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Category
                </dt>
                <dd className="mt-0.5 text-sm">{data.category.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Ward
                </dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
                  <MapPinIcon className="size-3.5 text-muted-foreground" />
                  Ward {data.ward.number} — {data.ward.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Reported
                </dt>
                <dd className="mt-0.5 text-sm">
                  {formatDateTime(data.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {data.closedAt ? "Closed" : "Resolved"}
                </dt>
                <dd className="mt-0.5 text-sm">
                  {formatDateTime(data.closedAt ?? data.resolvedAt)}
                </dd>
              </div>
            </dl>

            <Separator />

            <div className="space-y-3">
              <h2 className="h-card">Timeline</h2>
              <StatusTimeline entries={data.history} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
