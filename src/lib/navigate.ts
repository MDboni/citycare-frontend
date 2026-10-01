/**
 * Leaves a sign-in screen with a full document load, not a client navigation.
 *
 * `proxy.ts` decides whether a route needs a session by reading the `cc_rt`
 * cookie, and Next's client Router Cache may already hold the answer it gave
 * before that cookie existed: a protected page prefetched while signed out
 * caches the Proxy's redirect back to `/auth/login`. `router.replace` then
 * replays that cached redirect without asking the server at all, and the person
 * who just signed in is put straight back on the form they came from. Reloading
 * is the one thing that fixes it, because a reload is the one thing that does
 * not consult the cache.
 *
 * So the moment the session changes, stop trusting the cache. A hard load also
 * drops every piece of in-memory state belonging to the previous session, which
 * is exactly what both signing in and signing out want.
 *
 * `replace`, not `assign`: the sign-in screen should not be sitting in history
 * behind the page it let you into.
 */
export const leaveAuthScreen = (to: string) => {
  if (typeof window === "undefined") return;
  window.location.replace(to);
};
