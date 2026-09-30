import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailPageSkeleton } from "@/components/shared/loading";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review a service fee before continuing to the payment gateway.",
  /** One person's application. Nothing here belongs in a search index. */
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <CheckoutView />
    </Suspense>
  );
}
