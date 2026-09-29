import { FormPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the account tabs, all of which are forms. */
export default function Loading() {
  return <FormPageSkeleton fields={5} />;
}
