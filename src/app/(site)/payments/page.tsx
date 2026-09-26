import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = {
  title: "Payments",
  description: "Your CityCare service fee payments and receipts.",
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading payments" />}>
      <PaymentsView />
    </Suspense>
  );
}
