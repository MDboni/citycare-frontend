"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGoogleTokenLogin } from "@/hooks";
import { BASE_URL } from "@/lib/api-client";
import { errorMessage } from "@/lib/api-error";
import { saveChallenge, saveSignup } from "@/lib/challenge";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

/**
 * Two routes to the same place, picked by whether the client id is configured.
 *
 * With `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set, Google's own button hands us an id
 * token in the page and `/auth/google/token` verifies it — no redirect, so the
 * form state survives. Without it, the button is a plain link into the backend's
 * redirect flow, which needs no client-side Google credentials at all. Either
 * way the backend decides what happens next.
 */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" role="presentation">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.3v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
    />
  </svg>
);

/**
 * Google renders its button into an iframe of exactly the number of pixels it is
 * given, and it does not care what it is sitting in. Hard-coded at 360 it was
 * 104px wider than the card on a 320px phone, which is a horizontal scrollbar on
 * the whole document — so the width is measured instead. 400 is Google's own
 * ceiling and 200 its floor, and between them the button is the width of the
 * form above it.
 *
 * `width` is the width of the button Google draws, not of the iframe it draws it
 * in: the iframe comes back about 20px wider. Asking for the full measured width
 * therefore produced a 388px iframe inside a 368px box, and the box clipped it —
 * which costs more than the rounded corners it visibly ate. A clipped region
 * takes no clicks, so the outer 10px of each side of the button was dead, and on
 * the taller "Continue as <name>" variant the dead strip is far bigger. Leave
 * Google the margin it is going to take.
 */
const GOOGLE_MIN = 200;
const GOOGLE_MAX = 400;
const GOOGLE_IFRAME_MARGIN = 20;

function useBoxWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => setWidth(Math.floor(node.clientWidth));
    measure();

    // Rotating the phone and opening the keyboard both change this, and the
    // iframe does not resize itself.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  const { signIn } = useAuth();
  const googleLogin = useGoogleTokenLogin();
  const [box, boxWidth] = useBoxWidth();

  if (!clientId) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        nativeButton={false}
        // biome-ignore lint/a11y/useAnchorContent: Button supplies the children to the element it renders.
        render={<a href={`${BASE_URL}/auth/google`} aria-label={label} />}
      >
        <GoogleIcon />
        {label}
      </Button>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={box}
        // min-h so the card does not jump by 40px when the iframe lands, and
        // overflow-x-clip so a screen narrower than Google's 200px floor clips the
        // button rather than stretching the page sideways. Clipping the x axis
        // only, and with `clip` rather than `hidden`, is what keeps the y axis
        // genuinely visible: `overflow-x: hidden` would quietly turn `overflow-y`
        // into `auto` and cut off any button taller than this box — which the
        // personalised "Continue as <name>" button is.
        className="flex min-h-10 w-full justify-center overflow-x-clip [color-scheme:light]"
      >
        {boxWidth > 0 && (
          <GoogleLogin
            text="continue_with"
            /**
             * Both of these default to false in the library, and false is the old
             * world. Without `use_fedcm_for_button` the button reads the Google
             * session the pre-FedCM way, which needs a third-party cookie on
             * accounts.google.com — and a browser that no longer hands those out
             * does not produce an error anyone can see. The click simply issues
             * no credential, `onSuccess` never fires, `onError` never fires, and
             * the only trace is the two `gsi/log` beacons Google sends itself.
             * Turning it on asks the browser to mediate instead, which is the
             * supported path and needs no third-party cookie at all.
             * `itp_support` is the same bargain for Safari's tracking prevention.
             */
            use_fedcm_for_button
            itp_support
            width={String(
              Math.min(
                GOOGLE_MAX,
                Math.max(GOOGLE_MIN, boxWidth - GOOGLE_IFRAME_MARGIN),
              ),
            )}
            onError={() => toast.error("Google sign-in was cancelled.")}
            onSuccess={async (response) => {
              if (!response.credential) {
                toast.error("Google did not return a credential. Try again.");
                return;
              }

              try {
                const result = await googleLogin.mutateAsync({
                  idToken: response.credential,
                });

                if (result.newUser) {
                  saveSignup({
                    email: result.email,
                    expiresInSec: result.expiresInSec,
                  });
                  toast.info(
                    "Confirm your email to finish creating the account.",
                  );
                  router.push(routes.auth.verifyOtp);
                  return;
                }

                if (result.twoFactorRequired) {
                  saveChallenge({
                    kind: "google",
                    challengeId: result.challengeId,
                    email: result.email,
                    expiresInSec: result.expiresInSec,
                  });
                  router.push(routes.auth.twoFactor);
                  return;
                }

                await signIn(result);
                toast.success(
                  `Welcome back, ${result.user.name.split(" ")[0]}.`,
                );
                router.push(routes.complaints.list);
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          />
        )}
      </div>
      {/**
       * The escape hatch. Everything above happens inside Google's iframe, and
       * when it declines to hand over a credential it tells us nothing — so a
       * visitor whose browser the in-page flow cannot work in would otherwise
       * just click a button that does nothing, forever. This is the same sign-in
       * by the redirect route, which asks the browser for nothing it might
       * refuse. It is deliberately quiet: it is for the few people who need it.
       */}
      <a
        href={`${BASE_URL}/auth/google`}
        className="mt-2 block text-center text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
      >
        Button not working? Sign in with Google here
      </a>
    </div>
  );
}
