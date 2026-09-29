"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheckIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { FormSkeleton } from "@/components/shared/loading";
import { RolePill, UserStatusPill } from "@/components/shared/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUpdateAvatar, useUpdateProfile, useWards } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { IMAGE_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { formatDate, initials } from "@/lib/format";
import { useAuth } from "@/providers";
import { type UpdateProfileValues, updateProfileSchema } from "@/validation";

export function ProfileForm() {
  const { user, isLoading } = useAuth();
  const wards = useWards();
  const update = useUpdateProfile();
  const avatar = useUpdateAvatar();
  const fileInput = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "", wardId: "" },
  });

  // The profile arrives after the first render, so the form is seeded from it.
  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      phone: user.phone ?? "",
      wardId: user.ward?.id ?? "",
    });
  }, [user, reset]);

  if (isLoading || !user) return <FormSkeleton fields={5} />;

  const onSubmit = handleSubmit(async (values) => {
    // The API rejects an empty patch, so only real changes are sent.
    const patch: { name?: string; phone?: string; wardId?: string } = {};
    if (values.name && values.name !== user.name) patch.name = values.name;
    if ((values.phone ?? "") !== (user.phone ?? "")) {
      patch.phone = values.phone ?? "";
    }
    if (values.wardId && values.wardId !== user.ward?.id) {
      patch.wardId = values.wardId;
    }

    if (!Object.keys(patch).length) {
      toast.info("Nothing has changed.");
      return;
    }

    try {
      await update.mutateAsync(patch);
      toast.success("Profile updated.");
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof UpdateProfileValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  const pickAvatar = async (file: File | undefined) => {
    if (!file) return;

    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("That image is over the 4 MB limit.");
      return;
    }

    try {
      await avatar.mutateAsync(file);
      toast.success("Photo updated.");
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const wardOptions = (wards.data ?? []).map((ward) => ({
    value: ward.id,
    label: `Ward ${ward.number} — ${ward.name}`,
  }));

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <Avatar className="size-16 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-lg">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-0.5">
              <p className="font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <RolePill role={user.role} />
              <UserStatusPill status={user.status} />
              {user.isSuperAdmin && <Badge>Super admin</Badge>}
              {user.emailVerifiedAt && (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheckIcon aria-hidden />
                  Email verified
                </Badge>
              )}
              {user.provider === "GOOGLE" && (
                <Badge variant="outline">Google account</Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
              {user.department ? ` · ${user.department.name}` : ""}
            </p>
          </div>

          <div className="shrink-0">
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_MIME_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => void pickAvatar(event.target.files?.[0])}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={avatar.isPending}
              onClick={() => fileInput.current?.click()}
            >
              {avatar.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UploadIcon />
              )}
              Change photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-1">
              <h2 className="h-card">Your details</h2>
              <p className="text-sm text-muted-foreground">
                Your email cannot be changed here — it is the identity on the
                account and it anchors the security log.
              </p>
            </div>

            <Separator />

            <TextField
              name="name"
              label="Full name"
              autoComplete="name"
              register={register}
              error={errors.name}
            />

            <TextField
              name="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              description="An officer may use this to reach you about a site visit."
              register={register}
              error={errors.phone}
            />

            <SelectField
              name="wardId"
              label="Your ward"
              placeholder={wards.isPending ? "Loading…" : "Pick your ward"}
              description="Used to pre-fill new complaints."
              options={wardOptions}
              control={control}
              error={errors.wardId}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
