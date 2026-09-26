"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { useRegister } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { saveSignup } from "@/lib/challenge";
import { routes } from "@/routes";
import { type RegisterValues, registerSchema } from "@/validation";

/**
 * The password rules, shown as they are met rather than as a wall of text after
 * the fact. They are the same four regexes the server enforces.
 */
const RULES = [
  { label: "At least 10 characters", test: (v: string) => v.length >= 10 },
  { label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { label: "A symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const signup = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
    mode: "onTouched",
  });

  const password = watch("password") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await signup.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        ...(values.phone ? { phone: values.phone } : {}),
      });

      // Nothing is written to the database yet: the account exists only as a
      // pending signup in Redis until the emailed code comes back.
      saveSignup(result);
      toast.success(`We sent a 6 digit code to ${result.email}.`);
      router.push(routes.auth.verifyOtp);
    } catch (error) {
      const api = toApiError(error);

      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof RegisterValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <AuthCard
      title="Create your CityCare account"
      description="One account for complaints, service applications and payments."
      footer={
        <>
          Already registered?{" "}
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
          name="name"
          label="Full name"
          placeholder="Ayesha Rahman"
          autoComplete="name"
          required
          register={register}
          error={errors.name}
        />

        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          description="We send your verification code and complaint updates here."
          required
          register={register}
          error={errors.email}
        />

        <TextField
          name="phone"
          label="Phone"
          type="tel"
          placeholder="01700000000"
          autoComplete="tel"
          inputMode="tel"
          description="Optional. An officer may use it to reach you about a site visit."
          register={register}
          error={errors.phone}
        />

        <div className="space-y-2">
          <PasswordField
            name="password"
            label="Password"
            placeholder="Choose a strong password"
            autoComplete="new-password"
            required
            register={register}
            error={errors.password}
          />

          <ul className="grid gap-1 sm:grid-cols-2">
            {RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    met ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {met ? (
                    <CheckIcon className="size-3.5 shrink-0" />
                  ) : (
                    <XIcon className="size-3.5 shrink-0 opacity-40" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground">
            It also may not contain your name or the first part of your email.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Create account
        </Button>
      </form>

      <FieldSeparator>or</FieldSeparator>

      <GoogleButton label="Sign up with Google" />
    </AuthCard>
  );
}
