import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = {
  title: "Payments",
  description: "Your CityCare service fee payments and receipts.",
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton rows={6} columns={4} />}>
      <PaymentsView />
    </Suspense>
  );
}
