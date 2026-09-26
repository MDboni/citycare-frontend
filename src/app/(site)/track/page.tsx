import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { TrackView } from "./track-view";

export const metadata: Metadata = {
  title: "Track a complaint",
  description:
    "Enter a CityCare tracking id to see a complaint status and its full timeline. No account needed.",
};

export default function TrackPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading tracker" />}>
      <TrackView />
    </Suspense>
  );
}
