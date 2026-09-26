"use client";

import {
  CircleCheckBigIcon,
  CircleSlashIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/routes";

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
    body: "Your application has moved on to processing. The receipt is in your payments list.",
  },
  failed: {
    icon: OctagonXIcon,
    tone: "bg-destructive/10 text-destructive",
    border: "border-destructive/30",
    title: "The payment failed",
    body: "Nothing was charged. The application is still waiting for its fee, so you can try again.",
  },
  cancelled: {
    icon: CircleSlashIcon,
    tone: "bg-muted text-muted-foreground",
    border: "border-border",
    title: "Payment cancelled",
    body: "You backed out at the gateway and nothing was charged. The application is untouched.",
  },
} as const;

type Outcome = keyof typeof OUTCOMES;

export function PaymentResultView() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const tranId = searchParams.get("tranId");

  const outcome: Outcome | null =
    status === "success" || status === "failed" || status === "cancelled"
      ? status
      : null;

  const meta = outcome
    ? OUTCOMES[outcome]
    : {
        icon: TriangleAlertIcon,
        tone: "bg-warning/15 text-warning",
        border: "border-warning/30",
        title: "We could not read that result",
        body: "The gateway sent something unexpected. Check your payments list — if the fee went through, it will be there.",
      };

  const Icon = meta.icon;

  return (
    <div className="page-shell max-w-lg py-14">
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

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              nativeButton={false}
              render={<Link href={routes.services.requests} />}
            >
              My applications
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
  );
}
