import {
  BuildingIcon,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getDepartments, getZones } from "@/lib/server-api";
import { routes } from "@/routes";
import { ContactForm } from "./contact-form";
import { ContactShowcase } from "./contact-showcase";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the department that owns your issue, find which zone your ward sits in, or check a report you have already filed by its tracking id.",
  openGraph: {
    title: "Contact CityCare",
    description:
      "Reach the department that owns your issue, or check a report by its tracking id.",
    type: "website",
  },
};

/** At most this many category chips before the rest are counted instead. */
const CHIP_LIMIT = 4;

/**
 * Everything on this page comes from the API.
 *
 * An earlier draft hardcoded the desks and the ward-to-zone mapping, and both
 * were wrong: the seeded departments are reachable at citycare.com, and wards
 * alternate between the two zones rather than splitting 1-5 / 6-10. Publishing
 * a contact address nobody reads is worse than publishing none, so these are
 * read from the same records that route a complaint.
 */
export default async function ContactPage() {
  const [departments, categories, zones] = await Promise.all([
    getDepartments(),
    getCategories(),
    getZones(),
  ]);

  /** What each department actually answers for, from the categories routed to it. */
  const handledBy = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.department) continue;
    const list = handledBy.get(category.department.id) ?? [];
    list.push(category.name);
    handledBy.set(category.department.id, list);
  }

  const wardCount = zones.reduce((total, zone) => total + zone.wards.length, 0);

  return (
    <div className="pb-16 lg:pb-24">
      {/* ---------------------------------------------------------------- hero */}
      <section className="surface-wash relative isolate overflow-hidden border-b border-border">
        {/* Decorative light only, drifting out of phase with itself. */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="cc-drift absolute -top-36 -left-28 size-[30rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="cc-drift-alt absolute -top-24 -right-24 size-[26rem] rounded-full bg-chart-4/15 blur-3xl" />
        </div>

        {/*
          The panel is placed into the first column rather than written first:
          the heading is what this page is, so it leads in the markup and in the
          reading order, and only the grid puts the picture on the left of it.
        */}
        <div className="page-shell grid gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="cc-stagger cc-stagger-blur space-y-6 lg:col-start-2 lg:row-start-1">
            {zones.length > 0 && (
              <Badge variant="outline" className="h-7 bg-background/70 px-3">
                <MapPinIcon data-icon="inline-start" />
                {zones.length} zones · {wardCount} wards
              </Badge>
            )}

            <h1 className="h-section-lg">Getting hold of the right desk</h1>

            <p className="lead max-w-xl text-muted-foreground">
              For anything that needs fixing, filing a report beats an email —
              it routes itself to the department and the ward, and it comes with
              a clock you can hold us to. The desks below are for everything
              else.
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
                nativeButton={false}
                render={<Link href={routes.track} />}
              >
                <SearchIcon data-icon="inline-start" />
                Track a complaint
              </Button>
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-1">
            <ContactShowcase />
          </div>
        </div>
      </section>

      <div className="page-shell space-y-14 pt-12 lg:space-y-20 lg:pt-16">
        {/*
          A styled callout, not <Alert>: Alert hardcodes role="alert", which is
          an assertive live region. On static page content that interrupts a
          screen reader mid-heading on every single visit to announce something
          that has not just happened.
        */}
        <section
          aria-labelledby="emergency-heading"
          className="cc-reveal flex items-start gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6"
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
            aria-hidden
          >
            <TriangleAlertIcon className="size-[18px]" />
          </span>
          <div className="space-y-1">
            <h2 id="emergency-heading" className="h-card text-[15px]">
              If someone is in immediate danger, do not use this site
            </h2>
            <p className="text-sm text-muted-foreground">
              Call the national emergency number 999. A live electrical hazard,
              a collapsed structure or a road blocked by flooding needs an
              emergency service, not a ticket queue — file the report afterwards
              so the repair is tracked.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------- departments */}
        <section className="space-y-6">
          <div className="cc-reveal max-w-2xl space-y-2">
            <h2 className="h-section">Departments</h2>
            <p className="text-sm text-muted-foreground">
              {departments.length > 0
                ? `${departments.length} departments take reports. A complaint filed through CityCare reaches the same officers, with a tracking id attached.`
                : "Department contacts are loaded from the service directory, which is not reachable right now. Filing a report still works."}
            </p>
          </div>

          {departments.length > 0 && (
            <ul className="cc-stagger grid gap-4 sm:grid-cols-2">
              {departments.map((department) => {
                const handles = handledBy.get(department.id) ?? [];
                const shown = handles.slice(0, CHIP_LIMIT);
                const rest = handles.length - shown.length;

                return (
                  <li key={department.id}>
                    <Card className="cc-lift group h-full">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start gap-3">
                          <span
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
                            aria-hidden
                          >
                            <BuildingIcon className="size-[18px]" />
                          </span>
                          <div className="min-w-0 space-y-2">
                            <h3 className="h-card text-[17px]">
                              {department.name}
                            </h3>
                            {/* The categories routed here, as chips rather than
                                a comma list: at six of them the sentence was
                                longer than the card and read as prose nobody
                                finishes. */}
                            {shown.length > 0 ? (
                              <ul className="flex flex-wrap gap-1.5">
                                {shown.map((name) => (
                                  <li key={name}>
                                    <Badge variant="secondary">{name}</Badge>
                                  </li>
                                ))}
                                {rest > 0 && (
                                  <li>
                                    <Badge variant="outline">
                                      +{rest} more
                                    </Badge>
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No categories routed here yet.
                              </p>
                            )}
                          </div>
                        </div>

                        {(department.email ||
                          department.phone ||
                          department.address) && (
                          <div className="space-y-1.5 border-t border-border pt-3">
                            {department.email && (
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
                            )}

                            {department.phone && (
                              <p className="flex items-center gap-2 text-sm">
                                <PhoneIcon
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                  aria-hidden
                                />
                                {/*
                                  The label keeps the office's own spacing; the
                                  dial string keeps only digits and a leading
                                  plus, which is all a dialler should be handed.
                                */}
                                <a
                                  href={`tel:${department.phone.replace(/[^\d+]/g, "")}`}
                                  className="underline-offset-4 hover:underline"
                                >
                                  {department.phone}
                                </a>
                              </p>
                            )}

                            {department.address && (
                              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPinIcon
                                  className="mt-0.5 size-3.5 shrink-0"
                                  aria-hidden
                                />
                                <span>{department.address}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ---------------------------------------------------- zones and form */}
        <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <div className="cc-reveal max-w-2xl space-y-2">
              <h2 className="h-section">Zones and wards</h2>
              <p className="text-sm text-muted-foreground">
                A report picks up the officer covering the ward you filed it in,
                so you rarely need to know which zone that is.
              </p>
            </div>

            {zones.length > 0 ? (
              <div className="cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {zones.map((zone) => (
                  <Card key={zone.id} className="cc-lift h-full">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="h-card text-[17px]">{zone.name}</h3>
                        <Badge variant="outline">
                          {zone.wards.length} wards
                        </Badge>
                      </div>
                      {/* Chips rather than a stacked list: ten wards down a
                          column pushed the card past the form beside it. */}
                      <ul className="flex flex-wrap gap-1.5">
                        {[...zone.wards]
                          .sort((a, b) => a.number - b.number)
                          .map((ward) => (
                            <li key={ward.id}>
                              <Badge
                                variant="secondary"
                                className="h-6 gap-1.5 px-2"
                              >
                                <span className="font-semibold tabular-nums">
                                  {ward.number}
                                </span>
                                {ward.name}
                              </Badge>
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                The ward directory is not reachable right now.
              </p>
            )}
          </div>

          <div className="cc-reveal space-y-5">
            <ContactForm />

            <Card>
              <CardContent className="space-y-3 p-5">
                <span
                  className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  aria-hidden
                >
                  <ClockIcon className="size-[18px]" />
                </span>
                <h3 className="h-card text-[17px]">When we are reachable</h3>
                <p className="text-sm text-muted-foreground">
                  Reports and service applications are taken online around the
                  clock, and the SLA clock does not pause for a weekend — a
                  twelve-hour target is twelve hours whenever it starts.
                </p>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPinIcon
                    className="mt-0.5 size-3.5 shrink-0"
                    aria-hidden
                  />
                  Officers are assigned by ward, so the desk that answers is the
                  one covering the address on the report.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ------------------------------------------------------------- next */}
        <section className="cc-stagger grid gap-4 sm:grid-cols-2">
          <Card className="cc-lift group">
            <CardContent className="space-y-3 p-6">
              <span
                className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
                aria-hidden
              >
                <MegaphoneIcon className="size-[18px]" />
              </span>
              <h2 className="h-card text-[17px]">Something needs fixing</h2>
              <p className="text-sm text-muted-foreground">
                File it rather than emailing it. You get a tracking id, an SLA,
                and a record nobody can lose.
              </p>
              <Button
                nativeButton={false}
                render={<Link href={routes.complaints.new} />}
              >
                Report an issue
              </Button>
            </CardContent>
          </Card>

          <Card className="cc-lift group">
            <CardContent className="space-y-3 p-6">
              <span
                className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground"
                aria-hidden
              >
                <SearchIcon className="size-[18px]" />
              </span>
              <h2 className="h-card text-[17px]">
                Chasing something you filed
              </h2>
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
    </div>
  );
}
