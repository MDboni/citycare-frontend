import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  type Accent,
  CitySkyline,
  type Tone,
} from "@/components/shared/city-skyline";

/**
 * The picture at the top of a page, with the page's own title on it.
 *
 * Every public page gets one and no two are the same: the seed redraws the
 * skyline, the tone moves it between night and dusk, the accent recolours the
 * network, and the chips put that page's own subject in the sky. It is one
 * component and one drawing engine, not a folder of stock photographs that
 * nobody has the licence to.
 *
 * The heading is real page content — the h1 lives here, not behind the picture.
 */
export function PageBanner({
  title,
  lead,
  actions,
  seed,
  tone = "night",
  accent = "azure",
  chips,
}: {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Redraws the whole skyline. Give every page its own. */
  seed: number;
  tone?: Tone;
  accent?: Accent;
  chips?: LucideIcon[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10">
        <CitySkyline
          id={`banner-${seed}`}
          seed={seed}
          tone={tone}
          accent={accent}
          chips={chips}
          /*
            A band, not the whole drawing. A banner is around four times wider
            than it is tall and `slice` crops the short axis hard, so handing it
            the full 1200×700 would show a strip through the middle of the sky
            with the roofs cut off the bottom. 170..510 is the part worth
            showing: chips, mesh, and the skyline it all stands on.
          */
          view="0 170 1200 340"
          className="size-full"
        />
        {/* The floor the copy stands on: heaviest where the text is. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050a1f]/95 via-[#050a1f]/78 to-[#050a1f]/35" />
      </div>

      <div className="page-shell relative py-14 lg:py-20">
        <div className="cc-stagger cc-stagger-blur max-w-2xl space-y-4">
          <h1 className="h-section-lg text-white">{title}</h1>
          {lead && <p className="lead text-slate-200/90">{lead}</p>}
          {actions && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
