import { Loader2Icon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { CallbackHandler } from "./callback-handler";

export const metadata: Metadata = {
  title: "Finishing sign-in",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Finishing your sign-in">
          <div className="flex items-center justify-center py-6">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        </AuthCard>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
