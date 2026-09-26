"use client";

import { cn } from "cn";
import {
  DatabaseIcon,
  ShieldIcon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/routes";

const ITEMS = [
  {
    href: routes.account.profile,
    label: "Profile",
    icon: UserIcon,
    hint: "Name, phone and ward",
  },
  {
    href: routes.account.security,
    label: "Security",
    icon: ShieldIcon,
    hint: "Password and two-factor",
  },
  {
    href: routes.account.sessions,
    label: "Devices",
    icon: SmartphoneIcon,
    hint: "Where you are signed in",
  },
  {
    href: routes.account.data,
    label: "Your data",
    icon: DatabaseIcon,
    hint: "Export or delete",
  },
] as const;

/** Vertical on a wide screen, a scrolling strip on a phone. */
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-start gap-2.5 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 lg:shrink",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <item.icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="space-y-0.5">
              <span className="block whitespace-nowrap">{item.label}</span>
              <span className="hidden text-xs text-muted-foreground lg:block">
                {item.hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
