import type { Metadata } from "next";
import { VerifySignupOtpForm } from "./verify-otp-form";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default function VerifyOtpPage() {
  return <VerifySignupOtpForm />;
}
