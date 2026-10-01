"use client";

import { MailIcon } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpForm } from "@/components/auth/otp-form";
import { Button } from "@/components/ui/button";
import { useResendSignupOtp, useVerifySignupOtp } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { clearSignup, getSignup, saveSignup } from "@/lib/challenge";
import { leaveAuthScreen } from "@/lib/navigate";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function VerifySignupOtpForm() {
  const { signIn } = useAuth();
  const verify = useVerifySignupOtp();
  const resend = useResendSignupOtp();

  const [email, setEmail] = useState<string | null>(null);
  const [expiresInSec, setExpiresInSec] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // sessionStorage is only readable on the client, so the pending signup is read
  // after mount rather than during render.
  useEffect(() => {
    const pending = getSignup();
    if (pending) {
      setEmail(pending.email);
      setExpiresInSec(
        Math.max(0, Math.round((pending.expiresAt - Date.now()) / 1000)),
      );
    }
    setChecked(true);
  }, []);

  if (checked && !email) {
    return (
      <AuthCard
        title="Nothing to verify"
        description="We could not find a signup waiting in this tab. Start again and we will send a fresh code."
      >
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={routes.auth.register} />}
          >
            Create an account
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={routes.auth.login} />}
          >
            I already have one
          </Button>
        </div>
      </AuthCard>
    );
  }

  /**
   * The unverified account lives in Redis, keyed by the plain email. That is why
   * this form asks the server with `email` rather than a challenge id: there is
   * no database row yet to point a challenge at.
   */
  const onSubmit = async (otp: string) => {
    if (!email) return;
    setError(null);

    try {
      const tokens = await verify.mutateAsync({ email, otp });
      clearSignup();
      await signIn(tokens);
      toast.success("Account created. Welcome to CityCare.");
      leaveAuthScreen(routes.complaints.list);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const onResend = async () => {
    if (!email) return;
    setError(null);
    try {
      const result = await resend.mutateAsync({ email });
      saveSignup(result);
      setExpiresInSec(result.expiresInSec);
      toast.success("A new code is on its way.");
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  return (
    <AuthCard
      title="Confirm your email"
      description={
        <span className="flex items-center gap-1.5">
          <MailIcon className="size-4 shrink-0 text-muted-foreground" />
          <span>
            We sent a 6 digit code to{" "}
            <strong className="font-medium text-foreground">{email}</strong>
          </span>
        </span>
      }
      footer={
        <>
          Wrong address?{" "}
          <Link
            href={routes.auth.register}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Start again
          </Link>
        </>
      }
    >
      <OtpForm
        onSubmit={onSubmit}
        isSubmitting={verify.isPending}
        error={error}
        onResend={onResend}
        isResending={resend.isPending}
        expiresInSec={expiresInSec}
      />
    </AuthCard>
  );
}
