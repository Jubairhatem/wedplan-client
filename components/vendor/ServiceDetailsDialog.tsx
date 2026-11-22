"use client";

import { MapPin, CalendarDays, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { VendorService } from "@/components/vendor/types";

interface ServiceDetailsDialogProps {
  service: VendorService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailsDialog({
  service,
  open,
  onOpenChange,
}: ServiceDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {service && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">
                {service.serviceName}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={service.status} />
                <Badge
                  variant="outline"
                  className={
                    service.isActive
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            {service.images?.[0] && (
              <img
                src={service.images[0]}
                alt={service.serviceName}
                className="w-full aspect-[16/9] object-cover rounded-lg border border-border/60"
              />
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Category
                </p>
                <p className="mt-1 font-medium">{service.category}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Starting price</p>
                <p className="mt-1 font-medium">
                  ${Number(service.price).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 col-span-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </p>
                <p className="mt-1 font-medium">{service.location}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {service.createdAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 border-t pt-3">
                <CalendarDays className="w-3.5 h-3.5" />
                Listed on{" "}
                {new Date(service.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
