"use client";

import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { saveChallenge, saveSignup } from "@/lib/challenge";
import { leaveAuthScreen } from "@/lib/navigate";
import { saveSession } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

/**
 * Where Google's redirect flow lands.
 *
 * The backend finishes the OAuth handshake itself and bounces the browser here
 * with one of three outcomes in the query string: a token pair, a two-factor
 * challenge, or a brand new account that still needs its email confirmed. The
 * tokens are moved out of the URL and into storage immediately, then the address
 * is replaced so they do not linger in history.
 */
export function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const status = searchParams.get("status");

    if (status === "success") {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (!accessToken || !refreshToken) {
        setError(
          "Google sent us back without a usable session. Try signing in again.",
        );
        return;
      }

      saveSession({ accessToken, refreshToken });
      void refresh();
      toast.success("Signed in with Google.");
      leaveAuthScreen(routes.complaints.list);
      return;
    }

    if (status === "otp-required") {
      const challengeId = searchParams.get("challengeId");
      if (!challengeId) {
        setError("That verification link is incomplete. Try signing in again.");
        return;
      }
      saveChallenge({
        kind: "google",
        challengeId,
        // The redirect does not carry the address; the 2FA page copes with that.
        expiresInSec: 300,
      });
      router.replace(routes.auth.twoFactor);
      return;
    }

    if (status === "verify-email") {
      const email = searchParams.get("email");
      if (!email) {
        setError(
          "We could not tell which address to verify. Try signing up again.",
        );
        return;
      }
      saveSignup({ email, expiresInSec: 600 });
      toast.info("Almost there — confirm your email to finish.");
      router.replace(routes.auth.verifyOtp);
      return;
    }

    setError(
      "Google sign-in did not complete. Nothing was changed on your account.",
    );
  }, [searchParams, router, refresh]);

  if (error) {
    return (
      <AuthCard
        title="Google sign-in did not finish"
        description={
          <span className="flex items-start gap-1.5">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            {error}
          </span>
        }
      >
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={routes.auth.login} />}
          >
            Back to sign in
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            Go to the homepage
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Finishing your sign-in"
      description="One moment while we hand your Google session over to CityCare."
    >
      <div className="flex items-center justify-center py-6">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    </AuthCard>
  );
}
