import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { PaymentResultView } from "./payment-result-view";

export const metadata: Metadata = {
  title: "Payment result",
  robots: { index: false, follow: false },
};

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Checking the payment" />}>
      <PaymentResultView />
    </Suspense>
  );
}
