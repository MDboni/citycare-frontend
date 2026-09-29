import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { RequestsView } from "./requests-view";

export const metadata: Metadata = {
  title: "My applications",
  description: "Your CityCare service applications and their fee status.",
};

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton rows={6} columns={4} />}>
      <RequestsView />
    </Suspense>
  );
}
