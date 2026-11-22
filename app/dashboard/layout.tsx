"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Crown,
  Heart,
  LayoutDashboard,
  Menu,
  PlusCircle,
  ShieldCheck,
  Store,
  User,
  Users,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const DASHBOARD_ROLES = ["customer", "vendor", "admin"] as const;
type DashboardRole = (typeof DASHBOARD_ROLES)[number];

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: Record<DashboardRole, NavItem[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarDays,
    },
    { label: "Profile Settings", href: "/dashboard/profile", icon: User },
  ],
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "My Services", href: "/dashboard/vendor/services", icon: Store },
    {
      label: "Add Service",
      href: "/dashboard/vendor/add-service",
      icon: PlusCircle,
    },
    {
      label: "Booking Requests",
      href: "/dashboard/vendor/bookings",
      icon: ClipboardList,
    },
    { label: "Profile Settings", href: "/dashboard/profile", icon: User },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Manage Services", href: "/dashboard/admin/services", icon: Store },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: ClipboardList,
    },
    { label: "Profile Settings", href: "/dashboard/profile", icon: User },
  ],
};

const ROLE_BADGE: Record<DashboardRole, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  customer: { label: "Customer", icon: Heart },
  vendor: { label: "Vendor", icon: Store },
  admin: { label: "Admin", icon: ShieldCheck },
};

function getInitials(name?: string) {
  if (!name) return "WP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function isActiveRoute(pathname: string, href: string) {
  if (pathname === href) return true;
  // Overview links should only match exactly; sub-routes match by prefix
  if (href.split("/").length <= 3) return false;
  return pathname.startsWith(`${href}/`);
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Defer session-based rendering until mounted so the initial client render
  // matches the server-rendered HTML (avoids React hydration mismatch).
  const effectiveSession = isMounted ? session : undefined;
  const effectiveIsPending = isMounted ? isPending : true;

  const user = effectiveSession?.user as
    | {
        name?: string;
        email?: string;
        image?: string | null;
        role?: string;
        businessName?: string;
        subscriptionPlan?: string;
      }
    | undefined;

  const role: DashboardRole = DASHBOARD_ROLES.includes(
    (user?.role || "customer") as DashboardRole
  )
    ? ((user?.role || "customer") as DashboardRole)
    : "customer";

  // Client-side role guard (the server is still the source of truth)
  useEffect(() => {
    if (effectiveIsPending) return;

    if (!effectiveSession?.user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const requestedRole = pathname.split("/")[2];
    if (
      requestedRole &&
      DASHBOARD_ROLES.includes(requestedRole as DashboardRole) &&
      requestedRole !== role
    ) {
      toast.error("You don't have access to that dashboard.");
      router.replace(`/dashboard/${role}`);
    }
  }, [isPending, session, pathname, role, router, effectiveSession, effectiveIsPending]);

  if (effectiveIsPending || !effectiveSession?.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" text="Preparing your dashboard..." />
      </div>
    );
  }

  const items = NAV_ITEMS[role];
  const roleBadge = ROLE_BADGE[role];
  const RoleIcon = roleBadge.icon;

  const userCard = (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {getInitials(user?.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{user?.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge
            variant="secondary"
            className="h-5 gap-1 px-1.5 text-[10px] uppercase"
          >
            <RoleIcon className="w-2.5 h-2.5" />
            {roleBadge.label}
          </Badge>
          {role === "vendor" && user?.subscriptionPlan === "premium" && (
            <Badge className="h-5 gap-1 bg-amber-500 text-white px-1.5 text-[10px]">
              <Crown className="w-2.5 h-2.5" />
              Premium
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-4 self-start sticky top-24">
            {userCard}
            <div className="rounded-xl border border-border/70 bg-card p-2">
              <SidebarNav items={items} pathname={pathname} />
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to WedPlan
            </Link>
          </aside>

          {/* Mobile + content */}
          <div className="flex-1 min-w-0">
            <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {roleBadge.label} Dashboard
                </p>
                <p className="font-heading text-lg font-bold truncate">
                  {user?.name}
                </p>
              </div>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="icon" aria-label="Open dashboard menu">
                      <Menu className="w-5 h-5" />
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-72">
                  <SheetHeader className="text-left pb-4 border-b">
                    <SheetTitle className="font-heading">Dashboard</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    {userCard}
                    <SidebarNav
                      items={items}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                    />
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to WedPlan
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
