"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Store, Clock, RefreshCw } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminService {
  _id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editTarget, setEditTarget] = useState<AdminService | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const CATEGORIES = [
    "Photography & Videography",
    "Wedding Venues",
    "Decoration & Florist",
    "Catering Services",
    "Makeup & Styling",
    "Wedding Fashion",
  ];

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("page", "1");
      params.set("limit", "20");

      const res = await fetchAPI<{ data: AdminService[]; pagination: typeof pagination }>(
        `/admin/services?${params.toString()}`,
        { withAuth: true }
      );
      setServices(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load services"
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <Badge variant="outline" className={cn("text-xs capitalize", styles[status])}>
        {status}
      </Badge>
    );
  };

  const updateStatus = async (service: AdminService, newStatus: string, newIsActive?: boolean) => {
    setIsUpdating(service._id);
    try {
      await fetchAPI(`/admin/services/${service._id}/status`, {
        method: "PATCH",
        withAuth: true,
        body: JSON.stringify({ status: newStatus, isActive: newIsActive }),
      });
      toast.success(`Service ${newStatus} successfully`);
      setEditTarget(null);
      await loadServices();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update service"
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteService = async (service: AdminService) => {
    if (!window.confirm(`Delete "${service.serviceName}"? This cannot be undone.`)) return;
    setIsUpdating(service._id);
    try {
      await fetchAPI(`/admin/services/${service._id}`, {
        method: "DELETE",
        withAuth: true,
      });
      toast.success("Service deleted successfully");
      await loadServices();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Manage Services" description="Search, filter, approve, reject, or delete service listings." />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div>
        <PageHeader title="Manage Services" description="Search, filter, approve, reject, or delete service listings." />
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load services right now.
          </p>
          <Button onClick={loadServices} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const visibleServices = services;

  return (
    <div>
      <PageHeader
        title="Manage Services"
        description="Search, filter, approve, reject, or delete service listings."
        action={
          <Button variant="outline" className="gap-2">
            <Store className="w-4 h-4" />
            {visibleServices.length} services
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/70 bg-card p-6 mb-6">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description or location..."
              aria-label="Search services"
              className="pl-9 h-10"
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(String(value))}
            >
              <SelectTrigger className="w-full h-10" aria-label="Filter by status">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(String(value))}
            >
              <SelectTrigger className="w-full h-10" aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }} className="w-full">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {visibleServices.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No services found"
          description="Try adjusting your search or filters."
          actionLabel="Reset filters"
          onAction={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}
        />
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Location</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleServices.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-muted shrink-0 overflow-hidden">
                        {service.images?.[0] && (
                          <img src={service.images[0]} alt={service.serviceName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-foreground">{service.serviceName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          By vendor {service.vendorId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {service.category}
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium">
                    ${Number(service.price).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                    {service.location}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {statusBadge(service.status)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {service.isActive ? (
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newStatus = service.status === "approved" ? "rejected" : "approved";
                          const newActive = newStatus === "approved";
                          updateStatus(service, newStatus, newActive);
                        }}
                        disabled={isUpdating === service._id}
                        className="text-xs p-1.5"
                        aria-label={service.status === "approved" ? "Reject service" : "Approve service"}
                      >
                        {isUpdating === service._id ? (
                          <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : service.status === "approved" ? (
                          <span className="text-destructive">Reject</span>
                        ) : (
                          <span className="text-primary">Approve</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newActive = !service.isActive;
                          updateStatus(service, service.status, newActive);
                        }}
                        disabled={isUpdating === service._id}
                        className="text-xs p-1.5"
                        aria-label={service.isActive ? "Deactivate service" : "Activate service"}
                      >
                        {service.isActive ? (
                          <span className="text-muted-foreground">Deactivate</span>
                        ) : (
                          <span className="text-primary">Activate</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteService(service)}
                        disabled={isUpdating === service._id}
                        className="text-xs p-1.5 text-destructive"
                        aria-label={`Delete ${service.serviceName}`}
                      >
                        <span className="text-destructive">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}
    </div>
  );
}
