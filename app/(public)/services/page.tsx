import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseServices } from "@/components/services/BrowseServices";
import { Loader } from "@/components/ui/Loader";

export const metadata: Metadata = {
  title: "Browse Wedding Services",
  description:
    "Discover and compare wedding venues, photographers, florists, caterers, makeup artists and bridal fashion vendors on WedPlan.",
};

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader size="lg" text="Loading wedding services..." />
        </div>
      }
    >
      <BrowseServices />
    </Suspense>
  );
}
