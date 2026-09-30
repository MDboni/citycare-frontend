"use client";

import { ArrowRightIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { ReceiptButton } from "@/components/payments/receipt-button";
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
import type { PaymentListItem } from "@/types";

/**
 * Only an attempt that is still pending ON a request that is still owed can be
 * resumed. A pending row whose request was paid by a later attempt is history,
 * not a bill — and the two layouts below must never disagree about which is
 * which, so they ask the same function.
 */
const payableRequest = (payment: PaymentListItem) =>
  payment.status === "PENDING" &&
  payment.serviceRequest?.status === "PENDING_PAYMENT"
    ? payment.serviceRequest
    : null;

/**
 * One payment as a card, for the widths where the table cannot go.
 *
 * Six columns with a transaction id among them needs about 700px; a phone has
 * 288. The table used to just scroll sideways, which means the amount and the
 * status — the two things anybody opens this page for — were off the right-hand
 * edge until you dragged it.
 */
function PaymentCard({ payment }: { payment: PaymentListItem }) {
  const payable = payableRequest(payment);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">
              {payment.serviceRequest?.serviceType.name ?? "Service fee"}
            </p>
            {payment.serviceRequest && (
              <p className="truncate-id text-muted-foreground">
                {payment.serviceRequest.referenceNo}
              </p>
            )}
          </div>
          <p className="shrink-0 font-medium tabular-nums">
            {formatBdt(payment.amount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {payable ? (
            <Link
              href={routes.payments.checkout(payable.id)}
              aria-label={`Pay the fee for ${payable.referenceNo}`}
              className="inline-flex items-center gap-1.5 rounded underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <PaymentStatusPill status={payment.status} />
              <span className="text-xs text-muted-foreground">Pay now</span>
              <ArrowRightIcon
                className="size-3.5 text-muted-foreground"
                aria-hidden
              />
            </Link>
          ) : (
            <PaymentStatusPill status={payment.status} />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDateTime(payment.paidAt ?? payment.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="flex min-w-0 items-center gap-1">
            <code className="truncate font-mono text-xs text-muted-foreground">
              {payment.transactionId}
            </code>
            <CopyButton
              value={payment.transactionId}
              label="Transaction id copied"
            />
          </span>
          {payment.status === "SUCCESS" && (
            <ReceiptButton
              paymentId={payment.id}
              transactionId={payment.transactionId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentsView() {
  const { values, setPage } = useFilterParams({ page: "1" });
  const page = Number(values.page) || 1;

  const { data, isPending, isError, error, refetch } = useMyPayments(page, 10);
  const payments = data?.items ?? [];

  return (
    <div className="page-shell space-y-6 py-8">
      <PageHeader
        eyebrow="Services"
        title="Payments"
        description="Every fee you have paid through CityCare, with its transaction id and receipt. A row still showing Pending has not been paid — open it from its status to finish. Card details are handled by SSLCommerz and never reach us."
      />

      {isPending && <TableSkeleton rows={5} columns={6} />}

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
          <div className="space-y-3 md:hidden">
            {payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>

          <Card className="hidden overflow-hidden p-0 md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-40" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const payable = payableRequest(payment);

                    return (
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
                          {payable ? (
                            <Link
                              href={routes.payments.checkout(payable.id)}
                              aria-label={`Pay the fee for ${payable.referenceNo}`}
                              className="inline-flex items-center gap-1.5 rounded underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              <PaymentStatusPill status={payment.status} />
                              <span className="text-xs text-muted-foreground">
                                Pay now
                              </span>
                              <ArrowRightIcon
                                className="size-3.5 text-muted-foreground"
                                aria-hidden
                              />
                            </Link>
                          ) : (
                            <PaymentStatusPill status={payment.status} />
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(payment.paidAt ?? payment.createdAt)}
                        </TableCell>

                        <TableCell>
                          {payment.status === "SUCCESS" && (
                            <span className="flex justify-end">
                              <ReceiptButton
                                paymentId={payment.id}
                                transactionId={payment.transactionId}
                              />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
