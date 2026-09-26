"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { routes } from "@/routes";
import { type TrackValues, trackSchema } from "@/validation";

/**
 * The one thing a visitor can do without an account. It only navigates — the
 * lookup itself happens on /track, so the result has a URL worth sharing.
 */
export function TrackWidget({
  className,
  autoFocus,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { trackingId: "" },
  });

  const onSubmit = handleSubmit(({ trackingId }) => {
    router.push(`${routes.track}?id=${encodeURIComponent(trackingId)}`);
  });

  return (
    <form onSubmit={onSubmit} className={cn("space-y-2", className)} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          {...register("trackingId")}
          placeholder="CC-2026-000123"
          aria-label="Tracking id"
          aria-invalid={Boolean(errors.trackingId)}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className="h-10 font-mono uppercase sm:flex-1"
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SearchIcon data-icon="inline-start" />
          )}
          Track
        </Button>
      </div>
      <FieldError
        errors={errors.trackingId ? [errors.trackingId] : undefined}
      />
    </form>
  );
}
