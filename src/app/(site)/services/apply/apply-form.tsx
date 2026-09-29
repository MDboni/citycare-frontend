"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { type Step, Stepper } from "@/components/shared/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCreateServiceRequest, useServiceTypes } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatBdt } from "@/lib/format";
import { routes } from "@/routes";
import {
  type CreateServiceRequestValues,
  createServiceRequestSchema,
} from "@/validation";

type WizardStep = Step & {
  /** Validated before this step will let go. The last step has nothing of its own. */
  fields: readonly (keyof CreateServiceRequestValues)[];
};

const STEPS = [
  {
    id: "service",
    label: "Service",
    hint: "What you are applying for",
    fields: ["serviceTypeId"],
  },
  {
    id: "details",
    label: "Details",
    hint: "What the counter will ask",
    fields: ["details"],
  },
  { id: "review", label: "Review", hint: "Check, then submit", fields: [] },
] as const satisfies readonly WizardStep[];

/**
 * A service application, as a three-step wizard.
 *
 * It is split because the three things it asks for are unrelated: which
 * service, what the counter needs to know, and a last look before anything is
 * created. Putting them on one screen made the details rows look mandatory
 * when they are not, and buried the fee under a field array.
 *
 * `details` is a free-form JSON object server-side, because it differs per
 * service. Rather than invent a schema per licence, step two collects labelled
 * key/value rows — honest about what the API stores, and it does not go stale
 * when an admin adds a new service type.
 */
