import { cn } from "cn";
import {
  ClockIcon,
  MapPinIcon,
  ThumbsUpIcon,
  TriangleAlertIcon,
  UserCheckIcon,
} from "lucide-react";
import Link from "next/link";
import {
  ComplaintStatusPill,
  PriorityPill,
} from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelative, slaCountdown, truncate } from "@/lib/format";
import { routes } from "@/routes";
import type { ComplaintListItem } from "@/types";

/**
 * A complaint as a list row. Everything on it answers one of three questions: is
 * anyone on it, is it late, and where is it — which is what a citizen scans for.
 */
export function ComplaintCard({
  complaint,
  className,
}: {
  complaint: ComplaintListItem;
  className?: string;
}) {
  const sla = slaCountdown(complaint.slaDueAt, complaint.resolvedAt);

  return (
    <Card className={cn("cc-lift group gap-0", className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Link
              href={routes.complaints.detail(complaint.id)}
              className="rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <h3 className="font-medium underline-offset-4 group-hover:underline">
                {truncate(complaint.title, 90)}
              </h3>
            </Link>
            <p className="font-mono text-xs text-muted-foreground">
              {complaint.trackingId}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <ComplaintStatusPill status={complaint.status} />
            <PriorityPill priority={complaint.priority} />
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Category</dt>
            <dd>{complaint.category.name}</dd>
          </div>

          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Ward</dt>
            <dd className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden />
              Ward {complaint.ward.number}
            </dd>
          </div>

          {complaint.officer && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Assigned officer</dt>
              <dd className="flex items-center gap-1">
                <UserCheckIcon className="size-3.5" aria-hidden />
                {complaint.officer.name}
              </dd>
            </div>
          )}

          {complaint.upvoteCount > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Upvotes</dt>
              <dd className="flex items-center gap-1">
                <ThumbsUpIcon className="size-3.5" aria-hidden />
                {complaint.upvoteCount}
              </dd>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {complaint.isEscalated && (
              <Badge variant="destructive" className="gap-1">
                <TriangleAlertIcon aria-hidden />
                Escalated
              </Badge>
            )}

            {sla && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  sla.overdue ? "font-medium text-destructive" : undefined,
                )}
              >
                <ClockIcon className="size-3.5" aria-hidden />
                {sla.label}
              </span>
            )}

            <span>{formatRelative(complaint.createdAt)}</span>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
