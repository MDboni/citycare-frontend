"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheckBigIcon, Loader2Icon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { contactApi } from "@/api";
import { TextareaField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toApiError } from "@/lib/api-error";
import { routes } from "@/routes";
import { type ContactMessageValues, contactMessageSchema } from "@/validation";

/**
 * The public message form.
 *
 * It does not create a complaint, and the copy says so: a complaint needs a
 * ward and a category to route itself and gets an SLA clock, none of which this
 * can supply. Sending a "my street is flooded" message through here would put
 * an unroutable row in front of officers and start no clock at all — so the
 * card points at the report flow for anything that needs fixing.
 *
 * The API answers an acknowledgement and no id, so there is nothing to track;
 * the success state says as much rather than implying a reference is coming.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  const send = useMutation({
    mutationFn: contactApi.send,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await send.mutateAsync({
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
        ...(values.phone ? { phone: values.phone } : {}),
      });
      reset();
      setSent(true);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof ContactMessageValues, { message });
      }
      // 429 is the hourly cap and is about the sender, not about a field.
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  if (sent) {
    return (
      <Card className="cc-pop border-success/30">
        <CardContent className="space-y-4 p-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CircleCheckBigIcon className="size-5" />
          </span>
          <div className="space-y-1.5">
            <h3 className="h-card text-[17px]">Message sent</h3>
            <p className="text-sm text-muted-foreground">
              It is in the desk&apos;s inbox. There is no tracking id for a
              message — if this was about something that needs fixing, file it
              as a report instead and you will get one.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setSent(false)}>
              Send another
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={routes.complaints.new} />}
            >
              Report an issue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="space-y-1">
          <h3 className="h-card text-[17px]">Send a message</h3>
          <p className="text-sm text-muted-foreground">
            For questions, feedback and anything that is not a repair. No
            account needed.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Your name"
              placeholder="Rafiq Hasan"
              autoComplete="name"
              required
              register={register}
              error={errors.name}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              autoComplete="email"
              description="Where the reply goes."
              required
              register={register}
              error={errors.email}
            />
          </div>

          <TextField
            name="phone"
            label="Phone (optional)"
            inputMode="tel"
            placeholder="+880 1711 223344"
            autoComplete="tel"
            description="Add one if you would rather be called back."
            register={register}
            error={errors.phone}
          />

          <TextField
            name="subject"
            label="Subject"
            placeholder="Question about a trade licence"
            required
            register={register}
            error={errors.subject}
          />

          <TextareaField
            name="message"
            label="Message"
            rows={6}
            placeholder="Tell us what you need. The more specific, the faster the right desk can answer."
            required
            register={register}
            error={errors.message}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            Send message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
