"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { clearSession } from "@/lib/session";
import { routes } from "@/routes";
import { type ResetPasswordValues, resetPasswordSchema } from "@/validation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useResetPassword();

  /** The token arrives in the emailed link, so the query string is its home. */
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  useEffect(() => setValue("token", token), [token, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await reset.mutateAsync({
        token: values.token,
        password: values.password,
      });

      // Resetting revokes every session server-side, so anything held here is
      // already dead. Clearing it locally keeps the two in step.
      clearSession();
      toast.success(response.message);
      router.replace(routes.auth.login);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof ResetPasswordValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) {
        setError("password", { message: api.message });
      }
    }
  });

  if (!token) {
    return (
      <AuthCard
        title="This link is incomplete"
        description="A reset link carries a token in its address. Open the link from the email exactly as it arrived, or ask for a new one."
      >
        <Button
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href={routes.auth.forgotPassword} />}
        >
          Request a new link
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description={
        <span className="flex items-center gap-1.5">
          <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
          Setting a new password signs you out everywhere else.
        </span>
      }
      footer={
        <Link
          href={routes.auth.login}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" {...register("token")} />

        <PasswordField
          name="password"
          label="New password"
          placeholder="At least 10 characters"
          autoComplete="new-password"
          description="Needs upper and lower case, a number and a symbol."
          required
          register={register}
          error={errors.password}
        />

        <PasswordField
          name="confirmPassword"
          label="Confirm new password"
          placeholder="Type it again"
          autoComplete="new-password"
          required
          register={register}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Set new password
        </Button>
      </form>
    </AuthCard>
  );
}
