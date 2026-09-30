import { ClockIcon, SearchIcon, ShieldIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPageSkeleton } from "@/components/shared/loading";
import { PageBanner } from "@/components/shared/page-banner";
import { TrackView } from "./track-view";

export const metadata: Metadata = {
  title: "Track a complaint",
  description:
    "Enter a CityCare tracking id to see a complaint status and its full timeline. No account needed.",
};

export default function TrackPage() {
  return (
    <>
      {/* Outside the Suspense boundary: the banner needs nothing from the
          search params, so it paints immediately instead of behind a skeleton. */}
      <PageBanner
        seed={3190788}
        accent="violet"
        chips={[SearchIcon, ClockIcon, ShieldIcon]}
        title="Track a complaint"
        lead="Anyone with the tracking id can see where a complaint stands. Names, addresses and comments stay private."
      />
      <Suspense fallback={<FormPageSkeleton fields={2} />}>
        <TrackView />
      </Suspense>
    </>
  );
}
