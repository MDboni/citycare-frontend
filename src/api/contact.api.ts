import { api } from "@/lib/api-client";

export const contactApi = {
  /**
   * Unauthenticated, and answers only an acknowledgement — no id comes back,
   * because the sender has nothing to do with one. Anything they need to follow
   * up on should be a complaint, which has a tracking id.
   */
  send: (body: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => api<{ message: string }>("/contact", { method: "POST", body }),
};
