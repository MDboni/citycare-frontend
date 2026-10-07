/**
 * Where the other half of CityCare lives.
 *
 * Residents and staff run as two deployments against one API, so anything that
 * sends someone across has to be a real navigation to another origin — a route
 * push would only look for the path on this side.
 */
export const STAFF_URL =
  process.env.NEXT_PUBLIC_STAFF_URL ?? "http://localhost:3001";

/**
 * The console's sign-in, with the address already filled in.
 *
 * An officer or administrator who types their password here has given us a
 * working credential for the wrong app: the session would be valid and would
 * then 403 on every page, Sign out included. Rather than explain that and make
 * them find the other site, this carries them to it with the one thing they
 * already told us, so only the password is left to type.
 *
 * Only the address travels — never the password, and never a token. The console
 * verifies the sign-in itself, from scratch.
 */
export const staffLoginUrl = (email: string) =>
  `${STAFF_URL}/login?email=${encodeURIComponent(email)}`;
