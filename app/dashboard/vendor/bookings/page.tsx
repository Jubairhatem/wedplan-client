"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

function getInitials(name?: string) {
  if (!name) return "WP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [busy, setBusy] = useState<{ id: string; action: string } | null>(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<BookingItem[]>("/vendor/bookings", {
        withAuth: true,
      });
      setBookings(res.data ?? []);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load booking requests"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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

  const decide = async (booking: BookingItem, action: "accept" | "reject") => {
    setBusy({ id: booking._id, action });
    try {
      await fetchAPI(`/vendor/bookings/${booking._id}/${action}`, {
        method: "PATCH",
        withAuth: true,
      });
      toast.success(
        action === "accept"
          ? "Booking accepted — the customer has been notified."
          : "Booking rejected."
      );
      await loadBookings();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update this booking"
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Booking Requests"
        description="Review event requests from customers and confirm availability."
        action={
          <Button
            variant="outline"
            onClick={loadBookings}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
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
            <Skeleton key={index} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : hasFailed ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your booking requests right now.
          </p>
          <Button onClick={loadBookings} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      ) : visibleBookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === "all" ? "No booking requests yet" : "Nothing here"}
          description={
            filter === "all"
              ? "Once customers request your services, their event details will appear here for you to accept or reject."
              : "There are no bookings with this status right now."
          }
          actionLabel={filter === "all" ? undefined : "Show all bookings"}
          onAction={filter === "all" ? undefined : () => setFilter("all")}
        />
      ) : (
        <div className="space-y-3">
          {visibleBookings.map((booking) => {
            const isPending = booking.status === "pending";
            const isAccepting = busy?.id === booking._id && busy.action === "accept";
            const isRejecting = busy?.id === booking._id && busy.action === "reject";
            const customerName = booking.customer?.name || "Customer";

            return (
              <div
                key={booking._id}
                className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0">
                      {booking.customer?.image ? (
                        <img
                          src={booking.customer.image}
                          alt={customerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold">
                          {getInitials(customerName)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight truncate">
                        {customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.service?.serviceName || "Service unavailable"}
                      </p>
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
                  {booking.customer?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <a
                        href={`mailto:${booking.customer.email}`}
                        className="truncate hover:text-primary transition-colors"
                      >
                        {booking.customer.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">
                      {booking.service?.category || "Wedding service"}
                    </span>
                  </div>
                </div>

                {booking.message && (
                  <div className="rounded-xl bg-muted/40 border border-border/60 p-3">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Customer message
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {booking.message}
                    </p>
                  </div>
                )}

                {isPending ? (
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1 border-t border-border/60">
                    <Button
                      variant="outline"
                      onClick={() => decide(booking, "reject")}
                      disabled={!!busy}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      {isRejecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => decide(booking, "accept")}
                      disabled={!!busy}
                      className="gap-2"
                    >
                      {isAccepting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Accept Booking
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
                    This request has been{" "}
                    <span className="font-medium">{booking.status}</span> and can
                    no longer be changed.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
