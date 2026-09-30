"use client";

import {
  ArrowLeftIcon,
  CircleCheckBigIcon,
  CircleSlashIcon,
  Loader2Icon,
  LockIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/loading";
import {
  PaymentStatusPill,
  ServiceRequestStatusPill,
} from "@/components/shared/status-pill";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInitiatePayment, useServiceRequest } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { formatBdt, formatDate, formatDateTime } from "@/lib/format";
import { forgetCheckout, rememberCheckout } from "@/lib/pending-checkout";
import { useAuth } from "@/providers/auth.provider";
import { routes } from "@/routes";
import type { ServiceRequest } from "@/types";
import { CHECKOUT_STEPS } from "../checkout-steps";

/** What the gateway does, in the order the payer meets it. */
const FLOW = [
  {
    icon: WalletIcon,
    title: "You pick how to pay",
    body: "SSLCommerz opens with the methods the city's store supports — card, mobile wallet or internet banking. Nothing is charged until you finish there.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Your card never reaches CityCare",
    body: "The number is typed on the gateway's own page. We keep the amount, the transaction id and the outcome; there is no card field anywhere in this app.",
  },
  {
    icon: ReceiptTextIcon,
    title: "You come back to a verified result",
    body: "The server checks the transaction against SSLCommerz before your application moves, so the result you land on is the one that was recorded.",
  },
] as const;

/**
 * The page the pay button leads to.
 *
 * It exists because the alternative is throwing someone straight at a gateway: a
 * full screen of somebody else's branding asking for a card, with no statement of
 * what is being bought or for how much. This is the last screen that is ours, so
 * it carries the amount, the reference, who the gateway will be told is paying,
 * and what happens on the way back.
 */
export function CheckoutView() {
  const requestId = useSearchParams().get("request") ?? "";
  const {
    data: request,
    isPending,
    isError,
    error,
    refetch,
  } = useServiceRequest(requestId);

  if (!requestId) {
    return (
      <Shell>
        <EmptyState
          icon={WalletIcon}
          title="Nothing to pay for"
          description="This page needs an application to bill. Open the one you want to pay for and press its pay button."
          action={
            <Button
              nativeButton={false}
              render={<Link href={routes.services.requests} />}
            >
              My applications
            </Button>
          }
        />
      </Shell>
    );
  }

  if (isPending) return <DetailPageSkeleton />;

  if (isError) {
    return (
      <Shell>
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Could not open this checkout"
        />
      </Shell>
    );
  }

  if (request.status !== "PENDING_PAYMENT")
    return <Settled request={request} />;

  return <Checkout request={request} />;
}

