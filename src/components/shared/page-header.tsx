import { cn } from "cn";
import type { ReactNode } from "react";

/**
 * The top of every signed-in page: a label for where you are, the title, one
 * line of context, and the actions that belong to the page as a whole.
 *
 * The rule underneath fades out instead of running the full width and stopping
 * dead against the gutter. It is a small thing and it is the difference between
 * a heading that was designed and a heading with a border-bottom on it — which
 * is what this was.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  /** Where this page sits — the section it belongs to, not a repeat of the title. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("cc-rise space-y-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
          <h1 className="h-section">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <hr className="rule-fade" />
    </div>
  );
}
