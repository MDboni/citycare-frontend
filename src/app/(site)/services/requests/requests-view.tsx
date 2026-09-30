"use client";

import { ArrowRightIcon, FileTextIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceRequestStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyServiceRequests } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { SERVICE_REQUEST_STATUS_META } from "@/lib/constants";
import { formatBdt, formatDate } from "@/lib/format";
import { routes } from "@/routes";
import { SERVICE_REQUEST_STATUSES, type ServiceRequestStatus } from "@/types";

const DEFAULTS = { status: "all", page: "1" };

export function RequestsView() {
  const { values, setFilter, setPage, isFiltered, reset } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;
  const { data, isPending, isError, error, refetch } = useMyServiceRequests({
    page,
    limit: 10,
    ...(values.status !== "all"
      ? { status: values.status as ServiceRequestStatus }
      : {}),
  });

  const requests = data?.items ?? [];

  return (
    <div className="page-shell space-y-6 py-8">
      <PageHeader
        eyebrow="Services"
        title="My applications"
        description="Every service you have applied for, with its fee status and reference number."
        actions={
          <Button
            nativeButton={false}
            render={<Link href={routes.services.catalog} />}
          >
            <PlusIcon data-icon="inline-start" />
            New application
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Select
          value={values.status}
          onValueChange={(value) => setFilter("status", String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {SERVICE_REQUEST_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {SERVICE_REQUEST_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      {isPending && <TableSkeleton rows={4} columns={4} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && requests.length === 0 && (
        <EmptyState
          icon={FileTextIcon}
          title={
            isFiltered ? "Nothing with that status" : "No applications yet"
          }
          description={
            isFiltered
              ? "Try a different status, or clear the filter."
              : "Browse the service catalogue to apply for a licence, certificate or permit."
          }
          action={
            <Button
              variant={isFiltered ? "outline" : "default"}
              nativeButton={false}
              render={
                <Link
                  href={
                    isFiltered
                      ? routes.services.requests
                      : routes.services.catalog
                  }
                />
              }
            >
              {isFiltered ? "Clear filter" : "Browse services"}
            </Button>
          }
        />
      )}

      {requests.length > 0 && (
        <>
          <ul className="cc-stagger grid gap-3 xl:grid-cols-2">
            {requests.map((request) => (
              <li key={request.id}>
                <Card className="cc-lift group h-full gap-0">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={routes.services.request(request.id)}
                        className="rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <h2 className="font-medium underline-offset-4 group-hover:underline">
                          {request.serviceType.name}
                        </h2>
                      </Link>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono">{request.referenceNo}</span>
                        <span>{formatBdt(request.serviceType.fee)}</span>
                        <span>Applied {formatDate(request.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <ServiceRequestStatusPill status={request.status} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open ${request.referenceNo}`}
                        nativeButton={false}
                        render={
                          <Link href={routes.services.request(request.id)} />
                        }
                      >
                        <ArrowRightIcon />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <DataPagination
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
            label="applications"
          />
        </>
      )}
    </div>
  );
}
