import { cn } from "cn";
import { CheckIcon } from "lucide-react";

export type Step = { id: string; label: string; hint?: string };

/**
 * The progress rail above a multi-step form.
 *
 * An ordered list rather than a row of divs, because that is what it is: the
 * steps have an order and a screen reader should hear it. The current step
 * carries `aria-current="step"`, and each one says whether it is done in words
 * as well as with a tick, so the state does not live in the colour alone.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly Step[];
  /** Zero-based index of the step being filled in. */
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col gap-2 sm:flex-row sm:gap-3", className)}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li
            key={step.id}
            className="flex flex-1 items-start gap-3"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? (
                <CheckIcon className="size-3.5" aria-hidden />
              ) : (
                index + 1
              )}
            </span>

            <span className="min-w-0 pt-0.5">
              <span
                className={cn(
                  "block text-sm font-medium",
                  !active && !done && "text-muted-foreground",
                )}
              >
                {step.label}
                <span className="sr-only">
                  {done ? " — completed" : active ? " — current step" : ""}
                </span>
              </span>
              {step.hint && (
                <span className="block text-xs text-muted-foreground">
                  {step.hint}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
