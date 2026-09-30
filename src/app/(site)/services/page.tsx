import { BriefcaseIcon, FileTextIcon, ReceiptTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageBanner } from "@/components/shared/page-banner";
import { ServicesView } from "./services-view";

export const metadata: Metadata = {
  title: "Civic services",
  description:
    "Apply online for municipal licences, certificates and permits. See the fee before you start.",
};

export default function ServicesPage() {
  return (
    <>
      {/* The banner carries the heading, so the view below starts at the search
          box rather than repeating the title under its own picture. */}
      <PageBanner
        seed={4820311}
        tone="dusk"
        accent="amber"
        chips={[BriefcaseIcon, ReceiptTextIcon, FileTextIcon]}
        title="Civic services"
        lead="Licences, certificates and permits you can apply for online. Pay the fee, upload the documents, and follow the file by its reference number."
      />
      <ServicesView />
    </>
  );
}
