import type { Metadata } from "next";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor verification",
  robots: { index: false, follow: false },
};

export default function TwoFactorPage() {
  return <TwoFactorForm />;
}
