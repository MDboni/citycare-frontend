"use client";

import {
  ArrowLeftIcon,
  CreditCardIcon,
  Loader2Icon,
  PaperclipIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentList } from "@/components/services/document-list";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { FilePicker } from "@/components/shared/file-picker";
import { DetailPageSkeleton } from "@/components/shared/loading";
import {
  PaymentStatusPill,
  ServiceRequestStatusPill,
} from "@/components/shared/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useInitiatePayment,
  useServiceRequest,
  useUploadServiceDocument,
} from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { DOCUMENT_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { formatBdt, formatDateTime } from "@/lib/format";
import { routes } from "@/routes";

export function RequestDetailView({ id }: { id: string }) {
  const {
    data: request,
    isPending,
    isError,
    error,
    refetch,
  } = useServiceRequest(id);
  const initiate = useInitiatePayment();
  const upload = useUploadServiceDocument(id);

  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (isPending) return <DetailPageSkeleton />;

  if (isError) {
    return (
      <div className="page-shell page-shell-read py-10">
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Could not open this application"
        />
      </div>
    );
  }

  /**
   * Paying means leaving the site. The API returns a gateway URL and the browser
   * follows it; CityCare never sees a card number, which is why there is no form
   * here to fill in.
   */
  const pay = async () => {
    try {
      const { paymentUrl } = await initiate.mutateAsync({
        serviceRequestId: request.id,
      });
      window.location.href = paymentUrl;
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  const submitDocument = async () => {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }
    if (label.trim().length < 2) {
      toast.error("Give the document a label of at least 2 characters.");
      return;
    }

    try {
      await upload.mutateAsync({ file, label: label.trim() });
      toast.success("Document attached.");
      setLabel("");
      setFile(null);
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  const payments = request.payments ?? [];
  const documents = request.documents ?? [];
  const details = request.details ?? null;
  const awaitingPayment = request.status === "PENDING_PAYMENT";

  return (
    <div className="page-shell page-shell-read space-y-6 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={routes.services.requests} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        My applications
      </Button>

      <div className="space-y-3 border-b border-border pb-5">
        <ServiceRequestStatusPill status={request.status} />
        <div className="space-y-1.5">
          <h1 className="h-section">{request.serviceType.name}</h1>
          <div className="flex items-center gap-1">
            <p className="font-mono text-sm text-muted-foreground">
              {request.referenceNo}
            </p>
            <CopyButton value={request.referenceNo} label="Reference copied" />
          </div>
        </div>
      </div>

      {awaitingPayment && (
        <Alert>
          <CreditCardIcon />
          <AlertTitle>The fee is outstanding</AlertTitle>
          <AlertDescription>
            <span>
              {formatBdt(request.serviceType.fee)} is due before this
              application is processed. You will be taken to SSLCommerz and back
              again.
            </span>
            <Button
              className="mt-2 w-fit"
              disabled={initiate.isPending}
              onClick={() => void pay()}
            >
              {initiate.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CreditCardIcon data-icon="inline-start" />
              )}
              Pay {formatBdt(request.serviceType.fee)}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="h-card">Application</h2>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Fee
              </dt>
              <dd className="mt-0.5 text-sm">
                {formatBdt(request.serviceType.fee)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Applied
              </dt>
              <dd className="mt-0.5 text-sm">
                {formatDateTime(request.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Last updated
              </dt>
              <dd className="mt-0.5 text-sm">
                {formatDateTime(request.updatedAt)}
              </dd>
            </div>
          </dl>

          {details && Object.keys(details).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Details you submitted
                </p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(details).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <dt className="text-xs text-muted-foreground">{key}</dt>
                      <dd className="mt-0.5 text-sm break-words">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ documents */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="h-card">Supporting documents</h2>

          <DocumentList serviceRequestId={request.id} documents={documents} />

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="document-label">Document label</FieldLabel>
              <Input
                id="document-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Trade licence renewal form"
                maxLength={80}
              />
            </div>

            <FilePicker
              accept={DOCUMENT_MIME_TYPES}
              maxSize={MAX_FILE_SIZE}
              disabled={upload.isPending}
              onSelect={setFile}
              hint="JPG, PNG, WEBP or PDF up to 4 MB"
            />

            <Button
              disabled={upload.isPending || !file}
              onClick={() => void submitDocument()}
            >
              {upload.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PaperclipIcon data-icon="inline-start" />
              )}
              Attach document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- payments */}
      {payments.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <h2 className="h-card">Payments</h2>
            <ul className="space-y-2">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs break-all">
                      {payment.transactionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.paidAt
                        ? formatDateTime(payment.paidAt)
                        : formatDateTime(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {formatBdt(payment.amount)}
                    </span>
                    <PaymentStatusPill status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
