import type { Metadata } from "next";
import { ComplaintDetailView } from "./complaint-detail-view";

export const metadata: Metadata = {
  title: "Complaint",
  robots: { index: false, follow: false },
};

/** `params` is a Promise in Next.js 16 — awaited here, then passed down plain. */
export default async function ComplaintDetailPage(
  props: PageProps<"/complaints/[id]">,
) {
  const { id } = await props.params;
  return <ComplaintDetailView id={id} />;
}
