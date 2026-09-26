import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Ask CityCare for a password reset link.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
