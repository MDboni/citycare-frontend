import { BannerSkeleton, GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the service catalogue. Opens with the banner, as the page does. */
export default function Loading() {
  return (
    <>
      <BannerSkeleton />
      <GridPageSkeleton count={6} />
    </>
  );
}
