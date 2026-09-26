"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks";
import { routes } from "@/routes";

/** Badge caps at 9+, because the exact number stops mattering past that. */
export function NotificationBell() {
  const { count } = useUnreadCount();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative"
      nativeButton={false}
      render={
        <Link
          href={routes.notifications}
          aria-label={
            count ? `Notifications, ${count} unread` : "Notifications"
          }
        />
      }
    >
      <BellIcon />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
