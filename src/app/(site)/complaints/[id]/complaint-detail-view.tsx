"use client";

import { cn } from "cn";
import {
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  ThumbsUpIcon,
  TriangleAlertIcon,
  UserCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { ComplaintActions } from "@/components/complaints/complaint-actions";
import { ComplaintAttachments } from "@/components/complaints/complaint-attachments";
import { ComplaintComments } from "@/components/complaints/complaint-comments";
import { StatusTimeline } from "@/components/complaints/status-timeline";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { FullPageSpinner } from "@/components/shared/loading";
import {
  ComplaintStatusPill,
  PriorityPill,
} from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useComplaint } from "@/hooks";
import { formatDateTime, slaCountdown } from "@/lib/format";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function ComplaintDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const {
    data: complaint,
    isPending,
    isError,
    error,
    refetch,
  } = useComplaint(id);

  if (isPending) return <FullPageSpinner label="Loading complaint" />;

  if (isError) {
    return (
      <div className="page-shell page-shell-read py-10">
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Could not open this complaint"
        />
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={routes.complaints.list} />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back to my complaints
          </Button>
        </div>
      </div>
    );
  }

  const role = user?.role ?? "CITIZEN";
  const isOwner = complaint.citizen.id === user?.id;
  const sla = slaCountdown(complaint.slaDueAt, complaint.resolvedAt);

  /**
   * Comments carry an author id but not a name. The two names this page does
   * know are the reporter and the assigned officer, which covers every author a
   * citizen can see; anything else falls back to a generic label.
   */
  const authorNames: Record<string, string> = {
    [complaint.citizen.id]: complaint.citizen.name,
    ...(complaint.officer
      ? { [complaint.officer.id]: complaint.officer.name }
      : {}),
  };

  return (
    <div className="page-shell page-shell-read space-y-6 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={routes.complaints.list} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        My complaints
      </Button>

      {/* --------------------------------------------------------------- header */}
      <div className="space-y-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <ComplaintStatusPill status={complaint.status} />
          <PriorityPill priority={complaint.priority} />
          {complaint.isEscalated && (
            <Badge variant="destructive" className="gap-1">
              <TriangleAlertIcon aria-hidden />
              SLA breached
            </Badge>
          )}
          {complaint.reopenCount > 0 && (
            <Badge variant="outline">
              Reopened {complaint.reopenCount}
              {complaint.reopenCount === 1 ? " time" : " times"}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="h-section">{complaint.title}</h1>
          <div className="flex items-center gap-1">
            <p className="font-mono text-sm text-muted-foreground">
              {complaint.trackingId}
            </p>
            <CopyButton
              value={complaint.trackingId}
              label="Tracking id copied"
            />
          </div>
        </div>

        <ComplaintActions complaint={complaint} role={role} isOwner={isOwner} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* ------------------------------------------------------------- main */}
        <div className="space-y-7">
          <section className="space-y-2">
            <h2 className="h-card">What was reported</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {complaint.description}
            </p>
          </section>

          <ComplaintAttachments
            complaintId={complaint.id}
            attachments={complaint.attachments}
            canUpload={
              isOwner
                ? complaint.attachments.length < 5
                : role === "OFFICER" || role === "ADMIN"
            }
            role={role}
          />

          {complaint.feedback && (
            <section className="space-y-2">
              <h2 className="h-card">Your rating</h2>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div
                    role="img"
                    className="flex items-center gap-0.5"
                    aria-label={`${complaint.feedback.rating} out of 5`}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <StarIcon
                        key={value}
                        className={cn(
                          "size-4",
                          value <= (complaint.feedback?.rating ?? 0)
                            ? "fill-warning text-warning"
                            : "text-muted-foreground/40",
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-sm text-muted-foreground">
                      {complaint.feedback.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          <Separator />

          <ComplaintComments
            complaintId={complaint.id}
            comments={complaint.comments}
            currentUserId={user?.id ?? ""}
            role={role}
            authorNames={authorNames}
          />
        </div>

        {/* ------------------------------------------------------------- aside */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="h-card">Details</h2>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Category
                  </dt>
                  <dd className="mt-0.5">
                    {complaint.category.name}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {complaint.category.slaHours}h SLA
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Ward
                  </dt>
                  <dd className="mt-0.5">
                    Ward {complaint.ward.number} — {complaint.ward.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Location
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5">
                    <MapPinIcon
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{complaint.address}</span>
                  </dd>
                  {complaint.latitude != null &&
                    complaint.longitude != null && (
                      <dd className="mt-1 ml-5">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                        >
                          {complaint.latitude}, {complaint.longitude}
                        </a>
                      </dd>
                    )}
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Assigned to
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5">
                    {complaint.officer ? (
                      <>
                        <UserCheckIcon
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        {complaint.officer.name}
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Not assigned yet
                      </span>
                    )}
                  </dd>
                </div>

                {sla && (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      SLA
                    </dt>
                    <dd
                      className={cn(
                        "mt-0.5 flex items-center gap-1.5",
                        sla.overdue && "font-medium text-destructive",
                      )}
                    >
                      <ClockIcon className="size-3.5" aria-hidden />
                      {sla.label}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Upvotes
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5">
                    <ThumbsUpIcon
                      className="size-3.5 text-muted-foreground"
                      aria-hidden
                    />
                    {complaint.upvoteCount}
                    <span className="text-xs text-muted-foreground">
                      10 raises the priority
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Reported
                  </dt>
                  <dd className="mt-0.5">
                    {formatDateTime(complaint.createdAt)}
                  </dd>
                </div>

                {complaint.resolvedAt && (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Resolved
                    </dt>
                    <dd className="mt-0.5">
                      {formatDateTime(complaint.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="h-card">Timeline</h2>
              <StatusTimeline entries={complaint.history} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
