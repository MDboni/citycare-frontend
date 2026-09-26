import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { RequestsView } from "./requests-view";

export const metadata: Metadata = {
  title: "My applications",
  description: "Your CityCare service applications and their fee status.",
};

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading your applications" />}>
      <RequestsView />
    </Suspense>
  );
}
