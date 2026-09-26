"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "./auth.provider";
import GoogleAuthProvider from "./google-auth.provider";
import QueryProvider from "./query.provider";
import ThemeProvider from "./theme.provider";

export { useAuth } from "./auth.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <GoogleAuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </GoogleAuthProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
