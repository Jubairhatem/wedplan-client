"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader } from "@/components/ui/Loader";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in?redirect=/dashboard");
      return;
    }

    const role = (session.user as { role?: string }).role || "customer";
    const destination = ["customer", "vendor", "admin"].includes(role)
      ? role
      : "customer";
    router.replace(`/dashboard/${destination}`);
  }, [session, isPending, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader size="lg" text="Redirecting to your dashboard..." />
    </div>
  );
}
