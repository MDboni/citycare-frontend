"use client";

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpForm } from "@/components/auth/otp-form";
import { StaffAccountNotice } from "@/components/auth/staff-account-notice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { useResendLoginOtp, useVerifyLoginOtp } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import {
  clearChallenge,
  getChallenge,
  type PendingChallenge,
  saveChallenge,
} from "@/lib/challenge";
import { leaveAuthScreen } from "@/lib/navigate";
import { saveDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import type { Role } from "@/types";

export function TwoFactorForm() {
  const { signIn } = useAuth();
  const verify = useVerifyLoginOtp();
  const resend = useResendLoginOtp();

  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [expiresInSec, setExpiresInSec] = useState<number | undefined>();
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  /** Same refusal as the password screen: a right code does not make this the
      right app for a staff account. */
  const [staff, setStaff] = useState<{
    name: string;
    role: Exclude<Role, "CITIZEN">;
  } | null>(null);

  useEffect(() => {
    const pending = getChallenge();
    if (pending) {
      setChallenge(pending);
      setExpiresInSec(
        Math.max(0, Math.round((pending.expiresAt - Date.now()) / 1000)),
      );
    }
    setChecked(true);
  }, []);

  if (staff) {
    return (
      <StaffAccountNotice
        name={staff.name}
        role={staff.role}
        onBack={() => leaveAuthScreen(routes.auth.login)}
      />
    );
  }

  if (checked && !challenge) {
    return (
      <AuthCard
        title="This verification has expired"
        description="Two-factor codes are good for a few minutes only. Sign in again and we will send a new one."
      >
        <Button
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href={routes.auth.login} />}
        >
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  const onSubmit = async (otp: string) => {
    if (!challenge) return;
    setError(null);

    try {
      const result = await verify.mutateAsync({
        challengeId: challenge.challengeId,
        otp,
        trustDevice,
      });

      clearChallenge();

      // The same refusal as the password path — a staff account only reaches
      // this screen when it has 2FA on, and the code being right changes
      // nothing about this app being the wrong one for it.
      if (result.user.role !== "CITIZEN") {
        setStaff({ name: result.user.name, role: result.user.role });
        return;
      }

      // Only a citizen ever gets a device token back; staff always type a code.
      saveDeviceToken(result.deviceToken);
      await signIn(result);

      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
      leaveAuthScreen(routes.complaints.list);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const onResend = async () => {
    if (!challenge) return;
    setError(null);
    try {
      const result = await resend.mutateAsync({
        challengeId: challenge.challengeId,
      });
      // The id survives a resend, so only the clock needs updating.
      saveChallenge({
        kind: challenge.kind,
        challengeId: result.challengeId,
        email: challenge.email,
        expiresInSec: result.expiresInSec,
      });
      setExpiresInSec(result.expiresInSec);
      toast.success("A new code is on its way.");
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  return (
    <AuthCard
      title="Two-factor verification"
      description={
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-4 shrink-0 text-muted-foreground" />
          <span>
            Enter the code we emailed to{" "}
            <strong className="font-medium text-foreground">
              {challenge?.email ?? "your address"}
            </strong>
          </span>
        </span>
      }
      footer={
        <>
          The same email also has a one-tap sign-in link, if typing is awkward.{" "}
          <Link
            href={routes.auth.login}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Start over
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
        footer={
          <Field orientation="horizontal" className="items-start gap-2.5">
            <Checkbox
              id="trust-device"
              checked={trustDevice}
              onCheckedChange={(value) => setTrustDevice(Boolean(value))}
            />
            <div className="space-y-0.5">
              <FieldLabel htmlFor="trust-device">Trust this device</FieldLabel>
              <FieldDescription>
                Skip the code on this browser next time. Staff accounts always
                ask, and you can revoke a device from your account at any point.
              </FieldDescription>
            </div>
          </Field>
        }
      />
    </AuthCard>
  );
}
