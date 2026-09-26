import type { Metadata } from "next";
import { NewComplaintForm } from "./new-complaint-form";

export const metadata: Metadata = {
  title: "Report an issue",
  description:
    "Report a municipal issue to CityCare. Pick a category and ward, describe what you can see, and get a tracking id.",
};

export default function NewComplaintPage() {
  return <NewComplaintForm />;
}
