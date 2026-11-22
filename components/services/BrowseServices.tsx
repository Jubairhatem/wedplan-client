"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { fetchAPI, type PaginationMeta } from "@/lib/api";
import { ServiceCard, type ServiceItem } from "@/components/services/ServiceCard";
import { ServiceGridSkeleton } from "@/components/services/ServiceCardSkeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

const PAGE_SIZE = 9;
const DEBOUNCE_MS = 450;

/**
 * Browse services page content.
 * Filter state is fully driven by URL query params so links stay shareable
 * and survive a page reload.
 */
export function BrowseServices() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const location = searchParams.get("location") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the text inputs aligned with the URL (e.g. when filters are reset)
  useEffect(() => {
    (async () => {
      setSearchInput(search);
    })();
  }, [search]);

  useEffect(() => {
    (async () => {
      setLocationInput(location);
    })();
  }, [location]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (resetPage) params.delete("page");

      const query = params.toString();
      router.replace(query ? `/services?${query}` : "/services", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Debounced search by name
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchInput.trim() || null });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // Debounced location filter
  useEffect(() => {
    if (locationInput === location) return;
    const timer = setTimeout(() => {
      updateParams({ location: locationInput.trim() || null });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [locationInput, location, updateParams]);

  // Fetch services whenever the resolved URL state changes
  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      setIsLoading(true);
      setHasFailed(false);

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        if (sort && sort !== "newest") params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        const res = await fetchAPI<ServiceItem[]>(
          `/services?${params.toString()}`
        );

        if (cancelled) return;
        setServices(res.data ?? []);
        setPagination(res.pagination ?? null);
      } catch (error) {
        if (cancelled) return;
        setServices([]);
        setPagination(null);
        setHasFailed(true);
        toast.error(
          error instanceof Error ? error.message : "Failed to load services"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [search, category, location, sort, page, reloadKey]);

  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    if (search) filters.push({ key: "search", label: "Search", value: search });
    if (category)
      filters.push({ key: "category", label: "Category", value: category });
    if (location)
      filters.push({ key: "location", label: "Location", value: location });
    return filters;
  }, [search, category, location]);

  const resetFilters = () => {
    setSearchInput("");
    setLocationInput("");
    router.replace("/services", { scroll: false });
  };

  const pageNumbers = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return [];
    const { page: current, totalPages } = pagination;
    const visible = new Set<number>([
      1,
      totalPages,
      current,
      current - 1,
      current + 1,
    ]);

    const sorted = [...visible]
      .filter((value) => value >= 1 && value <= totalPages)
      .sort((a, b) => a - b);

    const result: (number | "ellipsis")[] = [];
    sorted.forEach((value, index) => {
      if (index > 0 && value - sorted[index - 1] > 1) {
        result.push("ellipsis");
      }
      result.push(value);
    });
    return result;
  }, [pagination]);

  const totalResults = pagination?.total ?? services.length;

  return (
    <div className="bg-background min-h-screen">
      {/* Page heading */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Curated wedding vendors
          </span>
          <h1 className="mt-5 font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Find Your Perfect Wedding Vendors
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Browse hand-picked venues, photographers, florists, caterers and
            more — compare prices and book with confidence.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Filter bar */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by service name or keyword..."
                aria-label="Search services"
                className="pl-9 h-10"
              />
            </div>

            <div className="md:col-span-3">
              <Select
                value={category || "all"}
                onValueChange={(value) =>
                  updateParams({
                    category: value === "all" ? null : String(value),
                  })
                }
              >
                <SelectTrigger
                  className="w-full h-10"
                  aria-label="Filter by category"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Location"
                aria-label="Filter by location"
                className="pl-9 h-10"
              />
            </div>

            <div className="md:col-span-2">
              <Select
                value={sort}
                onValueChange={(value) =>
                  updateParams({
                    sort: value === "newest" ? null : String(value),
                  })
                }
              >
                <SelectTrigger
                  className="w-full h-10"
                  aria-label="Sort services"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary"
                >
                  <span className="font-semibold">{filter.label}:</span>
                  <span className="max-w-[180px] truncate">{filter.value}</span>
                  <button
                    type="button"
                    onClick={() => updateParams({ [filter.key]: null })}
                    className="rounded-full hover:bg-primary/10 p-0.5 cursor-pointer"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results meta */}
        <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Searching for services..."
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {totalResults}
                </span>{" "}
                {totalResults === 1 ? "service" : "services"}
              </>
            )}
          </p>

          {pagination && pagination.totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <ServiceGridSkeleton count={PAGE_SIZE} />
        ) : hasFailed ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load services right now. Please try again.
            </p>
            <Button
              onClick={() => setReloadKey((key) => key + 1)}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No services found"
            description="Try adjusting your search or filters to discover more wedding vendors."
            actionLabel="Reset filters"
            onAction={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !hasFailed && pageNumbers.length > 0 && pagination && (
          <div className="mt-12 flex items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1}
              onClick={() => updateParams({ page: String(pagination.page - 1) }, false)}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {pageNumbers.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === pagination.page ? "default" : "outline"}
                  size="icon"
                  onClick={() => updateParams({ page: String(item) }, false)}
                  aria-label={`Go to page ${item}`}
                  aria-current={item === pagination.page ? "page" : undefined}
                  className={cn(
                    "text-sm",
                    item === pagination.page &&
                      "bg-primary text-primary-foreground"
                  )}
                >
                  {item}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateParams({ page: String(pagination.page + 1) }, false)}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
