import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { NotificationsView } from "./notifications-view";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading notifications" />}>
      <NotificationsView />
    </Suspense>
  );
}
