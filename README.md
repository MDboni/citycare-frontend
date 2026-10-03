# CityCare — resident app

The public half of CityCare: where a resident reports a problem in their street,
follows it to resolution, applies for a municipal service and pays the fee.

Staff never work here. Officers and administrators use the [staff console][console],
a separate Next.js app against the same API, and each app signs in only the roles
it owns.

| | |
|---|---|
| Live | https://citycare-frontend.vercel.app |
| Staff console | https://citycare-dashboard.vercel.app |
| API | https://citycare-backend6.vercel.app |
| API docs | https://citycare-backend6.vercel.app/api/v1/docs |

## Signing in to look around

The sign-in page carries a **Demo login** button that needs no typing. The same
account by hand:

```
citizen1@citycare.com / Citizen@12345
```

Officer and administrator accounts exist, but they belong to the console — this
app refuses them rather than handing out a session that would be rejected on
every page.

## What a resident can do

- **Report an issue** with photos and the phone's own location; CityCare works
  out the ward and the department, assigns an SLA, and warns about a possible
  duplicate already reported nearby
- **Follow it** by status, history and officer comments, upvote someone else's,
  reopen or cancel their own, and leave feedback once it is closed
- **Track by reference** at `/track` without signing in at all
- **See what is being reported around them** at `/nearby` — their own location
  and a radius, no sign-in needed
- **Apply for a service** — trade licence, water connection, certificate copies —
  upload the documents and pay the fee through SSLCommerz
- **Pay and keep the receipt**: the PDF arrives by email and downloads from the
  payments page
- **Manage the account**: profile, password, two-factor, active sessions on every
  device, and a full export or deletion of their own data

## How it is built

**Next.js 16 App Router, React 19, TypeScript.** Server Components are the
default; `"use client"` appears only where something genuinely needs the browser
— forms, the map, anything reading the session. Every route group has its own
`layout.tsx`, route-level `loading.tsx` skeletons, and an `error.tsx` boundary.

**`src/proxy.ts`** (Next 16's renamed middleware) gates every private route on the
session cookie and redirects to `/auth/login?next=…`, so a signed-out visitor
never sees a protected page flash before it disappears.

**State.** TanStack Query owns everything that comes from the API — caching,
invalidation, loading and error states. Redux Toolkit holds the small amount of
client-only UI state. Filters and pagination live in the URL via
`useSearchParams`, so a filtered list is a link somebody can send.

**Forms.** React Hook Form with Zod resolvers, and the schemas mirror the API's
own validation so a field fails in the browser for the same reason it would fail
on the server.

**Auth.** Access and refresh tokens, with a single-flight refresh: ten queries
that fail a 401 in the same tick produce one refresh, not ten — the API treats a
reused refresh token as theft and would revoke the session. Sign-in and sign-out
cross the session boundary with a full document load, because Next's client
Router Cache can otherwise replay a redirect decided before the cookie existed.

**UI.** Tailwind CSS v4 and Base UI primitives, mobile-first, dark mode included.
Images go through `next/image`; there is not a raw `<img>` in the codebase.

## Running it

Needs the API on `http://localhost:5000` — see the [backend repo][api].

```bash
npm install
cp .env.example .env     # then fill it in
npm run dev              # http://localhost:3000
```

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API root including `/api/v1` |
| `NEXT_PUBLIC_APP_URL` | this app's own origin, for canonical and Open Graph URLs |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | optional; with it the Google button runs in-page, without it the button falls back to the API's redirect flow |
| `NEXT_PUBLIC_DEMO_LOGINS` | set to `off` to hide the demo panel and keep its credentials out of the bundle |

Anything named `NEXT_PUBLIC_*` is compiled into the JavaScript and readable by
anyone who opens the page. No secret belongs in this file; the API keeps every
secret it needs server-side.

```bash
npm run build   # production build
npm run lint    # Biome
npm run format  # Biome, writing fixes
```

## Layout

```
src/
  app/            routes — (auth) and (site) groups, each with layout/loading/error
  api/            one module per API resource; nothing else calls fetch
  components/     auth, layout, shared and the UI primitives
  hooks/          TanStack Query hooks, one per resource
  lib/            api client, session, formatting, validation helpers
  providers/      auth, query client, theme
  routes/         every internal href, so a typo is a build error not a 404
  validation/     Zod schemas shared by the forms
  proxy.ts        route protection
```

[console]: https://github.com/MDboni/citycare-dashboard
[api]: https://github.com/MDboni/citycare-backend6
