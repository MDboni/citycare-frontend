"use client";

import {
  CircleCheckBigIcon,
  CircleSlashIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReceiptButton } from "@/components/payments/receipt-button";
import { CopyButton } from "@/components/shared/copy-button";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyPayments } from "@/hooks";
import {
  forgetCheckout,
  type PendingCheckout,
  readCheckout,
} from "@/lib/pending-checkout";
import { routes } from "@/routes";
import { CHECKOUT_STEPS } from "../checkout-steps";

/**
 * Where the gateway sends the browser back to.
 *
 * It reports what the backend already decided: the redirect only arrives after
 * the server has verified the transaction against the gateway validation API and
 * written the outcome. Nothing here confirms a payment on its own — the query
 * string is a message about work that is already done.
 */
const OUTCOMES = {
  success: {
    icon: CircleCheckBigIcon,
    tone: "bg-success/10 text-success",
    border: "border-success/30",
    title: "Payment received",
    body: "The fee is settled and the transaction is on record.",
    nextTitle: "What happens now",
    next: [
      "Your application is marked paid and sits in the queue for the desk that handles it.",
      "A receipt carrying this transaction id is emailed to the address on your account, and the same PDF downloads from here or from your payments list.",
      "Every status change after this arrives as a notification here.",
    ],
  },
  failed: {
    icon: OctagonXIcon,
    tone: "bg-destructive/10 text-destructive",
    border: "border-destructive/30",
    title: "The payment failed",
    body: "The gateway could not complete it, so nothing was charged.",
    nextTitle: "Where that leaves you",
    next: [
      "No money moved. A failed attempt never charges a card.",
      "The application still owes its fee and is otherwise untouched.",
      "A fresh attempt gets its own transaction id, so this one stays in the record.",
    ],
  },
  cancelled: {
    icon: CircleSlashIcon,
    tone: "bg-muted text-muted-foreground",
    border: "border-border",
    title: "Payment cancelled",
    body: "You backed out at the gateway and nothing was charged.",
    nextTitle: "Where that leaves you",
    next: [
      "No money moved, and the application is exactly as you left it.",
      "The fee stays due until it is paid — there is no deadline on this page.",
      "Pick it up again whenever you are ready.",
    ],
  },
} as const;

type Outcome = keyof typeof OUTCOMES;

const UNREADABLE = {
  icon: TriangleAlertIcon,
  tone: "bg-warning/15 text-warning-foreground dark:text-warning",
  border: "border-warning/30",
  title: "We could not read that result",
  body: "The gateway sent something this page does not recognise.",
  nextTitle: "What to do",
  next: [
    "Your payments list is the record — if the fee went through, the transaction is in it.",
    "Look there before paying again: an application can only hold one successful payment, and a second attempt on a settled fee is refused.",
  ],
} as const;

export function PaymentResultView() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const tranId = searchParams.get("tranId");

  const outcome: Outcome | null =
    status === "success" || status === "failed" || status === "cancelled"
      ? status
      : null;

  const meta = outcome ? OUTCOMES[outcome] : UNREADABLE;
  const Icon = meta.icon;

  /**
   * The application this payment belonged to, left behind by the checkout page
   * before it handed the browser over — the gateway's redirect carries only a
   * status and a transaction id. It is used for one thing: pointing "try again"
   * at the right application instead of the whole list. Read after the first
   * paint, because the server has no session storage to read.
   */
  const [pending, setPending] = useState<PendingCheckout | null>(null);
  useEffect(() => {
    setPending(readCheckout());
    if (outcome === "success") forgetCheckout();
  }, [outcome]);

  const retryable = outcome === "failed" || outcome === "cancelled";

  /**
   * The receipt is offered straight away, which needs the payment's id — and the
   * gateway's redirect carries only the transaction id. The user's own list is
   * asked for it, and only after a success: on any other outcome there is no
   * receipt to fetch, and this page is reachable without a session.
   */
  const { data: mine } = useMyPayments(1, 20, outcome === "success");
  const paid = tranId
    ? (mine?.items ?? []).find(
        (payment) =>
          payment.transactionId === tranId && payment.status === "SUCCESS",
      )
    : undefined;

  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="surface-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="page-shell space-y-6 py-10 lg:py-14">
        <div className="mx-auto max-w-2xl space-y-6">
          <Stepper
            steps={CHECKOUT_STEPS}
            current={outcome === "success" ? 2 : 1}
          />

          <Card className={`cc-pop ${meta.border}`}>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <span
                className={`flex size-12 items-center justify-center rounded-full ${meta.tone}`}
              >
                <Icon className="size-6" />
              </span>

              <div className="space-y-1.5">
                <h1 className="h-section">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">{meta.body}</p>
              </div>

              {tranId && (
                <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <div className="min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Transaction</p>
                    <code className="block truncate font-mono text-sm">
                      {tranId}
                    </code>
                  </div>
                  <CopyButton value={tranId} label="Transaction id copied" />
                </div>
              )}

              {pending?.reference && retryable && (
                <p className="text-xs text-muted-foreground">
                  Application{" "}
                  <span className="font-mono">{pending.reference}</span>
                </p>
              )}

              {paid && (
                <ReceiptButton
                  paymentId={paid.id}
                  transactionId={paid.transactionId}
                  label="Download receipt (PDF)"
                  variant="default"
                  size="default"
                  className="w-full"
                />
              )}

              <div className="flex w-full flex-col gap-2 sm:flex-row">
                {retryable ? (
                  <Button
                    className="flex-1"
                    nativeButton={false}
                    render={
                      <Link
                        href={
                          pending
                            ? routes.payments.checkout(pending.requestId)
                            : routes.services.requests
                        }
                      />
                    }
                  >
                    Try again
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    nativeButton={false}
                    render={<Link href={routes.services.requests} />}
                  >
                    My applications
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={routes.payments.list} />}
                >
                  View payments
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cc-rise cc-delay-1">
            <CardContent className="space-y-3 p-5">
              <h2 className="h-card text-[17px]">{meta.nextTitle}</h2>
              <ul className="space-y-2.5">
                {meta.next.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm">
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
                    />
                    <span className="text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
