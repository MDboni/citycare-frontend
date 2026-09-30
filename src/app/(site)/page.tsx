import {
  ArrowRightIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  MapPinIcon,
  MegaphoneIcon,
  SearchIcon,
  ShieldCheckIcon,
  ThumbsUpIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TrackWidget } from "@/components/complaints/track-widget";
import { CityBanner } from "@/components/home/city-banner";
import { CityShowcase } from "@/components/home/city-showcase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "CityCare — municipal complaints and civic services",
  description:
    "Report a pothole, a broken light or an overflowing bin and follow it to resolution. Apply for municipal services and pay the fee online.",
};

const STEPS = [
  {
    icon: MegaphoneIcon,
    title: "Report it",
    body: "Pick a category and a ward, drop a photo in, and describe what you can see. You get a tracking id straight away.",
  },
  {
    icon: ClockIcon,
    title: "Watch the clock",
    body: "Every category carries its own SLA. The countdown sits on your complaint, and a breach escalates it without anyone asking.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Close the loop",
    body: "The assigned officer posts proof when the work is done. You accept it, reopen it, or rate how it went.",
  },
] as const;

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Public tracking",
    body: "A tracking id is enough to see status and timeline. No account, and no personal data exposed.",
  },
  {
    icon: ThumbsUpIcon,
    title: "Upvotes that count",
    body: "When neighbours back the same issue, its priority climbs a step. Ten upvotes is one level.",
  },
  {
    icon: MapPinIcon,
    title: "Ward by ward",
    body: "Complaints route to the department that owns the category, and to the officer covering your ward.",
  },
  {
    icon: FileTextIcon,
    title: "Service applications",
    body: "Trade licences, certificates and permits. Upload the documents, pay the fee, track the file.",
  },
  {
    icon: CreditCardIcon,
    title: "Payments with receipts",
    body: "Fees are taken by SSLCommerz. Every successful payment has a receipt and a transaction id.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Accounts that hold up",
    body: "Optional two-factor, a device you can trust, a list of live sessions, and a security log you can read.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="surface-wash relative isolate overflow-hidden border-b border-border">
        {/* Decorative light only — two blurred fields drifting out of phase, so
            the first screen reads as a live surface rather than a flat gradient.
            Nothing here is content, hence aria-hidden. */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="cc-drift absolute -top-40 -left-32 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="cc-drift-alt absolute -top-28 -right-28 size-[28rem] rounded-full bg-chart-3/15 blur-3xl" />
        </div>

        <div className="page-shell grid gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
          <div className="cc-stagger cc-stagger-blur space-y-7">
            <Badge variant="outline" className="h-7 bg-background/70 px-3">
              <span
                className="cc-ping relative size-1.5 rounded-full bg-success text-success"
                aria-hidden
              />
              Every report gets an SLA clock
            </Badge>

            {/* No hard line break: at 56px in a 760px column the first
                sentence is within a few characters of the edge, so a <br /> that
                looks deliberate on one screen strands a single word on the next.
                The span goes block once there is room for it to own a line, and
                text-balance evens out whatever wrapping is left. */}
            <h1 className="h-display">
              Tell the city what is broken.{" "}
              <span className="text-primary sm:block">
                Then watch it get fixed.
              </span>
            </h1>

            <p className="lead max-w-xl text-muted-foreground">
              CityCare is where municipal complaints and civic services live in
              one place. Report an issue in under a minute, follow it by its
              tracking id, and apply for the services you need without a queue.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="cc-sheen"
                nativeButton={false}
                render={<Link href={routes.complaints.new} />}
              >
                <MegaphoneIcon data-icon="inline-start" />
                Report an issue
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group"
                nativeButton={false}
                render={<Link href={routes.services.catalog} />}
              >
                Browse services
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Button>
            </div>
          </div>

          {/* The tracking box is the second half of the hero: it is the one
              action a first-time visitor can finish without signing up. */}
          <Card className="cc-rise cc-delay-3 border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="space-y-1">
                <h2 className="h-card text-[17px]">
                  Already reported something?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the tracking id from your confirmation email.
                </p>
              </div>

              <TrackWidget />

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">
                  Tracking ids look like{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]">
                    CC-2026-000123
                  </code>
                  . Status and timeline only — no names, no addresses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------ banner */}
      <CityShowcase />

      {/* ---------------------------------------------------------- coverage */}
      <CityBanner />

      {/* ----------------------------------------------------------- how it works */}
      <section className="page-shell py-20 lg:py-28">
        <div className="cc-reveal mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="h-section-lg">Three steps, start to finish</h2>
          <p className="lead text-muted-foreground">
            The same path whether it is a streetlight or a drainage collapse.
          </p>
        </div>

        <ol className="cc-stagger mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="cc-lift group h-full">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
                      <step.icon className="size-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="h-card text-[17px]">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- features */}
      <section className="border-y border-border bg-card/40">
        <div className="page-shell py-20 lg:py-28">
          <div className="cc-reveal max-w-2xl space-y-4">
            <h2 className="h-section-lg">Built for the awkward parts</h2>
            <p className="lead text-muted-foreground">
              The bits that usually go missing between a complaint form and an
              actual repair.
            </p>
          </div>

          <div className="cc-stagger mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="cc-lift group space-y-3 rounded-xl border border-border bg-background p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
                  <feature.icon className="size-[18px]" />
                </span>
                <h3 className="h-card text-[17px]">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ cta */}
      <section className="page-shell py-20 lg:py-28">
        <Card className="cc-reveal surface-wash relative isolate overflow-hidden border-border/70">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            <div className="cc-drift-alt absolute -top-32 -right-16 size-[26rem] rounded-full bg-primary/12 blur-3xl" />
          </div>
          <CardContent className="flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-3">
              <h2 className="h-section-lg">Start with one report</h2>
              <p className="lead text-muted-foreground">
                Create an account and your complaints, applications and receipts
                stay together — with a security log you can actually read.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                size="lg"
                className="cc-sheen"
                nativeButton={false}
                render={<Link href={routes.auth.register} />}
              >
                Create an account
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href={routes.nearby} />}
              >
                See issues nearby
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
