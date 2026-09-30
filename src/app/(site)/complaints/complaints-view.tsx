"use client";

import { MegaphoneIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import {
  COMPLAINT_FILTER_DEFAULTS,
  ComplaintFilters,
  type ComplaintFilterValues,
  toComplaintQuery,
} from "@/components/complaints/complaint-filters";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useMyComplaints } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { routes } from "@/routes";

export function ComplaintsView() {
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams<ComplaintFilterValues>(COMPLAINT_FILTER_DEFAULTS);

  const query = toComplaintQuery(values);
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useMyComplaints(query);

  const complaints = data?.items ?? [];

  return (
    <div className="page-shell space-y-6 py-8">
      <PageHeader
        eyebrow="Complaints"
        title="My complaints"
        description="Everything you have reported, newest first. Open one to comment, add a photo, or close it once the work is done."
        actions={
          <Button
            nativeButton={false}
            render={<Link href={routes.complaints.new} />}
          >
            <PlusIcon data-icon="inline-start" />
            Report an issue
          </Button>
        }
      />

      <ComplaintFilters
        values={values}
        onChange={setFilter}
        onReset={reset}
        isFiltered={isFiltered}
      />

      {isPending && <TableSkeleton rows={4} columns={4} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && complaints.length === 0 && (
        <EmptyState
          icon={MegaphoneIcon}
          title={
            isFiltered ? "Nothing matches those filters" : "No complaints yet"
          }
          description={
            isFiltered
              ? "Try widening the status or clearing the search box."
              : "When you report a broken streetlight or an overflowing bin, it will show up here with a tracking id."
          }
          action={
            isFiltered ? (
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            ) : (
              <Button
                nativeButton={false}
                render={<Link href={routes.complaints.new} />}
              >
                Report your first issue
              </Button>
            )
          }
        />
      )}

      {complaints.length > 0 && (
        <>
          {/* Dim the list, rather than unmount it, while the next page loads. */}
          <div
            className={
              isPlaceholderData
                ? "cc-stagger grid gap-3 opacity-60 transition-opacity xl:grid-cols-2"
                : "cc-stagger grid gap-3 xl:grid-cols-2"
            }
          >
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>

          <DataPagination
            meta={data?.meta}
            page={query.page}
            onPageChange={setPage}
            label="complaints"
          />
        </>
      )}
    </div>
  );
}
