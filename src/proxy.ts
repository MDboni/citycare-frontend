import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/session";
import {
  GUEST_ONLY_PREFIXES,
  PROTECTED_EXCEPTIONS,
  PROTECTED_PREFIXES,
  routes,
} from "@/routes";

/**
 * Next.js 16 renamed Middleware to Proxy; this is the same edge hook.
 *
 * It is an optimistic check and nothing more. All it reads is whether a refresh
 * token cookie exists, so a signed-out visitor never sees a protected page
 * flash before React can redirect. It never decides authorisation: the API
 * re-verifies the token, the session, the user's status and their role on every
 * single request, which is the check that actually matters.
 */
const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(COOKIE.refreshToken)?.value);

  const needsSession =
    matches(pathname, PROTECTED_PREFIXES) &&
    !matches(pathname, PROTECTED_EXCEPTIONS);

  if (!hasSession && needsSession) {
    const url = request.nextUrl.clone();
    url.pathname = routes.auth.login;
    url.search = "";
    // Remember where they were headed so login can finish the journey.
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && matches(pathname, GUEST_ONLY_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.complaints.list;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the files served from /public.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
