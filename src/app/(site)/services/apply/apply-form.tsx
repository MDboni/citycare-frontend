"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
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

/**
 * A service application.
 *
 * `details` is a free-form JSON object server-side, because it differs per
 * service. Rather than invent a schema per licence, the form collects labelled
 * key/value rows — which is honest about what the API actually stores, and does
 * not go stale when an admin adds a new service type.
 */
export function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceTypes = useServiceTypes();
  const create = useCreateServiceRequest();

  const preselected = searchParams.get("type") ?? "";

  const {
    control,
    register,
    handleSubmit,
    watch,
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
  const selected = (serviceTypes.data ?? []).find(
    (service) => service.id === selectedId,
  );

  const options = (serviceTypes.data ?? [])
    .filter((service) => service.isActive)
    .map((service) => ({
      value: service.id,
      label: service.name,
      hint: formatBdt(service.fee),
    }));

  const onSubmit = handleSubmit(async (values) => {
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
    }
  });

  return (
    <div className="page-shell page-shell-read space-y-6 py-8">
      <PageHeader
        title="Apply for a service"
        description="The application is created first, then you pay the fee and attach documents. Nothing is charged until you choose to pay."
      />

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

            {selected && (
              <Alert>
                <AlertTitle>{selected.name}</AlertTitle>
                <AlertDescription>
                  The fee is {formatBdt(selected.fee)}. It is taken from the
                  service record, never from this page, and it is payable after
                  the application is created.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1">
                <FieldLabel>Application details</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  Optional. Add whatever the service asks for — a trade name, a
                  holding number, a plot reference.
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
                            aria-invalid={Boolean(errors.details?.[index]?.key)}
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
            </div>

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                nativeButton={false}
                render={<Link href={routes.services.catalog} />}
              >
                Back to services
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Create application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
