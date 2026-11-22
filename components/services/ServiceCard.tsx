"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowUpRight, Crown, Sparkles } from "lucide-react";

export interface ServiceItem {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendorId?: string;
  status?: string;
  isActive?: boolean;
  vendor?: {
    name?: string;
    businessName?: string;
    isPremium?: boolean;
  };
}

interface ServiceCardProps {
  service: ServiceItem;
  priority?: boolean;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const displayImage =
    service.images && service.images.length > 0
      ? service.images[0]
      : "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";

  const isVendorPremium = service.vendor?.isPremium;

  return (
    <div className="group rounded-2xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Preview Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={service.serviceName}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="backdrop-blur-md bg-background/85 text-foreground text-xs font-medium border border-border/40 shadow-sm"
          >
            {service.category}
          </Badge>
          {isVendorPremium && (
            <Badge className="bg-amber-500/90 text-white border-none flex items-center gap-1 shadow-sm">
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </Badge>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="backdrop-blur-md bg-foreground/80 text-background px-3 py-1 rounded-full text-xs font-semibold shadow">
            From ${Number(service.price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-heading text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {service.serviceName}
          </h3>

          {/* Short description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Footer with Vendor & Action */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
            By{" "}
            <span className="font-medium text-foreground">
              {service.vendor?.businessName ||
                service.vendor?.name ||
                "Verified Vendor"}
            </span>
          </div>

          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10 gap-1 p-0 h-auto font-medium text-xs"
          >
            <Link href={`/services/${service._id}`}>
              <span>View Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
