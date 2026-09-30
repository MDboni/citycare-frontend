import type { Step } from "@/components/shared/stepper";

/**
 * The three stops of a fee payment, shared by the checkout page and the page the
 * gateway returns to, so the rail a user sees before leaving is the same rail
 * they come back to.
 */
export const CHECKOUT_STEPS = [
  { id: "review", label: "Review", hint: "Check the fee" },
  { id: "gateway", label: "Secure payment", hint: "On SSLCommerz" },
  { id: "receipt", label: "Receipt", hint: "Back on CityCare" },
] as const satisfies readonly Step[];