export function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceTypes = useServiceTypes();
  const create = useCreateServiceRequest();

  const preselected = searchParams.get("type") ?? "";
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceRequestValues>({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: { serviceTypeId: preselected, details: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });

  const selectedId = watch("serviceTypeId");
  const detailRows = watch("details") ?? [];
  const selected = (serviceTypes.data ?? []).find(
    (service) => service.id === selectedId,
  );

  /**
   * A `?type=` deep link seeds the field before the list has loaded, so an id
   * with nothing behind it is not the same as no id. Without this the review
   * step reads "Not chosen" for a service that is about to be submitted, and
   * the same happens for a service that exists but has been deactivated.
   */
  const serviceUnresolved = Boolean(selectedId) && !selected;
  const serviceMissing = serviceUnresolved && !serviceTypes.isPending;

  /** Duplicate field names collapse on submit, so they are refused up front. */
  const duplicateKeys = (() => {
    const seen = new Set<string>();
    const clashes = new Set<string>();
    for (const row of detailRows) {
      const key = row.key?.trim();
      if (!key) continue;
      if (seen.has(key)) clashes.add(key);
      seen.add(key);
    }
    return [...clashes];
  })();

  const options = (serviceTypes.data ?? [])
    .filter((service) => service.isActive)
    .map((service) => ({
      value: service.id,
      label: service.name,
      hint: formatBdt(service.fee),
    }));

  /**
   * Rows with a name on them — the only ones that will be sent. Carrying the
   * field-array id means the review list has a stable key even while two rows
   * briefly share a name.
   */
  const filledRows = fields
    .map((field, index) => ({
      id: field.id,
      key: detailRows[index]?.key ?? "",
      value: detailRows[index]?.value ?? "",
    }))
    .filter((row) => row.key.trim());

  /**
   * Each step validates only its own fields, so a missing service is caught
   * on step one rather than at the end, and an empty details list does not
   * block a service that needs none.
   */
  const next = async () => {
    const fields = STEPS[step].fields;
    const ok = fields.length === 0 || (await trigger([...fields]));
    if (!ok) return;
    if (step === 0 && !selected) return;
    if (step === 1 && duplicateKeys.length > 0) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const finish = handleSubmit(async (values) => {
    // Empty rows are dropped rather than sent as blank keys.
    const details = Object.fromEntries(
      (values.details ?? [])
        .filter((row) => row.key.trim())
        .map((row) => [row.key.trim(), row.value.trim()]),
    );

    try {
      const request = await create.mutateAsync({
        serviceTypeId: values.serviceTypeId,
        ...(Object.keys(details).length ? { details } : {}),
      });

      toast.success(`Application ${request.referenceNo} created.`);
      router.push(routes.services.request(request.id));
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof CreateServiceRequestValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);

      // A rejected field lives on step one or two, so go back to where it is.
      const rejected = Object.keys(api.fieldErrors);
      const target = STEPS.findIndex((entry) =>
        entry.fields.some((field) => rejected.includes(field)),
      );
      if (target >= 0) setStep(target);
    }
  });

  /**
   * Enter inside an input submits the form. On an earlier step that means
   * "continue", so the whole-form validation never runs until the last step.
   */
  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isLast) {
      void finish(event);
      return;
    }
    event.preventDefault();
    void next();
  };

  return (
    <div className="page-shell page-shell-read space-y-6 py-8">
      <PageHeader
        title="Apply for a service"
        description="The application is created first, then you pay the fee and attach documents. Nothing is charged until you choose to pay."
      />

      <Stepper steps={STEPS} current={step} />

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={onFormSubmit} className="space-y-5" noValidate>
            {step === 0 && (
              <div className="space-y-5">
                <SelectField
                  name="serviceTypeId"
                  label="Service"
                  placeholder={
                    serviceTypes.isPending ? "Loading…" : "Choose a service"
                  }
                  options={options}
                  required
                  control={control}
                  error={errors.serviceTypeId}
                />

                {serviceMissing && (
                  <Alert variant="destructive">
                    <AlertTitle>That service is not available</AlertTitle>
                    <AlertDescription>
                      The link you followed points at a service that is no
                      longer offered. Pick one from the list above.
                    </AlertDescription>
                  </Alert>
                )}

                {selected && (
                  <Alert>
                    <AlertTitle>{selected.name}</AlertTitle>
                    <AlertDescription>
                      The fee is {formatBdt(selected.fee)}. It is taken from the
                      service record, never from this page, and it is payable
                      after the application is created.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <FieldLabel>Application details</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Optional. Add whatever the service asks for — a trade name,
                    a holding number, a plot reference.
                  </p>
                </div>

                {fields.length > 0 && (
                  <ul className="space-y-2">
                    {fields.map((field, index) => (
                      <li key={field.id} className="flex items-start gap-2">
                        <div className="grid flex-1 gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Input
                              placeholder="Field name"
                              aria-label={`Detail ${index + 1} name`}
                              aria-invalid={Boolean(
                                errors.details?.[index]?.key,
                              )}
                              {...register(`details.${index}.key` as const)}
                            />
                            <FieldError
                              errors={
                                errors.details?.[index]?.key
                                  ? [errors.details[index].key]
                                  : undefined
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Input
                              placeholder="Value"
                              aria-label={`Detail ${index + 1} value`}
                              aria-invalid={Boolean(
                                errors.details?.[index]?.value,
                              )}
                              {...register(`details.${index}.value` as const)}
                            />
                            <FieldError
                              errors={
                                errors.details?.[index]?.value
                                  ? [errors.details[index].value]
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="mt-0.5"
                          aria-label={`Remove detail ${index + 1}`}
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={fields.length >= 20}
                  onClick={() => append({ key: "", value: "" })}
                >
                  <PlusIcon />
                  Add a detail
                </Button>

                {duplicateKeys.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTitle>Two rows share a name</AlertTitle>
                    <AlertDescription>
                      {duplicateKeys.join(", ")} appears more than once. The
                      application stores one value per name, so rename or remove
                      the duplicate — otherwise only the last one would be kept.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <FieldLabel>Review</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Creating the application does not charge anything. The fee
                    is paid from the application page afterwards.
                  </p>
                </div>

                <dl className="divide-y divide-border rounded-xl border border-border">
                  <div className="flex items-baseline justify-between gap-4 p-4">
                    <dt className="text-sm text-muted-foreground">Service</dt>
                    <dd className="text-sm font-medium">
                      {selected?.name ??
                        (serviceTypes.isPending
                          ? "Still loading…"
                          : "Not chosen")}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 p-4">
                    <dt className="text-sm text-muted-foreground">Fee</dt>
                    <dd className="text-sm font-medium">
                      {selected ? formatBdt(selected.fee) : "—"}
                    </dd>
                  </div>
                  <div className="space-y-2 p-4">
                    <dt className="text-sm text-muted-foreground">Details</dt>
                    <dd>
                      {filledRows.length === 0 ? (
                        <p className="text-sm">
                          None —{" "}
                          <button
                            type="button"
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            onClick={() => setStep(1)}
                          >
                            add some
                          </button>
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {filledRows.map((row) => (
                            <li
                              key={row.id}
                              className="flex items-baseline justify-between gap-4 text-sm"
                            >
                              <span className="text-muted-foreground">
                                {row.key}
                              </span>
                              <span className="min-w-0 truncate font-medium">
                                {row.value.trim() || "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              {step === 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href={routes.services.catalog} />}
                >
                  Back to services
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((current) => current - 1)}
                >
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
              )}

              {isLast ? (
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting && <Loader2Icon className="animate-spin" />}
                  Create application
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => void next()}
                  disabled={
                    (step === 0 && (!selected || serviceTypes.isPending)) ||
                    (step === 1 && duplicateKeys.length > 0)
                  }
                >
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
