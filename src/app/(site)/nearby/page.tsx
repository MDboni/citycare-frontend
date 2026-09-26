import type { Metadata } from "next";
import { NearbyView } from "./nearby-view";

export const metadata: Metadata = {
  title: "Issues near you",
  description:
    "See municipal complaints reported around your location, and back the ones that affect you.",
};

export default function NearbyPage() {
  return <NearbyView />;
}
