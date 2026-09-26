"use client";

import {
  DatabaseIcon,
  LogOutIcon,
  ShieldIcon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { RolePill } from "@/components/shared/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

const LINKS = [
  { href: routes.account.profile, label: "Profile", icon: UserIcon },
  { href: routes.account.security, label: "Security", icon: ShieldIcon },
  { href: routes.account.sessions, label: "Devices", icon: SmartphoneIcon },
  { href: routes.account.data, label: "Your data", icon: DatabaseIcon },
] as const;

export function UserMenu() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label="Account menu"
          />
        }
      >
        <Avatar className="size-7">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="text-[11px]">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1.5 px-2 py-2 text-foreground">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
          <RolePill role={user.role} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {LINKS.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            <link.icon />
            {link.label}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
