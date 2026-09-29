import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPageSkeleton } from "@/components/shared/loading";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply for a service",
  description: "Start a CityCare service application.",
};

export default function ApplyPage() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={6} />}>
      <ApplyForm />
    </Suspense>
  );
}
