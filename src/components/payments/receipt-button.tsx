"use client";

import { FileTextIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { paymentsApi } from "@/api";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api-error";

/**
 * Downloads the receipt PDF for one payment.
 *
 * A plain link cannot do this: the endpoint is authenticated with a bearer token
 * that only lives in JavaScript, so the bytes are fetched and handed to a
 * throwaway anchor. That also means the file never sits behind a public URL that
 * would still work for anyone who found it later.
 */
export function ReceiptButton({
  paymentId,
  transactionId,
  label = "Receipt (PDF)",
  variant = "outline",
  size = "sm",
  className,
}: {
  paymentId: string;
  transactionId: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await paymentsApi.receipt(paymentId);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `CityCare-receipt-${transactionId}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();

      // Revoked on a delay, not immediately: Safari reads the object URL after
      // the click returns, and pulling it out from under the download cancels it.
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={busy}
      onClick={() => void download()}
    >
      {busy ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <FileTextIcon data-icon="inline-start" />
      )}
      {label}
    </Button>
  );
}
