import {
  BriefcaseIcon,
  ConstructionIcon,
  DropletsIcon,
  LightbulbIcon,
  ReceiptIcon,
  RulerIcon,
  ScrollTextIcon,
  Trash2Icon,
} from "lucide-react";
import { CityIllustration } from "@/components/shared/city-illustration";

type Tone = "primary" | "amber" | "teal" | "green";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-chart-2/12 text-chart-2",
  teal: "bg-chart-3/12 text-chart-3",
  green: "bg-chart-5/12 text-chart-5",
};

/**
 * What the city actually answers for, drawn from the four departments that
 * take complaints and the services the counter accepts applications for.
 * These are the seeded departments and service types, not a wishlist — a
 * banner promising something the catalogue does not carry is a support ticket.
 */
const COVERS = [
  {
    icon: ConstructionIcon,
    title: "Roads & footpaths",
    body: "Potholes, broken kerbs, damaged dividers",
    tone: "primary",
    side: "left",
    top: "2%",
  },
  {
    icon: LightbulbIcon,
    title: "Street lighting",
    body: "Dead lamps and dangling power cables",
    tone: "amber",
    side: "left",
    top: "27%",
  },
  {
    icon: Trash2Icon,
    title: "Waste collection",
    body: "Missed pickups and illegal dumping",
    tone: "green",
    side: "left",
    top: "52%",
  },
  {
    icon: DropletsIcon,
    title: "Water & drainage",
    body: "Supply cuts, sewer overflow, waterlogging",
    tone: "teal",
    side: "left",
    top: "77%",
  },
  {
    icon: BriefcaseIcon,
    title: "Trade licences",
    body: "New applications and yearly renewals",
    tone: "primary",
    side: "right",
    top: "2%",
  },
  {
    icon: ReceiptIcon,
    title: "Holding tax",
    body: "Pay online and keep the receipt",
    tone: "amber",
    side: "right",
    top: "27%",
  },
  {
    icon: RulerIcon,
    title: "Building plans",
    body: "Submit drawings and track the approval",
    tone: "teal",
    side: "right",
    top: "52%",
  },
  {
    icon: ScrollTextIcon,
    title: "Certificates",
    body: "Birth records and certified copies",
    tone: "green",
    side: "right",
    top: "77%",
  },
] as const satisfies readonly {
  icon: typeof ConstructionIcon;
  title: string;
  body: string;
  tone: Tone;
  side: "left" | "right";
  top: string;
}[];

/**
 * The coverage banner.
 *
 * One list, two layouts. Below `xl` it is an ordinary grid under the city;
 * at `xl` the same `<li>`s are absolutely placed to flank it. The alternative —
 * a grid for small screens and a positioned copy for large — would put every
 * label in the DOM twice, which a screen reader reads twice.
 *
 * The inline `top` is safe at every width: an offset does nothing to a static
 * element, so it only takes effect once `xl:absolute` applies.
 */
export function CityBanner() {
  return (
    <section className="border-b border-border bg-card/40">
      <div className="page-shell py-20 lg:py-24">
        <div className="cc-reveal mx-auto max-w-2xl space-y-4 text-center">
          <p className="eyebrow justify-center">Coverage</p>
          <h2 className="h-section-lg">Everything the city looks after</h2>
          <p className="lead text-muted-foreground">
            Four departments take reports, and the service counter is open for
            the paperwork that used to need a morning off.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <CityIllustration className="mx-auto w-full max-w-[34rem]" />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:absolute xl:inset-0 xl:mt-0 xl:block">
            {COVERS.map((item) => (
              <li
                key={item.title}
                className={`xl:absolute xl:w-60 ${item.side === "left" ? "xl:left-0" : "xl:right-0"}`}
                style={{ top: item.top }}
              >
                <div
                  className={`cc-lift flex items-start gap-3 rounded-xl border border-border/70 bg-card/85 p-3.5 shadow-xs backdrop-blur ${
                    item.side === "right"
                      ? "xl:flex-row-reverse xl:text-right"
                      : ""
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TONES[item.tone]}`}
                  >
                    <item.icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.body}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
