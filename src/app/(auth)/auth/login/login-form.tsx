"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { StaffAccountNotice } from "@/components/auth/staff-account-notice";
import { PasswordField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { useLogin } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { saveChallenge } from "@/lib/challenge";
import { getDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import type { Role } from "@/types";
import { type LoginValues, loginSchema } from "@/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const login = useLogin();

  /**
   * Set when the credentials were right but the account is staff. Nothing is
   * stored in that case — StaffAccountNotice explains why refusing beats
   * signing them in and letting every page fail.
   */
  const [staff, setStaff] = useState<{
    name: string;
    role: Exclude<Role, "CITIZEN">;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /** Where the proxy wanted them before it sent them here. */
  const next = searchParams.get("next") ?? routes.complaints.list;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync({
        ...values,
        deviceToken: getDeviceToken(),
      });

      // Two-factor accounts get a challenge instead of a token pair.
      if (result.twoFactorRequired) {
        saveChallenge({
          kind: "login",
          challengeId: result.challengeId,
          email: result.email,
          expiresInSec: result.expiresInSec,
        });
        router.push(routes.auth.twoFactor);
        return;
      }

      // An officer or admin belongs in the staff console, and is told so
      // before signIn stores anything: a staff session on this side is valid
      // but 403s on every page, including the one carrying Sign out.
      if (result.user.role !== "CITIZEN") {
        setStaff({ name: result.user.name, role: result.user.role });
        return;
      }

      await signIn(result);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
      router.replace(next);
    } catch (error) {
      const api = toApiError(error);

      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof LoginValues, { message });
      }

      if (!Object.keys(api.fieldErrors).length) {
        // 423 is a lock and 429 is a rate limit: neither is about this field, so
        // they belong in a toast. A 401 stays generic on purpose server-side, and
        // sits under the password because that is where the user will look.
        if (api.status === 401) setError("password", { message: api.message });
        else toast.error(api.message);
      }
    }
  });

  if (staff) {
    return (
      <StaffAccountNotice
        name={staff.name}
        role={staff.role}
        onBack={() => setStaff(null)}
      />
    );
  }

  return (
    <AuthCard
      title="Sign in to CityCare"
      description="Report an issue, follow it to resolution, and pay for services in one place."
      footer={
        <>
          New here?{" "}
          <Link
            href={routes.auth.register}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          required
          register={register}
          error={errors.email}
        />

        <div className="space-y-1.5">
          <PasswordField
            name="password"
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            register={register}
            error={errors.password}
          />
          <div className="text-right">
            <Link
              href={routes.auth.forgotPassword}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <FieldSeparator>or</FieldSeparator>

      <GoogleButton label="Sign in with Google" />
    </AuthCard>
  );
}
