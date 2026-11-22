"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  Crown,
  Gift,
  Infinity,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { fetchAPI, ApiError } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isCurrent: boolean;
  onUpgrade: () => void;
  disabled?: boolean;
}

function PlanCard({
  name,
  price,
  description,
  features,
  isCurrent,
  onUpgrade,
  disabled = false,
}: PlanCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border p-6 sm:p-8 flex flex-col h-full",
      isCurrent
        ? "border-primary bg-primary/5"
        : "border-border/70 bg-card hover:border-primary/30 transition-colors"
    )}>
    <div className="flex items-start justify-between gap-2 mb-2">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
        {name}
      </h2>
      {isCurrent && (
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
          Current plan
        </span>
      )}
    </div>
    <p className="text-4xl font-bold text-foreground mb-2">{price}</p>
    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
      {description}
    </p>
    <ul className="space-y-2 mb-6 flex-1">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full" aria-hidden="true" />
          {feature}
        </li>
      ))}
    </ul>
    {isCurrent ? (
      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Your active subscription</span>
        <span className="font-medium text-foreground" />
      </div>
    ) : (
      <Button
        onClick={onUpgrade}
        className="w-full shadow-sm"
        disabled={disabled}
      >
        Upgrade to Premium
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    )}
    </div>
  );
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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
        error instanceof Error ? error.message : "Failed to load subscription"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetchAPI<{ sessionId: string; url: string }>(
        "/payments/create-checkout-session",
        {
          method: "POST",
          withAuth: true,
        }
      );
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      setIsUpgrading(false);
      if (error instanceof ApiError && error.status === 409) {
        toast.error("You already have an active Premium subscription.");
      } else if (error instanceof ApiError && error.status === 503) {
        toast.error(
          "Premium subscriptions are not configured yet. Please contact support."
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to start checkout"
        );
      }
    }
  };

  const isPremium = overview?.subscription.isPremium ?? false;
  const expiresAt = overview?.subscription.expiresAt;
  const expiryText = expiresAt
    ? `Active until ${new Date(expiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    : "Active (no expiry set)";

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Subscription" description="Manage your WedPlan plan." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (hasFailed || !overview) {
    return (
      <div>
        <PageHeader title="Subscription" description="Manage your WedPlan plan." />
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your subscription right now.
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
        title="Subscription"
        description="Choose the right plan for your wedding business."
        action={
          <Button
            asChild
            variant="outline"
            onClick={() => router.push("/dashboard/vendor")}
            className="gap-2"
          >
            <Store className="w-4 h-4" />
            Back to Overview
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/70 bg-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Your current plan
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPremium ? "Premium" : "Free"} plan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase",
              isPremium
                ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                : "bg-muted text-muted-foreground border-border"
            )}>
              {isPremium ? <Crown className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
              {isPremium ? "Premium" : "Free"}
            </span>
            {isPremium && expiresAt ? (
              <span className="text-sm text-muted-foreground">
                {expiryText}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PlanCard
          name="Free"
          price="$0"
          description="Ideal for getting started with your wedding business."
          features={[
            "Up to 3 active service listings",
            "Receive and manage booking requests",
            "Basic vendor profile",
          ]}
          isCurrent={!isPremium}
          onUpgrade={handleUpgrade}
          disabled={!isPremium}
        />
        <PlanCard
          name="Premium"
          price="$29/mo"
          description="Unlimited listings and premium visibility for growing vendors."
          features={[
            "Unlimited active service listings",
            "Premium badge on your services and profile",
            "Priority placement in search results",
          ]}
          isCurrent={isPremium}
          onUpgrade={handleUpgrade}
          disabled={isPremium}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Active Services"
          value={overview.activeServices}
          icon={Store}
          hint={isPremium ? "Unlimited" : "3 max on free plan"}
          tone="primary"
        />
        <StatCard
          label="Pending Bookings"
          value={overview.pendingBookings}
          icon={Calendar}
          hint="Awaiting your response"
          tone="warning"
        />
        <StatCard
          label="Accepted Bookings"
          value={overview.acceptedBookings}
          icon={ShieldCheck}
          hint="Confirmed events"
          tone="success"
        />
      </div>

      {!isPremium && (
        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-heading text-lg font-bold mb-4">Why upgrade?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <Infinity className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Unlimited service listings
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Premium vendor badge
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Priority search placement
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
