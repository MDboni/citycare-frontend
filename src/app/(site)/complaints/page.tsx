import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { ComplaintsView } from "./complaints-view";

export const metadata: Metadata = {
  title: "My complaints",
  description:
    "Every issue you have reported to CityCare, with its status and SLA clock.",
};

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton rows={6} columns={4} />}>
      <ComplaintsView />
    </Suspense>
  );
}
