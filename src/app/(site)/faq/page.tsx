import {
  ChevronDownIcon,
  CircleQuestionMarkIcon,
  LightbulbIcon,
  WalletIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageBanner } from "@/components/shared/page-banner";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/format";
import { getCategories, getServiceTypes } from "@/lib/server-api";
import { routes } from "@/routes";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "What happens after you report something, how the SLA clock works, what upvotes do, what the service fees are, and how payments and refunds are handled.",
  openGraph: {
    title: "CityCare — frequently asked questions",
    description:
      "How reports, SLAs, upvotes, service fees and payments work on CityCare.",
    type: "website",
  },
};

/**
 * Answers describe what the system actually does — the SLA figures, the fees
 * and the upvote threshold are the ones the API is running with, not rounded
 * marketing numbers.
 */
/**
 * Two answers are filled in at render from the live taxonomy rather than
 * written out here. Both were transcribed from the seed originally and both
 * had already gone stale — the SLA list quietly omitted a category.
 */
const SLA_ANSWER = Symbol("sla");
const FEES_ANSWER = Symbol("fees");

const SECTIONS: readonly {
  heading: string;
  items: readonly { q: string; a: string | symbol }[];
}[] = [
  {
    heading: "Reporting an issue",
    items: [
      {
        q: "What happens after I submit a report?",
        a: "The category you pick decides the department and the ward decides the officer, so the report routes itself — you never have to know who owns what. You get a tracking id straight away in the form of CC-2026-000123, and the SLA clock starts at that moment.",
      },
      {
        q: "Do I need an account to check on it?",
        a: "No. The tracking id is enough, and it shows status and timeline only — no name, no address, no phone number. That is deliberate: you can hand the id to a neighbour or a landlord without handing over your details.",
      },
      {
        q: "Can I add photos?",
        a: "Yes, and it helps. Attachments are added once the complaint exists — the form hands you the tracking id first, then takes the photos — because an attachment has to belong to something. You can add more later from the complaint page.",
      },
      {
        q: "Someone already reported the same pothole. Should I file another?",
        a: "Back theirs instead. Crossing ten upvotes lifts a complaint one priority level — once, when it passes ten, not another step per ten. Even so, one report fifty neighbours stand behind outranks fifty separate reports that each start at the bottom.",
      },
    ],
  },
  {
    heading: "The SLA clock",
    items: [
      { q: "What is the SLA and who sets it?", a: SLA_ANSWER },
      {
        q: "What happens if the clock runs out?",
        a: "A breach escalates the complaint without anyone having to ask. The countdown stays visible on the complaint the whole time, before and after, so a missed target is on the record rather than quietly reset.",
      },
      {
        q: "Does the clock stop outside office hours?",
        a: "No. The counter closes on Friday and Saturday; the clock does not.",
      },
    ],
  },
  {
    heading: "Closing the loop",
    items: [
      {
        q: "How do I know the work is actually done?",
        a: "The assigned officer posts proof when they close the job — you see what was done, by whom and when, on the same timeline as everything else.",
      },
      {
        q: "The problem came back. Can I reopen it?",
        a: "Yes, but not indefinitely: a complaint can be reopened twice, and only within seven days of being marked resolved. Both limits are settings an administrator can change, and the API refuses past either — so if a pothole comes back a month later, file a fresh report rather than waiting on a reopen. A reopen keeps the original tracking id and history, so the repeat stays visible.",
      },
      {
        q: "Can I cancel something I reported by mistake?",
        a: "Yes, from the complaint page, as long as the work has not already been done. It stays in your history marked as cancelled rather than disappearing.",
      },
    ],
  },
  {
    heading: "Services and payments",
    items: [
      { q: "What can I apply for, and what does it cost?", a: FEES_ANSWER },
      {
        q: "How is the fee taken?",
        a: "Through SSLCommerz. You leave CityCare for the gateway, pay there, and come back to a result page. Every successful payment has a receipt and a transaction id attached to the application — CityCare never sees or stores your card.",
      },
      {
        q: "My payment failed or I cancelled it. What now?",
        a: "Nothing is charged and the application stays where it was, waiting for payment. You can start the payment again from the application page whenever you are ready.",
      },
      {
        q: "Can I get a refund?",
        a: "You can request one against a completed payment with a reason attached. It goes to an administrator to approve rather than being automatic, and the decision is written to the audit log either way.",
      },
    ],
  },
  {
    heading: "Your account and your data",
    items: [
      {
        q: "Is two-factor verification available?",
        a: "Yes, and it is off by default for residents. Turn it on from Account → Security and new sign-ins ask for a six digit code by email. You can mark a browser as trusted so it stops asking on that one device, and revoke that trust later from the same place.",
      },
      {
        q: "Can I see where my account is signed in?",
        a: "Account → Devices lists every live session with its device and last activity, and you can end any of them. Account → Security keeps a log of sign-ins, successful and failed.",
      },
      {
        q: "Can I get a copy of my data?",
        a: "Account → Your data exports what CityCare holds about you — your reports, applications, payments and account history.",
      },
      {
        q: "Who can see my complaint?",
        a: "Anyone with the tracking id sees status and timeline. Your name, address and contact details are visible only to you and to the staff working the complaint, and every staff view of a record is written to the audit trail.",
      },
    ],
  },
];

