import type { Metadata } from "next";
import { AccountDataView } from "./data-view";

export const metadata: Metadata = {
  title: "Your data",
  robots: { index: false, follow: false },
};

export default function AccountDataPage() {
  return <AccountDataView />;
}
