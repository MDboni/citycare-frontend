import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { ComplaintsView } from "./complaints-view";

export const metadata: Metadata = {
  title: "My complaints",
  description:
    "Every issue you have reported to CityCare, with its status and SLA clock.",
};

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading your complaints" />}>
      <ComplaintsView />
    </Suspense>
  );
}
