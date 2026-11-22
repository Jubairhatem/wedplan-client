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
  RefreshCw,
  Store,
  Users,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminOverview {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
  totalBookings: number;
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<AdminOverview>("/admin/overview", {
        withAuth: true,
      });
      setOverview(res.data ?? null);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load admin overview"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setHasFailed(false);
      try {
        const res = await fetchAPI<AdminOverview>("/admin/overview", {
          withAuth: true,
        });
        if (!cancelled) setOverview(res.data ?? null);
      } catch (error) {
        if (!cancelled) {
          setHasFailed(true);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load admin overview"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Admin Overview" description="Platform-wide statistics and moderation summary." />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (hasFailed || !overview) {
    return (
      <div>
        <PageHeader title="Admin Overview" description="Platform-wide statistics and moderation summary." />
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load the admin overview right now.
          </p>
          <Button onClick={loadOverview} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        description="Platform-wide statistics and moderation summary."
        action={
          <Button asChild className="gap-2">
            <Link href="/dashboard/admin/users">
              <Users className="w-4 h-4" />
              Manage Users
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={overview.totalUsers}
          icon={Users}
          hint="All registered accounts"
          tone="primary"
        />
        <StatCard
          label="Vendors"
          value={overview.totalVendors}
          icon={Store}
          hint="Service providers"
          tone="primary"
        />
        <StatCard
          label="Customers"
          value={overview.totalCustomers}
          icon={CalendarDays}
          hint="Booking customers"
          tone="primary"
        />
        <StatCard
          label="Total Services"
          value={overview.totalServices}
          icon={ClipboardList}
          hint="All service listings"
          tone="primary"
        />
        <StatCard
          label="Pending Services"
          value={overview.pendingServices}
          icon={Clock}
          hint="Awaiting admin approval"
          tone="warning"
        />
        <StatCard
          label="Total Transactions"
          value={overview.totalTransactions}
          icon={Crown}
          hint="Stripe payment records"
          tone="success"
        />
        <StatCard
          label="Total Bookings"
          value={overview.totalBookings}
          icon={CheckCircle2}
          hint="All booking requests"
          tone="primary"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h3 className="font-heading text-lg font-bold mb-4">Quick actions</h3>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/dashboard/admin/users">
                <Users className="w-4 h-4" />
                Manage users
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/dashboard/admin/services">
                <ClipboardList className="w-4 h-4" />
                Moderate services
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/dashboard/admin/transactions">
                <Crown className="w-4 h-4" />
                View transactions
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h3 className="font-heading text-lg font-bold mb-4">At a glance</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {overview.pendingServices > 0
              ? `You have ${overview.pendingServices} service(s) pending approval.`
              : "No services pending approval."
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {overview.totalVendors > 0
              ? `${overview.totalVendors} vendor(s) are registered on the platform.`
              : "No vendors registered yet."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
