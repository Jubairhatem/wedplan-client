"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Loader2,
  Pencil,
  PlusCircle,
  RefreshCw,
  Store,
  Trash2,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceDetailsDialog } from "@/components/vendor/ServiceDetailsDialog";
import { ServiceEditDialog } from "@/components/vendor/ServiceEditDialog";
import type { VendorService } from "@/components/vendor/types";
import { cn } from "@/lib/utils";

export default function VendorServicesPage() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [detailsService, setDetailsService] = useState<VendorService | null>(
    null
  );
  const [editingService, setEditingService] = useState<VendorService | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<VendorService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const res = await fetchAPI<VendorService[]>("/vendor/services", {
        withAuth: true,
      });
      setServices(res.data ?? []);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load your services"
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
        const res = await fetchAPI<VendorService[]>("/vendor/services", {
          withAuth: true,
        });
        if (!cancelled) setServices(res.data ?? []);
      } catch (error) {
        if (!cancelled) {
          setHasFailed(true);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load your services"
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

  const toggleAvailability = async (service: VendorService) => {
    setBusyId(service._id);
    try {
      await fetchAPI(`/vendor/services/${service._id}`, {
        method: "PATCH",
        withAuth: true,
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      toast.success(
        service.isActive
          ? "Service marked as inactive"
          : "Service is now available for bookings"
      );
      await loadServices();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update availability"
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetchAPI(`/vendor/services/${deleteTarget._id}`, {
        method: "DELETE",
        withAuth: true,
      });
      toast.success("Service deleted successfully");
      setDeleteTarget(null);
      await loadServices();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete the service"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Services"
        description="Manage your wedding service listings, availability and visibility."
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
        <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : hasFailed ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your services right now.
          </p>
          <Button onClick={loadServices} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No services yet"
          description="Create your first wedding service listing. New listings are reviewed by an admin before appearing publicly."
          actionLabel="Add your first service"
          actionHref="/dashboard/vendor/add-service"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-border/70 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="h-11 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                          {service.images?.[0] && (
                            <img
                              src={service.images[0]}
                              alt={service.serviceName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[220px]">
                            {service.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      ${Number(service.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <span className="text-sm text-muted-foreground truncate block">
                        {service.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.status} />
                    </TableCell>
                    <TableCell>
                      <AvailabilityToggle
                        active={service.isActive}
                        busy={busyId === service._id}
                        onToggle={() => toggleAvailability(service)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${service.serviceName}`}
                          onClick={() => setDetailsService(service)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${service.serviceName}`}
                          onClick={() => setEditingService(service)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${service.serviceName}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(service)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {services.map((service) => (
              <div
                key={service._id}
                className="rounded-2xl border border-border/70 bg-card p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="h-16 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {service.images?.[0] && (
                      <img
                        src={service.images[0]}
                        alt={service.serviceName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight line-clamp-2">
                      {service.serviceName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {service.category}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ${Number(service.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={service.status} />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{service.isActive ? "Available" : "Inactive"}</span>
                    <AvailabilityToggle
                      active={service.isActive}
                      busy={busyId === service._id}
                      onToggle={() => toggleAvailability(service)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setDetailsService(service)}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setEditingService(service)}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive"
                    onClick={() => setDeleteTarget(service)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ServiceDetailsDialog
        service={detailsService}
        open={!!detailsService}
        onOpenChange={(open) => !open && setDetailsService(null)}
      />

      <ServiceEditDialog
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        onSaved={loadServices}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this service?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.serviceName}&rdquo; will be permanently
              removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AvailabilityToggle({
  active,
  busy,
  onToggle,
}: {
  active: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Deactivate service" : "Activate service"}
      disabled={busy}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 cursor-pointer",
        active ? "bg-emerald-500" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          active ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
