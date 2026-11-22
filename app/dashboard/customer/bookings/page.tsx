"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  Store,
  XCircle,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BOOKING_STATUSES,
  formatEventDate,
  type BookingItem,
} from "@/components/bookings/types";

type FilterValue = "all" | (typeof BOOKING_STATUSES)[number];

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<BookingItem[]>("/bookings/my", {
        withAuth: true,
      });
      setBookings(res.data ?? []);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load your bookings"
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
        const res = await fetchAPI<BookingItem[]>("/bookings/my", {
          withAuth: true,
        });
        if (!cancelled) setBookings(res.data ?? []);
      } catch (error) {
        if (!cancelled) {
          setHasFailed(true);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load your bookings"
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

  const counts = useMemo(() => {
    return BOOKING_STATUSES.reduce<Record<string, number>>(
      (accumulator, status) => {
        accumulator[status] = bookings.filter(
          (booking) => booking.status === status
        ).length;
        return accumulator;
      },
      {}
    );
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await fetchAPI(`/bookings/${cancelTarget._id}/cancel`, {
        method: "PATCH",
        withAuth: true,
      });
      toast.success("Booking request cancelled");
      setCancelTarget(null);
      await loadBookings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel the booking"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Bookings"
        description="Every wedding service request you have sent, in one place."
        action={
          <Button asChild className="gap-2">
            <Link href="/services">
              <Search className="w-4 h-4" />
              Browse Services
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.value;
          const count =
            item.value === "all" ? bookings.length : counts[item.value] || 0;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : hasFailed ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your bookings right now.
          </p>
          <Button onClick={loadBookings} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      ) : visibleBookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === "all" ? "No bookings yet" : "Nothing here"}
          description={
            filter === "all"
              ? "Browse wedding services and send your first booking request — vendors usually reply within a couple of days."
              : "You have no bookings with this status right now."
          }
          actionLabel={filter === "all" ? "Browse services" : "Show all bookings"}
          actionHref={filter === "all" ? "/services" : undefined}
          onAction={filter === "all" ? undefined : () => setFilter("all")}
        />
      ) : (
        <div className="space-y-3">
          {visibleBookings.map((booking) => {
            const serviceName =
              booking.service?.serviceName || "Service no longer available";
            const vendorName =
              booking.vendor?.businessName ||
              booking.vendor?.name ||
              "Wedding vendor";
            const thumbnail = booking.service?.images?.[0];

            return (
              <div
                key={booking._id}
                className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-14 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={serviceName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Store className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight truncate">
                        {serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {vendorName}
                        {booking.service?.category
                          ? ` · ${booking.service.category}`
                          : ""}
                      </p>
                      {booking.service?.price ? (
                        <p className="text-sm font-semibold mt-1">
                          ${Number(booking.service.price).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <span>{formatEventDate(booking.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{booking.eventLocation}</span>
                  </div>
                </div>

                {booking.message && (
                  <div className="rounded-xl bg-muted/40 border border-border/60 p-3">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Your message
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {booking.message}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                  {booking.service?._id ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                    >
                      <Link href={`/services/${booking.service._id}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        View service
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}

                  {booking.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => setCancelTarget(booking)}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel request
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking request?</DialogTitle>
            <DialogDescription>
              Your request for &ldquo;
              {cancelTarget?.service?.serviceName || "this service"}&rdquo; on{" "}
              {formatEventDate(cancelTarget?.eventDate)} will be withdrawn. You
              can always send a new request later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={isCancelling}
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={isCancelling}
              className="gap-2"
            >
              {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
