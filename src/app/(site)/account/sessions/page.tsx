import type { Metadata } from "next";
import { SessionsView } from "./sessions-view";

export const metadata: Metadata = {
  title: "Devices",
  robots: { index: false, follow: false },
};

export default function SessionsPage() {
  return <SessionsView />;
}
