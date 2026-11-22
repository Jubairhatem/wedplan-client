import type { Metadata } from "next";
import { ServiceDetail } from "@/components/services/ServiceDetail";

export const metadata: Metadata = {
  title: "Service Details",
  description:
    "Explore full details, pricing, gallery and vendor information for this wedding service on WedPlan.",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceDetail serviceId={id} />;
}
