import type { Metadata } from "next";
import { ServicesView } from "./services-view";

export const metadata: Metadata = {
  title: "Civic services",
  description:
    "Apply online for municipal licences, certificates and permits. See the fee before you start.",
};

export default function ServicesPage() {
  return <ServicesView />;
}
