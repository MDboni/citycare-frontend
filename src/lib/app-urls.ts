/**
 * Where the other half of CityCare lives.
 *
 * Residents and staff run as two deployments against one API, so anything that
 * sends someone across has to be a real navigation to another origin — a route
 * push would only look for the path on this side.
 */
export const STAFF_URL =
  process.env.NEXT_PUBLIC_STAFF_URL ?? "http://localhost:3001";
