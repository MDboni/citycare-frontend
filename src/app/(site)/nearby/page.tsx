import { MapPinIcon, NavigationIcon, ThumbsUpIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";
import { NearbyView } from "./nearby-view";

export const metadata: Metadata = {
  title: "Issues near you",
  description:
    "See municipal complaints reported around your location, and back the ones that affect you.",
};

export default function NearbyPage() {
  return (
    <>
      <PageBanner
        seed={7710244}
        accent="teal"
        chips={[MapPinIcon, NavigationIcon, ThumbsUpIcon]}
        title="Issues near you"
        lead="Complaints reported around your location. If one of them is what you were about to report, upvote it instead — ten upvotes raises its priority."
      />
      <NearbyView />
    </>
  );
}
