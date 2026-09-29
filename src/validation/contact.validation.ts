import { z } from "zod";
import { emailSchema } from "@/validation/auth.validation";

/**
 * Mirrors the API's own rules so the same message is refused in the same words
 * on both sides — a form that accepts something the server rejects is worse
 * than one that is strict up front.
 */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80, "Too long"),
  email: emailSchema,
  phone: z.string().trim().max(30, "Too long").optional().or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Say what it is about")
    .max(120, "Keep it shorter"),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two, please")
    .max(2000, "That is over 2000 characters"),
});

export type ContactMessageValues = z.infer<typeof contactMessageSchema>;