export default async function FaqPage() {
  const [categories, serviceTypes] = await Promise.all([
    getCategories(),
    getServiceTypes(),
  ]);

  const slaLadder = [...categories].sort((a, b) => a.slaHours - b.slaHours);
  const activeServices = serviceTypes.filter((service) => service.isActive);

  const dynamicAnswers = new Map<symbol, ReactNode>([
    [
      SLA_ANSWER,
      slaLadder.length === 0 ? (
        "Every category carries its own target, set by how dangerous the problem is rather than how loudly it is reported. The current targets are published on the About page."
      ) : (
        <>
          Every category carries its own target, set by how dangerous the
          problem is rather than how loudly it is reported. The current targets
          are{" "}
          {slaLadder
            .map((category) => `${category.name} ${category.slaHours}h`)
            .join(", ")}
          .
        </>
      ),
    ],
    [
      FEES_ANSWER,
      activeServices.length === 0 ? (
        "The service catalogue lists what you can apply for and what each one costs. Each application takes its documents and its fee in the same flow."
      ) : (
        <>
          {activeServices
            .map((service) => `${service.name} is ${formatBdt(service.fee)}`)
            .join(", ")}
          . Each application takes its documents and its fee in the same flow.
        </>
      ),
    ],
  ]);

  return (
    <div className="pb-16 lg:pb-20">
      <PageBanner
        seed={660218}
        tone="dusk"
        accent="violet"
        chips={[CircleQuestionMarkIcon, LightbulbIcon, WalletIcon]}
        title="Frequently asked questions"
        lead="The things people ask before they file their first report — what the clock means, what upvotes do, and what happens to a fee once you have paid it."
      />

      <div className="page-shell space-y-12 pt-12 lg:pt-16">
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="h-section">{section.heading}</h2>

              <div className="divide-y divide-border rounded-xl border border-border">
                {section.items.map((item) => (
                  /*
                   * Native <details>, not a JS accordion: it opens without
                   * hydration, it is keyboard and screen-reader correct out of
                   * the box, and it keeps this page a Server Component.
                   */
                  <details key={item.q} className="group px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <ChevronDownIcon
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden
                      />
                    </summary>
                    <p className="pb-4 text-sm text-muted-foreground">
                      {typeof item.a === "symbol"
                        ? dynamicAnswers.get(item.a)
                        : item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/50 p-8">
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="h-card text-[17px]">Still stuck?</h2>
            <p className="text-sm text-muted-foreground">
              The department desks answer things this page does not.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link href={routes.contact} />}
            >
              Contact a department
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={routes.track} />}
            >
              Track a complaint
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
