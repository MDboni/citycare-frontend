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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getDepartments, getZones } from "@/lib/server-api";
import { routes } from "@/routes";
import { ContactForm } from "./contact-form";

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

  return (
    <div className="page-shell space-y-14 py-12 lg:py-16">
      <header className="cc-rise max-w-3xl space-y-4">
        <h1 className="h-section-lg">Getting hold of the right desk</h1>
        <p className="lead text-muted-foreground">
          For anything that needs fixing, filing a report beats an email — it
          routes itself to the department and the ward, and it comes with a
          clock you can hold us to. The desks below are for everything else.
        </p>
      </header>

      {/*
        A styled callout, not <Alert>: Alert hardcodes role="alert", which is an
        assertive live region. On static page content that interrupts a screen
        reader mid-heading on every single visit to announce something that has
        not just happened.
      */}
      <section
        aria-labelledby="emergency-heading"
        className="flex items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
      >
        <TriangleAlertIcon
          className="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="space-y-1">
          <h2 id="emergency-heading" className="text-sm font-medium">
            If someone is in immediate danger, do not use this site
          </h2>
          <p className="text-sm text-muted-foreground">
            Call the national emergency number 999. A live electrical hazard, a
            collapsed structure or a road blocked by flooding needs an emergency
            service, not a ticket queue — file the report afterwards so the
            repair is tracked.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <h2 className="h-section">Departments</h2>
          <p className="text-sm text-muted-foreground">
            {departments.length > 0
              ? `${departments.length} departments take reports. A complaint filed through CityCare reaches the same officers, with a tracking id attached.`
              : "Department contacts are loaded from the service directory, which is not reachable right now. Filing a report still works."}
          </p>
        </div>

        {departments.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {departments.map((department) => {
              const handles = handledBy.get(department.id) ?? [];
              return (
                <li key={department.id}>
                  <Card className="h-full">
                    <CardContent className="space-y-3 p-5">
                      <div className="space-y-1">
                        <h3 className="h-card text-[17px]">
                          {department.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {handles.length > 0
                            ? handles.join(", ")
                            : "No categories routed here yet."}
                        </p>
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

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          <div className="max-w-2xl space-y-2">
            <h2 className="h-section">Zones and wards</h2>
            <p className="text-sm text-muted-foreground">
              A report picks up the officer covering the ward you filed it in,
              so you rarely need to know which zone that is.
            </p>
          </div>

          {zones.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="space-y-3 p-5">
                    <h3 className="h-card text-[17px]">{zone.name}</h3>
                    <ul className="grid gap-1.5 text-sm text-muted-foreground">
                      {[...zone.wards]
                        .sort((a, b) => a.number - b.number)
                        .map((ward) => (
                          <li key={ward.id}>
                            Ward {ward.number} — {ward.name}
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

        <div className="space-y-5">
          <ContactForm />

          <Card>
            <CardContent className="space-y-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClockIcon className="size-[18px]" />
              </span>
              <h3 className="h-card text-[17px]">When we are reachable</h3>
              <p className="text-sm text-muted-foreground">
                Reports and service applications are taken online around the
                clock, and the SLA clock does not pause for a weekend — a
                twelve-hour target is twelve hours whenever it starts.
              </p>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Officers are assigned by ward, so the desk that answers is the
                one covering the address on the report.
              </p>
            </CardContent>
          </Card>
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
