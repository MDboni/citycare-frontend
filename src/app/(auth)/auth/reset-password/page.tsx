import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your CityCare account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Choose a new password">
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </AuthCard>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
