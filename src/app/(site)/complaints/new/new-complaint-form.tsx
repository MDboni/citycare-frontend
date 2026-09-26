"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CircleCheckBigIcon,
  Loader2Icon,
  LocateFixedIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { FilePicker } from "@/components/shared/file-picker";
import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useAddComplaintAttachment,
  useCategories,
  useCreateComplaint,
  useWards,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { IMAGE_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { routes } from "@/routes";
import type { ComplaintDetail } from "@/types";
import {
  type CreateComplaintValues,
  createComplaintSchema,
} from "@/validation";

export function NewComplaintForm() {
  const categories = useCategories();
  const wards = useWards();
  const create = useCreateComplaint();

  const [created, setCreated] = useState<ComplaintDetail | null>(null);
  const [locating, setLocating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateComplaintValues>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      wardId: "",
      address: "",
      latitude: null,
      longitude: null,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  /**
   * Coordinates are optional but worth asking for: they are what makes the
   * nearby view and the duplicate hint on create work at all.
   */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("This browser cannot share a location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", Number(position.coords.latitude.toFixed(6)));
        setValue("longitude", Number(position.coords.longitude.toFixed(6)));
        setLocating(false);
        toast.success("Location attached to this report.");
      },
      () => {
        setLocating(false);
        toast.error("Could not read your location. You can still describe it.");
      },
      { timeout: 10_000 },
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const complaint = await create.mutateAsync({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        wardId: values.wardId,
        address: values.address,
        ...(values.latitude !== null && values.latitude !== undefined
          ? { latitude: values.latitude }
          : {}),
        ...(values.longitude !== null && values.longitude !== undefined
          ? { longitude: values.longitude }
          : {}),
      });

      setCreated(complaint);
      toast.success(`Reported. Your tracking id is ${complaint.trackingId}.`);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof CreateComplaintValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  if (created) {
    return <ComplaintCreated complaint={created} />;
  }

  const categoryOptions = (categories.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
    hint: `${category.slaHours}h SLA`,
  }));

  const wardOptions = (wards.data ?? []).map((ward) => ({
    value: ward.id,
    label: `Ward ${ward.number} — ${ward.name}`,
  }));

  return (
    <div className="page-shell page-shell-read space-y-6 py-8">
      <PageHeader
        title="Report an issue"
        description="The more specific the location, the faster an officer can find it. You can add photos on the next step."
      />

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <TextField
              name="title"
              label="What is the issue?"
              placeholder="Streetlight out on Green Road"
              description="A short headline. Between 5 and 150 characters."
              required
              register={register}
              error={errors.title}
            />

            <TextareaField
              name="description"
              label="Describe it"
              placeholder="The light outside house 42 has been dark for about a week. The pole is leaning slightly towards the road."
              rows={6}
              description="What you can see, how long it has been like that, and anything that makes it urgent."
              required
              register={register}
              error={errors.description}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                name="categoryId"
                label="Category"
                placeholder={
                  categories.isPending ? "Loading…" : "Pick the closest match"
                }
                description="The category decides the department and the SLA."
                options={categoryOptions}
                required
                control={control}
                error={errors.categoryId}
              />

              <SelectField
                name="wardId"
                label="Ward"
                placeholder={
                  categories.isPending ? "Loading…" : "Pick your ward"
                }
                options={wardOptions}
                required
                control={control}
                error={errors.wardId}
              />
            </div>

            <div className="space-y-2">
              <TextField
                name="address"
                label="Where is it?"
                placeholder="House 42, Green Road, near the pharmacy"
                required
                register={register}
                error={errors.address}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={locating}
                  onClick={useMyLocation}
                >
                  {locating ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <LocateFixedIcon />
                  )}
                  Use my current location
                </Button>

                {latitude != null && longitude != null && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {latitude}, {longitude}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Optional, and it stays private. Coordinates let CityCare warn
                you if a neighbour already reported the same thing.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                nativeButton={false}
                render={<Link href={routes.complaints.list} />}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Submit report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Step two, shown in place of the form. Attachments need the complaint id, so
 * they cannot be part of the same request — which is also why the tracking id is
 * handed over here rather than on a redirect the user might miss.
 */
function ComplaintCreated({ complaint }: { complaint: ComplaintDetail }) {
  const upload = useAddComplaintAttachment(complaint.id);
  const [uploaded, setUploaded] = useState(0);

  const attach = async (file: File) => {
    try {
      await upload.mutateAsync({ file, kind: "EVIDENCE" });
      setUploaded((count) => count + 1);
      toast.success("Photo attached.");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <div className="page-shell max-w-2xl space-y-5 py-10">
      <Card className="cc-pop border-success/30">
        <CardHeader className="gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CircleCheckBigIcon className="size-5" />
          </span>
          <CardTitle className="font-heading text-xl">
            Your complaint is in
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Keep this tracking id. Anyone can use it to check the status without
            signing in.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <code className="font-mono text-base font-medium">
              {complaint.trackingId}
            </code>
            <CopyButton
              value={complaint.trackingId}
              label="Tracking id copied"
            />
          </div>

          {complaint.possibleDuplicate && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>This may already be reported</AlertTitle>
              <AlertDescription>
                <span>
                  {complaint.possibleDuplicate.trackingId} was filed nearby in
                  the last day:{" "}
                  <strong>{complaint.possibleDuplicate.title}</strong>. Upvoting
                  that one raises its priority faster than a second report.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit"
                  nativeButton={false}
                  render={
                    <Link
                      href={routes.complaints.detail(
                        complaint.possibleDuplicate.id,
                      )}
                    />
                  }
                >
                  Open that complaint
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h2 className="h-card">Add a photo</h2>
            <p className="text-sm text-muted-foreground">
              Optional, and up to five. A photo is usually what gets an issue
              triaged on the first pass.
            </p>
            <FilePicker
              accept={IMAGE_MIME_TYPES}
              maxSize={MAX_FILE_SIZE}
              disabled={upload.isPending || uploaded >= 5}
              onSelect={(file) => void attach(file)}
              hint={
                uploaded >= 5
                  ? "Five attachments is the limit"
                  : `JPG, PNG or WEBP up to 4 MB · ${uploaded}/5 attached`
              }
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={routes.complaints.new} />}
            >
              Report something else
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={routes.complaints.detail(complaint.id)} />}
            >
              View my complaint
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
