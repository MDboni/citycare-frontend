/**
 * The application the browser was paying for when it left for the gateway.
 *
 * SSLCommerz sends everyone back to `/payments/result` with a status and a
 * transaction id and nothing else, so a failed payment would otherwise land on a
 * page that cannot offer "try again" for the thing that just failed. Session
 * storage survives that round trip in the same tab and dies with the tab, which
 * is the right lifetime for a breadcrumb.
 *
 * Every access is wrapped: a private window can throw on the first read, and a
 * breadcrumb is never worth a crash. It is also only ever a breadcrumb — the
 * outcome on the result page comes from the server's redirect, never from here.
 */
const KEY = "citycare:pending-checkout";

export type PendingCheckout = { requestId: string; reference: string };

export const rememberCheckout = (value: PendingCheckout) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage blocked: the result page falls back to the applications list.
  }
};

export const readCheckout = (): PendingCheckout | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    // Anything unexpected under this key is somebody else's data, not ours.
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const { requestId, reference } = parsed as Record<string, unknown>;
    if (typeof requestId !== "string" || requestId === "") return null;

    return {
      requestId,
      reference: typeof reference === "string" ? reference : "",
    };
  } catch {
    return null;
  }
};

export const forgetCheckout = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up if it could never be written.
  }
};