/** The wash band and gutter every branch of this page shares. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="surface-wash pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="page-shell space-y-8 py-8 lg:py-12">{children}</div>
    </div>
  );
}

function Checkout({ request }: { request: ServiceRequest }) {
  const { user } = useAuth();
  const initiate = useInitiatePayment();

  /**
   * Held apart from the mutation: once the gateway URL is in hand the browser is
   * leaving, and that navigation takes a moment during which `isPending` has
   * already gone false. Without this the button would flip back to "Pay" and
   * invite a second tap, which would open a second transaction.
   */
  const [leaving, setLeaving] = useState(false);
  const busy = initiate.isPending || leaving;

  const fee = request.serviceType.fee;
  const attempts = request.payments ?? [];
  const documents = request.documents ?? [];

  const pay = async () => {
    try {
      rememberCheckout({
        requestId: request.id,
        reference: request.referenceNo,
      });
      const { paymentUrl } = await initiate.mutateAsync({
        serviceRequestId: request.id,
      });
      setLeaving(true);
      window.location.href = paymentUrl;
    } catch (caught) {
      forgetCheckout();
      toast.error(errorMessage(caught));
    }
  };

  return (
    <Shell>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={routes.services.request(request.id)} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Back to the application
      </Button>

      <header className="cc-rise max-w-3xl space-y-3">
        <h1 className="h-section-lg">Pay the {request.serviceType.name} fee</h1>
        <p className="lead text-muted-foreground">
          Check the amount, then continue to SSLCommerz. You can leave this page
          and come back — the fee stays due until it is paid.
        </p>
      </header>

      <Stepper steps={CHECKOUT_STEPS} current={0} className="max-w-3xl" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          {/* ------------------------------------------ what is being paid for */}
          <Card className="cc-rise overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Application
                  </p>
                  <h2 className="h-card text-[17px]">
                    {request.serviceType.name}
                  </h2>
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      {request.referenceNo}
                    </span>
                    <CopyButton
                      value={request.referenceNo}
                      label="Reference copied"
                    />
                  </span>
                </div>
                <ServiceRequestStatusPill status={request.status} />
              </div>

              <dl className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Applied
                  </dt>
                  <dd className="mt-0.5 text-sm">
                    {formatDate(request.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Documents attached
                  </dt>
                  <dd className="mt-0.5 text-sm">{documents.length}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Fee
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium tabular-nums">
                    {formatBdt(fee)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* -------------------------------------------------- how it works */}
          <Card className="cc-rise cc-delay-1">
            <CardContent className="space-y-4 p-5">
              <h2 className="h-card text-[17px]">
                What happens when you press pay
              </h2>
              <ul className="space-y-4">
                {FLOW.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {item.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* ----------------------------------------------- earlier attempts */}
          {attempts.length > 0 && (
            <Card className="cc-rise cc-delay-2">
              <CardContent className="space-y-3 p-5">
                <div className="space-y-1">
                  <h2 className="h-card text-[17px]">Earlier attempts</h2>
                  <p className="text-sm text-muted-foreground">
                    A failed or cancelled attempt charges nothing, and an
                    application can only ever hold one successful payment.
                  </p>
                </div>
                <ul className="space-y-2">
                  {attempts.map((attempt) => (
                    <li
                      key={attempt.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate-id">{attempt.transactionId}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(attempt.paidAt ?? attempt.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm tabular-nums">
                          {formatBdt(attempt.amount)}
                        </span>
                        <PaymentStatusPill status={attempt.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ------------------------------------------------------ the payment */}
        {/* top-20 clears the sticky h-14 header with a little air under it. */}
        <aside className="cc-pop lg:sticky lg:top-20">
          <Card className="border-primary/25">
            <CardContent className="space-y-5 p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Amount due
                </p>
                <p className="font-heading text-4xl font-semibold tabular-nums">
                  {formatBdt(fee)}
                </p>
              </div>

              <Separator />

              <dl className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Service fee</dt>
                  <dd className="tabular-nums">{formatBdt(fee)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatBdt(fee)}</dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                This is the whole amount CityCare hands the gateway — nothing is
                added on top of the fee on the application.
              </p>

              {user && (
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    The gateway will be told you are
                  </p>
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={busy}
                  onClick={() => void pay()}
                >
                  {busy ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <LockIcon data-icon="inline-start" />
                  )}
                  {busy ? "Opening SSLCommerz" : `Pay ${formatBdt(fee)}`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  nativeButton={false}
                  render={<Link href={routes.services.request(request.id)} />}
                >
                  Not now
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Pressing pay takes you off CityCare to SSLCommerz. Backing out
                there charges nothing and leaves the application exactly as it
                is.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Shell>
  );
}

/**
 * Reached by anyone who lands here for a request that is not waiting for money —
 * a second tab, a stale link, or the back button after paying. It says which of
 * those it is instead of offering to charge someone twice.
 */
function Settled({ request }: { request: ServiceRequest }) {
  const closed =
    request.status === "REJECTED" || request.status === "CANCELLED";

  return (
    <Shell>
      <div className="mx-auto max-w-xl">
        <Card
          className={`cc-pop ${closed ? "border-border" : "border-success/30"}`}
        >
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span
              className={`flex size-12 items-center justify-center rounded-full ${
                closed
                  ? "bg-muted text-muted-foreground"
                  : "bg-success/10 text-success"
              }`}
            >
              {closed ? (
                <CircleSlashIcon className="size-6" />
              ) : (
                <CircleCheckBigIcon className="size-6" />
              )}
            </span>

            <div className="space-y-1.5">
              <h1 className="h-section">
                {closed
                  ? "This application is closed"
                  : "This fee is already paid"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {closed
                  ? "Nothing is owed on it. If it was closed in error, apply again from the service catalogue."
                  : "Nothing more is due. The transaction id sits with the application and in your payments list."}
              </p>
            </div>

            <span className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {request.referenceNo}
              </span>
              <ServiceRequestStatusPill status={request.status} />
            </span>

            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                nativeButton={false}
                render={<Link href={routes.services.request(request.id)} />}
              >
                Open the application
              </Button>
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
      </div>
    </Shell>
  );
}
