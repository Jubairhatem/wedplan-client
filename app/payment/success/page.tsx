"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Crown,
  Store,
} from "lucide-react";
import { fetchAPI, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface PaymentSession {
  sessionId: string;
  status: string;
  plan: string;
  amount: number;
  currency: string;
  isPremium: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const res = await fetchAPI<PaymentSession>(
        `/payments/session/${sessionId}`,
        { withAuth: true }
      );
      setSession(res.data ?? null);
      return res.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setHasFailed(true);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      setHasFailed(true);
      return;
    }

    let cancelled = false;

    async function poll() {
      setIsPolling(true);
      try {
        const data = await fetchSession();
        if (cancelled) return;
        if (data?.status === "paid") {
          setIsLoading(false);
          setIsPolling(false);
          toast.success("Your Premium subscription is now active.");
          return;
        }
        if (data?.status === "failed" || data?.status === "expired") {
          setIsLoading(false);
          setIsPolling(false);
          setHasFailed(true);
          toast.error(
            `Payment ${data.status}. Please try again or contact support.`
          );
          return;
        }
        // Still pending — keep polling
        setTimeout(poll, 3000);
      } catch (error) {
        if (cancelled) return;
        setIsLoading(false);
        setIsPolling(false);
        setHasFailed(true);
        toast.error(
          error instanceof Error ? error.message : "Failed to verify payment"
        );
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (isLoading || isPolling) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <h2 className="font-heading text-xl font-bold text-foreground">
          Verifying your payment…
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This may take a few moments. Please do not close this page.
        </p>
      </div>
    );
  }

  if (hasFailed || !session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <RefreshCw className="w-7 h-7" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Payment verification failed
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
          We were unable to verify your payment. This can happen if the
          session expired or the webhook has not yet processed.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push("/dashboard/vendor/subscription")}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/vendor">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground">
        Premium activated
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
        Thank you for upgrading to WedPlan Premium. Your subscription is now
        active.
      </p>
      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-foreground">Premium Plan</span>
        </div>
        <dl className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Session</span>
            <span className="font-medium text-foreground truncate max-w-xs">
              {session.sessionId}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-medium text-foreground">
              ${(session.amount / 100).toFixed(2)} {session.currency.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-medium text-emerald-600">{session.status}</span>
          </div>
          {session.expiresAt && (
            <div className="flex justify-between">
              <span>Expires</span>
              <span className="font-medium text-foreground">
                {new Date(session.expiresAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </dl>
      </div>
      <div className="mt-6">
        <Button asChild className="gap-2">
          <Link href="/dashboard/vendor">
            <Store className="w-4 h-4" />
            Go to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
