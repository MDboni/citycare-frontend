import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  MegaphoneIcon,
  PhoneIcon,
  SearchIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the right municipal department directly, find your ward office, or check a report you have already filed by its tracking id.",
  openGraph: {
    title: "Contact CityCare",
    description:
      "Reach the right municipal department directly, or check a report by its tracking id.",
    type: "website",
  },
};

/**
 * The four seeded departments and what each one actually answers for, taken
 * from the categories routed to them rather than from a generic org chart.
 */
const DEPARTMENTS = [
  {
    name: "Roads",
    handles: "Potholes, broken footpaths, damaged road dividers",
    email: "roads@citycare.gov.bd",
    phone: "+880 2 5566 0101",
  },
  {
    name: "Electricity",
    handles: "Street lights out, dangling or exposed power cables",
    email: "electricity@citycare.gov.bd",
    phone: "+880 2 5566 0102",
  },
  {
    name: "Waste",
    handles: "Missed collections, illegal dumping, bulk pickup",
    email: "waste@citycare.gov.bd",
    phone: "+880 2 5566 0103",
  },
  {
    name: "Water",
    handles: "Supply disruption, sewer overflow, waterlogging",
    email: "water@citycare.gov.bd",
    phone: "+880 2 5566 0104",
  },
] as const;

const ZONES = [
  {
    name: "North Zone",
    wards: [
      "1 — Mirpur",
      "2 — Uttara",
      "3 — Gulshan",
      "4 — Banani",
      "5 — Mohakhali",
    ],
  },
  {
    name: "South Zone",
    wards: [
      "6 — Dhanmondi",
      "7 — Motijheel",
      "8 — Jatrabari",
      "9 — Badda",
      "10 — Tejgaon",
    ],
  },
] as const;

export default function ContactPage() {
  return (
    <div className="page-shell space-y-14 py-12 lg:py-16">
      <header className="cc-rise max-w-3xl space-y-4">
        <h1 className="h-section-lg">Getting hold of the right desk</h1>
        <p className="lead text-muted-foreground">
          For anything that needs fixing, filing a report beats an email — it
          routes itself to the department and the ward, and it comes with a
          clock you can hold us to. The numbers below are for everything else.
        </p>
      </header>

      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>
          If someone is in immediate danger, do not use this site
        </AlertTitle>
        <AlertDescription>
          Call the national emergency number 999. A live electrical hazard, a
          collapsed structure or a road blocked by flooding needs an emergency
          service, not a ticket queue — file the report afterwards so the repair
          is tracked.
        </AlertDescription>
      </Alert>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 className="h-section">Departments</h2>
            <p className="text-sm text-muted-foreground">
              Four departments take reports. A complaint filed through CityCare
              reaches the same officers, with a tracking id attached.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {DEPARTMENTS.map((department) => (
              <li key={department.name}>
                <Card className="h-full">
                  <CardContent className="space-y-3 p-5">
                    <div className="space-y-1">
                      <h3 className="h-card text-[17px]">{department.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {department.handles}
                      </p>
                    </div>
                    <div className="space-y-1.5 border-t border-border pt-3">
                      <p className="flex items-center gap-2 text-sm">
                        <MailIcon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <a
                          href={`mailto:${department.email}`}
                          className="truncate underline-offset-4 hover:underline"
                        >
                          {department.email}
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <PhoneIcon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <a
                          href={`tel:${department.phone.replace(/\s/g, "")}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {department.phone}
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClockIcon className="size-[18px]" />
              </span>
              <h2 className="h-card text-[17px]">Counter hours</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sunday – Thursday</dt>
                  <dd className="font-medium">9:00 – 17:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Friday – Saturday</dt>
                  <dd className="font-medium">Closed</dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Reports and service applications are taken online around the
                clock. The SLA clock does not stop at closing time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPinIcon className="size-[18px]" />
              </span>
              <h2 className="h-card text-[17px]">City Hall</h2>
              <address className="text-sm not-italic text-muted-foreground">
                CityCare Municipal Office
                <br />
                Nagar Bhaban, Fulbaria
                <br />
                Dhaka 1000, Bangladesh
              </address>
              <p className="flex items-center gap-2 text-sm">
                <MailIcon
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <a
                  href="mailto:help@citycare.gov.bd"
                  className="underline-offset-4 hover:underline"
                >
                  help@citycare.gov.bd
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <h2 className="h-section">Ward offices</h2>
          <p className="text-sm text-muted-foreground">
            Ten wards across two zones. A report picks up the officer covering
            the ward you filed it in, so you rarely need to know which one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ZONES.map((zone) => (
            <Card key={zone.name}>
              <CardContent className="space-y-3 p-5">
                <h3 className="h-card text-[17px]">{zone.name}</h3>
                <ul className="grid gap-1.5 text-sm text-muted-foreground">
                  {zone.wards.map((ward) => (
                    <li key={ward}>Ward {ward}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <MegaphoneIcon className="size-[18px]" />
            </span>
            <h2 className="h-card text-[17px]">Something needs fixing</h2>
            <p className="text-sm text-muted-foreground">
              File it rather than phoning it. You get a tracking id, an SLA, and
              a record nobody can lose.
            </p>
            <Button
              nativeButton={false}
              render={<Link href={routes.complaints.new} />}
            >
              Report an issue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <SearchIcon className="size-[18px]" />
            </span>
            <h2 className="h-card text-[17px]">Chasing something you filed</h2>
            <p className="text-sm text-muted-foreground">
              The tracking id from your confirmation email shows status and
              timeline without signing in.
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={routes.track} />}
            >
              Track a complaint
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
