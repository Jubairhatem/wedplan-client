"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Heart,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerOverview {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export default function CustomerOverviewPage() {
  const { data: session } = useSession();
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<CustomerOverview>("/customer/overview", {
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

  const firstName = (session?.user?.name || "there").split(" ")[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Track your wedding service requests and plan your big day."
        action={
          <Button asChild className="gap-2">
            <Link href="/services">
              <Search className="w-4 h-4" />
              Browse Services
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
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
              label="Total Bookings"
              value={overview.total}
              icon={CalendarDays}
              hint="All requests you have sent"
            />
            <StatCard
              label="Pending"
              value={overview.pending}
              icon={Clock}
              tone="warning"
              hint="Awaiting vendor response"
            />
            <StatCard
              label="Accepted"
              value={overview.accepted}
              icon={CheckCircle2}
              tone="success"
              hint="Confirmed by the vendor"
            />
            <StatCard
              label="Rejected"
              value={overview.rejected}
              icon={XCircle}
              tone="danger"
              hint="Not available for your date"
            />
            <StatCard
              label="Cancelled"
              value={overview.cancelled}
              icon={CalendarCheck}
              tone="default"
              hint="Cancelled by you"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your planning journey
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {overview.total === 0
                  ? "You haven't requested any services yet. Explore venues, photographers, decorators and more to start planning."
                  : overview.accepted > 0
                  ? `Great news — ${overview.accepted} vendor${
                      overview.accepted > 1 ? "s have" : " has"
                    } confirmed your booking. Keep going to complete your wedding team.`
                  : "Your requests are on their way. Vendors usually respond within a couple of days."}
              </p>
              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link href="/dashboard/customer/bookings">
                  <ClipboardList className="w-4 h-4" />
                  View my bookings
                  {overview.pending > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {overview.pending}
                    </span>
                  )}
                </Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick actions
              </p>
              <div className="mt-3 grid gap-2">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/services">
                    <Search className="w-4 h-4" />
                    Find new wedding services
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/customer/bookings">
                    <CalendarDays className="w-4 h-4" />
                    Manage my booking requests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link href="/dashboard/profile">
                    <Heart className="w-4 h-4" />
                    Update my profile
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
