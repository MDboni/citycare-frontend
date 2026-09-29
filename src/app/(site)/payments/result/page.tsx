import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPageSkeleton } from "@/components/shared/loading";
import { PaymentResultView } from "./payment-result-view";

export const metadata: Metadata = {
  title: "Payment result",
  robots: { index: false, follow: false },
};

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={2} />}>
      <PaymentResultView />
    </Suspense>
  );
}
