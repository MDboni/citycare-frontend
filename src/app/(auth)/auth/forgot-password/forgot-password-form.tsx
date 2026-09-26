"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthCard } from "@/components/auth/auth-card";
import { TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { routes } from "@/routes";
import { type ForgotPasswordValues, forgotPasswordSchema } from "@/validation";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      const response = await forgot.mutateAsync(values);
      // The API answers the same way whether or not the address exists — it will
      // not confirm who has an account — so the screen says the same thing too.
      setSent(response.message);
    } catch (error) {
      setFailure(errorMessage(error));
    }
  });

  if (sent) {
    return (
      <AuthCard title="Check your email" description={sent}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <MailCheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">
              The link is good for a short window and can be used once. If it
              has already expired, ask for another.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href={routes.auth.login} />}
          >
            Back to sign in
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Give us the address on the account and we will email a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href={routes.auth.login}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
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

        {failure && (
          <p role="alert" className="text-sm text-destructive">
            {failure}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
