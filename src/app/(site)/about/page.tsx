import {
  BuildingIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ThumbsUpIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "About CityCare",
  description:
    "How CityCare routes a municipal complaint from a photo on a footpath to a closed job with proof — the SLA clock, the four departments, and the ten wards behind it.",
  openGraph: {
    title: "About CityCare",
    description:
      "How a municipal complaint travels from a photo on a footpath to a closed job with proof.",
    type: "website",
  },
};

/** Real seeded SLA targets — what a report is actually measured against. */
const SLA_EXAMPLES = [
  { category: "Dangling power cable", hours: 12, department: "Electricity" },
  { category: "Sewer overflow", hours: 24, department: "Water" },
  { category: "Garbage not collected", hours: 24, department: "Waste" },
  {
    category: "Street light not working",
    hours: 48,
    department: "Electricity",
  },
  { category: "Pothole", hours: 72, department: "Roads" },
  { category: "Damaged road divider", hours: 168, department: "Roads" },
] as const;

const DEPARTMENTS = [
  { name: "Roads", handles: "Potholes, broken footpaths, damaged dividers" },
  { name: "Electricity", handles: "Street lights, dangling power cables" },
  { name: "Waste", handles: "Missed collections, illegal dumping" },
  { name: "Water", handles: "Supply cuts, sewer overflow, waterlogging" },
] as const;

const ROLES = [
  {
    icon: UsersIcon,
    title: "Residents",
    body: "Report an issue, follow it by its tracking id, back a report a neighbour already filed, and apply for the services the counter used to queue for.",
  },
  {
    icon: BuildingIcon,
    title: "Officers",
    body: "Work the queue for their department and ward: accept, assign, post progress, and close a job with proof of the work done.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Administrators",
    body: "Run the taxonomy, the staff and the permissions, and read the audit trail. Nothing changes hands without a row in the log.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="page-shell space-y-16 py-12 lg:py-16">
      <header className="cc-rise max-w-3xl space-y-4">
        <Badge variant="outline" className="h-7 px-3">
          About CityCare
        </Badge>
        <h1 className="h-section-lg">
          A complaint should not disappear into an inbox.
        </h1>
        <p className="lead text-muted-foreground">
          CityCare is the municipal complaint and civic service platform for the
          city. Every report gets a tracking id, a department, a ward and a
          clock — and the clock is public. It exists because the gap between
          telling someone and someone fixing it is where most civic complaints
          quietly die.
        </p>
      </header>

      <section className="space-y-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="h-section">The SLA clock</h2>
          <p className="text-muted-foreground">
            Every category carries its own target, set by how dangerous the
            problem is rather than how loudly it is reported. The countdown
            starts the moment the report lands, sits on the complaint where
            anyone can see it, and escalates a breach without waiting to be
            asked.
          </p>
        </div>

        <ul className="cc-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SLA_EXAMPLES.map((item) => (
            <li key={item.category}>
              <Card className="h-full">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.department}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <ClockIcon className="size-3.5" aria-hidden />
                    {item.hours}h
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          A dangling cable is twelve hours. A damaged road divider is a week.
          The difference is the point.
        </p>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <h2 className="h-section">Who does what</h2>
          <ul className="space-y-5">
            {ROLES.map((role) => (
              <li key={role.title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <role.icon className="size-[18px]" />
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="h-card text-[17px]">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <h2 className="h-section">Four departments, ten wards</h2>
          <p className="text-muted-foreground">
            A report routes itself. The category decides the department, the
            ward decides the officer, and nobody has to know an org chart to
            file one.
          </p>

          <ul className="space-y-2.5">
            {DEPARTMENTS.map((department) => (
              <li
                key={department.name}
                className="rounded-xl border border-border p-4"
              >
                <p className="text-sm font-medium">{department.name}</p>
                <p className="text-sm text-muted-foreground">
                  {department.handles}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <MapPinIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              Ten wards across a North and a South zone — Mirpur, Uttara,
              Gulshan, Banani, Mohakhali, Dhanmondi, Motijheel, Jatrabari, Badda
              and Tejgaon.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ThumbsUpIcon className="size-[18px]" />
            </span>
            <h2 className="h-card text-[17px]">Upvotes that move a queue</h2>
            <p className="text-sm text-muted-foreground">
              When neighbours back the same issue its priority climbs a step —
              ten upvotes is one level. A pothole fifty people drive over should
              not sit behind one nobody reported twice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheckIcon className="size-[18px]" />
            </span>
            <h2 className="h-card text-[17px]">Tracking without an account</h2>
            <p className="text-sm text-muted-foreground">
              A tracking id shows status and timeline to anyone holding it, and
              nothing else — no name, no address, no phone number. You can hand
              it to a neighbour without handing over your details.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/50 p-8">
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="h-card text-[17px]">Start with one report</h2>
          <p className="text-sm text-muted-foreground">
            It takes about a minute, and the tracking id comes back straight
            away.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            nativeButton={false}
            render={<Link href={routes.complaints.new} />}
          >
            Report an issue
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.faq} />}
          >
            Read the FAQ
          </Button>
        </div>
      </section>
    </div>
  );
}
