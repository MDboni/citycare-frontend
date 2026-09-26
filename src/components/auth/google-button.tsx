"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
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

export function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  const { signIn } = useAuth();
  const googleLogin = useGoogleTokenLogin();

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
    <div className="flex justify-center [color-scheme:light]">
      <GoogleLogin
        text="continue_with"
        width="360"
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
              toast.info("Confirm your email to finish creating the account.");
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
            toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
            router.push(routes.complaints.list);
          } catch (error) {
            toast.error(errorMessage(error));
          }
        }}
      />
    </div>
  );
}
