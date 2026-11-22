"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  PlusCircle,
  RefreshCw,
  Store,
  ThumbsUp,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface VendorOverview {
  totalServices: number;
  activeServices: number;
  pendingServices: number;
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  subscription: {
    plan: string;
    isPremium: boolean;
    expiresAt: string | null;
  };
}

export default function VendorOverviewPage() {
  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<VendorOverview>("/vendor/overview", {
        withAuth: true,
      });
      setOverview(res.data ?? null);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load your overview"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <div>
      <PageHeader
        title="Vendor Overview"
        description="Track your services, bookings and subscription at a glance."
        action={
          <Button asChild className="gap-2">
            <Link href="/dashboard/vendor/add-service">
              <PlusCircle className="w-4 h-4" />
              Add Service
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : hasFailed || !overview ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your overview right now.
          </p>
          <Button onClick={loadOverview} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              label="Total Services"
              value={overview.totalServices}
              icon={Store}
              hint="All services you have listed"
            />
            <StatCard
              label="Active Services"
              value={overview.activeServices}
              icon={CheckCircle2}
              tone="success"
              hint="Visible to customers"
            />
            <StatCard
              label="Pending Services"
              value={overview.pendingServices}
              icon={Clock}
              tone="warning"
              hint="Awaiting admin approval"
            />
            <StatCard
              label="Total Bookings"
              value={overview.totalBookings}
              icon={CalendarDays}
              hint="All booking requests received"
            />
            <StatCard
              label="Pending Bookings"
              value={overview.pendingBookings}
              icon={ClipboardList}
              tone="warning"
              hint="Awaiting your response"
            />
            <StatCard
              label="Accepted Bookings"
              value={overview.acceptedBookings}
              icon={ThumbsUp}
              tone="success"
              hint="Confirmed events"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Subscription */}
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subscription
                  </p>
                  <p className="mt-1 font-heading text-2xl font-bold capitalize">
                    {overview.subscription.isPremium ? "Premium" : "Free"} Plan
                  </p>
                </div>
                <div
                  className={
                    overview.subscription.isPremium
                      ? "h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"
                      : "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                  }
                >
                  {overview.subscription.isPremium ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <Store className="w-5 h-5" />
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {overview.subscription.isPremium
                  ? overview.subscription.expiresAt
                    ? `Your premium plan is active until ${new Date(
                        overview.subscription.expiresAt
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}.`
                    : "Your premium plan is active with unlimited service listings."
                  : "The free plan allows up to 3 active services. Upgrade for unlimited listings and a premium badge."}
              </p>

              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link href="/dashboard/vendor/subscription">
                  {overview.subscription.isPremium ? (
                    "Manage Subscription"
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Upgrade to Premium
                    </>
                  )}
                </Link>
              </Button>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick actions
              </p>
              <div className="mt-3 grid gap-2">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/vendor/services">
                    <Store className="w-4 h-4" />
                    Manage my services
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/vendor/bookings">
                    <ClipboardList className="w-4 h-4" />
                    Review booking requests
                    {overview.pendingBookings > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {overview.pendingBookings}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/vendor/add-service">
                    <PlusCircle className="w-4 h-4" />
                    Add a new service
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
