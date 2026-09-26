import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply for a service",
  description: "Start a CityCare service application.",
};

export default function ApplyPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading the form" />}>
      <ApplyForm />
    </Suspense>
  );
}
