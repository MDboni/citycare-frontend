import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "One CityCare account for municipal complaints, service applications and fee payments.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
