"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  const router = useRouter();

  const retryCheckout = () => {
    toast.info("Redirecting to subscription page to start a new checkout.");
    router.push("/dashboard/vendor/subscription");
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
        <RefreshCw className="w-7 h-7" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground">
        Payment cancelled
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
        Your Premium checkout was cancelled. No charges were made. You can
        try upgrading again anytime.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button onClick={retryCheckout} className="gap-2">
          <ArrowRight className="w-4 h-4" />
          Try again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/vendor">
            <Store className="w-4 h-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
