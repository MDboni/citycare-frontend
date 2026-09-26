import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to CityCare to report issues and follow them to resolution.",
};

/**
 * `useSearchParams` reads the `next` parameter the proxy attaches, which makes
 * the form request-time work. The Suspense boundary is what lets the rest of the
 * shell still be prerendered around it.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Sign in to CityCare">
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </AuthCard>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
