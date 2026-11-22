"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  ImageOff,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { fetchAPI, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ServiceDetailData {
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
  createdAt?: string;
  updatedAt?: string;
  vendor?: {
    id?: string;
    name?: string;
    businessName?: string;
    image?: string | null;
    email?: string;
    isPremium?: boolean;
  } | null;
}

interface ServiceDetailProps {
  serviceId: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";

function getInitials(name?: string) {
  if (!name) return "WP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const [service, setService] = useState<ServiceDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadService() {
      setIsLoading(true);
      setErrorStatus(null);

      try {
        const res = await fetchAPI<ServiceDetailData>(
          `/services/${serviceId}`
        );
        if (cancelled) return;
        setService(res.data ?? null);
        setActiveImage(0);
      } catch (error) {
        if (cancelled) return;
        const status = error instanceof ApiError ? error.status : 0;
        setErrorStatus(status === 404 || status === 400 ? status : 500);
        if (status !== 404 && status !== 400) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load this service"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadService();

    return () => {
      cancelled = true;
    };
  }, [serviceId, reloadKey]);

  const backLink = (
    <Link
      href="/services"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to all services
    </Link>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {backLink}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!service || errorStatus) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {backLink}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ImageOff className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold">
              Service not available
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              This wedding service may have been removed, unlisted or is
              awaiting approval. Browse our other beautiful vendors instead.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/services">Browse services</Link>
            </Button>
            {errorStatus === 500 && (
              <Button
                onClick={() => setReloadKey((key) => key + 1)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const images =
    service.images && service.images.length > 0
      ? service.images
      : [FALLBACK_IMAGE];
  const currentImage = images[Math.min(activeImage, images.length - 1)];
  const vendorName =
    service.vendor?.businessName || service.vendor?.name || "Verified Vendor";

  const showPreviousImage = () =>
    setActiveImage((index) => (index - 1 + images.length) % images.length);
  const showNextImage = () =>
    setActiveImage((index) => (index + 1) % images.length);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {backLink}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Gallery */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted group">
              <img
                src={currentImage}
                alt={service.serviceName}
                className="object-cover w-full h-full"
              />

              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-background/85 text-foreground border border-border/40 shadow-sm"
                >
                  {service.category}
                </Badge>
                {service.vendor?.isPremium && (
                  <Badge className="bg-amber-500/90 text-white border-none flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" />
                    Premium Vendor
                  </Badge>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 backdrop-blur flex items-center justify-center shadow hover:bg-background transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 backdrop-blur flex items-center justify-center shadow hover:bg-background transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-full bg-foreground/75 text-background px-2.5 py-0.5 text-xs font-medium">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                      index === activeImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${service.serviceName} preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary / booking sidebar */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Wedding Service
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-tight">
                  {service.serviceName}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{service.location}</span>
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="font-heading text-3xl font-bold text-primary">
                  ${Number(service.price).toLocaleString()}
                </p>
              </div>

              {/* Vendor card */}
              <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0">
                  {service.vendor?.image ? (
                    <img
                      src={service.vendor.image}
                      alt={vendorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {getInitials(vendorName)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Offered by
                  </p>
                  <p className="text-sm font-semibold truncate">{vendorName}</p>
                </div>
                {service.vendor?.isPremium && (
                  <Crown className="w-4 h-4 text-amber-500 ml-auto shrink-0" />
                )}
              </div>

              {/* CTA is added with the booking dialog (C-17) */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Verified &amp; moderated vendor
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Flexible event dates
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  Direct vendor communication
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-heading text-xl font-bold">About this service</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
              <h2 className="font-heading text-lg font-semibold">
                Service details
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-right">{service.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium text-right">{service.location}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Starting price</dt>
                  <dd className="font-medium text-right">
                    ${Number(service.price).toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Vendor</dt>
                  <dd className="font-medium text-right">{vendorName}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
