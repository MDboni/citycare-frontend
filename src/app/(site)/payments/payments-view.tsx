"use client";

import { WalletIcon } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/shared/copy-button";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyPayments } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { formatBdt, formatDateTime } from "@/lib/format";
import { routes } from "@/routes";

export function PaymentsView() {
  const { values, setPage } = useFilterParams({ page: "1" });
  const page = Number(values.page) || 1;

  const { data, isPending, isError, error, refetch } = useMyPayments(page, 10);
  const payments = data?.items ?? [];

  return (
    <div className="page-shell space-y-6 py-8">
      <PageHeader
        title="Payments"
        description="Every fee you have paid through CityCare, with its transaction id. Card details are handled by SSLCommerz and never reach us."
      />

      {isPending && <TableSkeleton rows={5} columns={5} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && payments.length === 0 && (
        <EmptyState
          icon={WalletIcon}
          title="No payments yet"
          description="When you pay a service fee, the receipt and transaction id will be here."
          action={
            <Button
              nativeButton={false}
              render={<Link href={routes.services.catalog} />}
            >
              Browse services
            </Button>
          }
        />
      )}

      {payments.length > 0 && (
        <>
          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.serviceRequest?.serviceType.name ??
                          "Service fee"}
                        {payment.serviceRequest && (
                          <span className="block font-mono text-xs text-muted-foreground">
                            {payment.serviceRequest.referenceNo}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="flex items-center gap-1">
                          <code className="font-mono text-xs">
                            {payment.transactionId}
                          </code>
                          <CopyButton
                            value={payment.transactionId}
                            label="Transaction id copied"
                          />
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-medium tabular-nums">
                        {formatBdt(payment.amount)}
                      </TableCell>

                      <TableCell>
                        <PaymentStatusPill status={payment.status} />
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(payment.paidAt ?? payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <DataPagination
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
            label="payments"
          />
        </>
      )}
    </div>
  );
}
