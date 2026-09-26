import type { Metadata } from "next";
import { RequestDetailView } from "./request-detail-view";

export const metadata: Metadata = {
  title: "Application",
  robots: { index: false, follow: false },
};

export default async function ServiceRequestDetailPage(
  props: PageProps<"/services/requests/[id]">,
) {
  const { id } = await props.params;
  return <RequestDetailView id={id} />;
}
