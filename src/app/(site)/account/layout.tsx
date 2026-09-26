import { AccountNav } from "@/components/layout/account-nav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="page-shell space-y-6 py-8">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="h-section">Your account</h1>
        <p className="text-sm text-muted-foreground">
          Profile, security and the data CityCare holds about you.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
        <AccountNav />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
