import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the ServiceCard layout so loading feels instant and layout-stable
 */
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/70 bg-card flex flex-col h-full">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      aria-label="Loading services"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}
