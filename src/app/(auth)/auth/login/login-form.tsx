"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { useLogin } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { saveChallenge } from "@/lib/challenge";
import { getDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import { type LoginValues, loginSchema } from "@/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const login = useLogin();

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

      await signIn(result);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
      // An officer or admin belongs in the staff dashboard, not here.
      router.replace(result.user.role === "CITIZEN" ? next : routes.home);
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
