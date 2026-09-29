"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { OtpForm } from "@/components/auth/otp-form";
import { PasswordField } from "@/components/shared/form-fields";
import { FormPageSkeleton } from "@/components/shared/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useChangePassword, useToggle2fa } from "@/hooks";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clearDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import { type ChangePasswordValues, changePasswordSchema } from "@/validation";

export function SecurityView() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <FormPageSkeleton fields={4} />;

  return (
    <>
      <TwoFactorCard
        enabled={user.twoFactorEnabled}
        canDisable={user.role === "CITIZEN"}
        isGoogleAccount={user.provider === "GOOGLE"}
      />
      <ChangePasswordCard isGoogleAccount={user.provider === "GOOGLE"} />
    </>
  );
}

/**
 * Turning two-factor on or off is a two-step change: the server answers the
 * first call with an OTP challenge and only applies the switch once the code
 * comes back. That is deliberate — it proves the mailbox still works before the
 * account starts depending on it.
 */
function TwoFactorCard({
  enabled,
  canDisable,
  isGoogleAccount,
}: {
  enabled: boolean;
  canDisable: boolean;
  isGoogleAccount: boolean;
}) {
  const toggle = useToggle2fa();
  const [password, setPassword] = useState("");
  const [target, setTarget] = useState<boolean | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [expiresInSec, setExpiresInSec] = useState<number | undefined>();
  const [otpError, setOtpError] = useState<string | null>(null);

  const close = () => {
    setTarget(null);
    setChallengeId(null);
    setPassword("");
    setOtpError(null);
  };

  const start = async () => {
    if (target === null) return;
    if (!password) {
      toast.error("Confirm with your password.");
      return;
    }

    try {
      const result = await toggle.mutateAsync({ enabled: target, password });

      if (result.otpRequired) {
        setChallengeId(result.challengeId);
        setExpiresInSec(result.expiresInSec);
        return;
      }

      // Some paths apply straight away and skip the challenge entirely.
      toast.success(
        result.twoFactorEnabled ? "Two-factor is on." : "Two-factor is off.",
      );
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const confirm = async (otp: string) => {
    if (target === null || !challengeId) return;
    setOtpError(null);

    try {
      const result = await toggle.mutateAsync({
        enabled: target,
        password,
        challengeId,
        otp,
      });

      if (!result.otpRequired) {
        // Turning 2FA off makes the trusted-device token meaningless.
        if (!result.twoFactorEnabled) clearDeviceToken();
        toast.success(
          result.twoFactorEnabled
            ? "Two-factor is on. New sign-ins will ask for a code."
            : "Two-factor is off.",
        );
        close();
      }
    } catch (error) {
      setOtpError(errorMessage(error));
    }
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <h2 className="h-card">Two-factor verification</h2>
              <p className="text-sm text-muted-foreground">
                A 6 digit code by email on every new sign-in. You can mark a
                browser as trusted to skip it there.
              </p>
            </div>

            <Switch
              checked={enabled}
              disabled={enabled && !canDisable}
              onCheckedChange={(checked) => setTarget(Boolean(checked))}
              aria-label="Two-factor verification"
            />
          </div>

          {enabled && !canDisable && (
            <Alert>
              <ShieldCheckIcon />
              <AlertTitle>Required on this account</AlertTitle>
              <AlertDescription>
                Officer and administrator accounts keep two-factor on. Only a
                citizen account can turn it off.
              </AlertDescription>
            </Alert>
          )}

          {isGoogleAccount && (
            <p className="text-xs text-muted-foreground">
              This account signs in with Google. It still has a CityCare
              password for confirming changes like this one.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {target ? "Turn on two-factor" : "Turn off two-factor"}
            </DialogTitle>
            <DialogDescription>
              {challengeId
                ? "Enter the code we just emailed you to apply the change."
                : "Confirm with your password. We will email a code to finish."}
            </DialogDescription>
          </DialogHeader>

          {challengeId ? (
            <OtpForm
              onSubmit={(otp) => void confirm(otp)}
              isSubmitting={toggle.isPending}
              error={otpError}
              expiresInSec={expiresInSec}
            />
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void start();
              }}
            >
              <div className="space-y-1.5">
                <FieldLabel htmlFor="confirm-password">
                  Your password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <FieldDescription>
                  The same password you sign in with.
                </FieldDescription>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={toggle.isPending || !password}
              >
                {toggle.isPending && <Loader2Icon className="animate-spin" />}
                Send verification code
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChangePasswordCard({ isGoogleAccount }: { isGoogleAccount: boolean }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const change = useChangePassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success(response.message);
      // Changing a password revokes every session server-side, so the only
      // honest next step is back to the sign-in screen.
      await signOut();
      router.replace(routes.auth.login);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof ChangePasswordValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) {
        setError("currentPassword", { message: api.message });
      }
    }
  });

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h2 className="h-card">Change password</h2>
            <p className="text-sm text-muted-foreground">
              This signs you out of every device, including this one.
              {isGoogleAccount
                ? " Google sign-in keeps working either way."
                : ""}
            </p>
          </div>

          <Separator />

          <PasswordField
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            required
            register={register}
            error={errors.currentPassword}
          />

          <PasswordField
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            description="At least 10 characters, with upper and lower case, a number and a symbol."
            required
            register={register}
            error={errors.newPassword}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            required
            register={register}
            error={errors.confirmPassword}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Change password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
