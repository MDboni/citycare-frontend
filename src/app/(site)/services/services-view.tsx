"use client";

import { ArrowRightIcon, FileTextIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useServiceTypes } from "@/hooks";
import { formatBdt } from "@/lib/format";
import { routes } from "@/routes";

/**
 * The public service catalogue. Inactive types are filtered out here as well as
 * server-side, so an admin toggling one off takes it out of the list on the next
 * cache read rather than leaving a dead application form behind.
 */
export function ServicesView() {
  const { data, isPending, isError, error, refetch } = useServiceTypes();
  const [search, setSearch] = useState("");

  const services = (data ?? [])
    .filter((service) => service.isActive)
    .filter((service) =>
      service.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

  return (
    <div className="page-shell space-y-6 py-8">
      <PageHeader
        title="Civic services"
        description="Licences, certificates and permits you can apply for online. Pay the fee, upload the documents, and follow the file by its reference number."
      />

      <div className="relative max-w-sm">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search services"
          aria-label="Search services"
          className="pl-8"
        />
      </div>

      {isPending && <CardGridSkeleton count={6} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && services.length === 0 && (
        <EmptyState
          icon={FileTextIcon}
          title={
            search ? "No service matches that" : "No services are open yet"
          }
          description={
            search
              ? "Try a shorter search, or browse the whole list."
              : "An administrator has not published any service types. Check back soon."
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      )}

      {services.length > 0 && (
        <ul className="cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <li key={service.id}>
              <Card className="cc-lift h-full gap-0">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <FileTextIcon className="size-4" />
                    </span>
                    <Badge variant="secondary" className="shrink-0">
                      {formatBdt(service.fee)}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h2 className="h-card">{service.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Fee payable on application. You can attach supporting
                      documents once the application exists.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    nativeButton={false}
                    render={<Link href={routes.services.apply(service.id)} />}
                  >
                    Apply
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
