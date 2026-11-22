"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Crown, Clock } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminTransaction {
  id: string;
  vendorId: string;
  vendorName: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "20");

      const res = await fetchAPI<{ data: AdminTransaction[]; pagination: typeof pagination }>(
        `/admin/transactions?${params.toString()}`,
        { withAuth: true }
      );
      setTransactions(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load transactions"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const statusBadge = (status: string) => {
    return (
      <Badge variant="outline" className={cn("text-xs capitalize", STATUS_STYLES[status])}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Transactions" description="Read-only payment records for all platform vendors." />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div>
        <PageHeader title="Transactions" description="Read-only payment records for all platform vendors." />
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load transactions right now.
          </p>
          <Button onClick={loadTransactions} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Read-only payment records for all platform vendors."
        action={
          <Button variant="outline" className="gap-2">
            <Crown className="w-4 h-4" />
            {transactions.length} records
          </Button>
        }
      />

      {transactions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No transactions yet"
          description="Payment records will appear here once vendors upgrade to Premium."
        />
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-center">Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Session ID</TableHead>
                <TableHead className="text-center">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="min-w-[180px]">
                    <div className="min-w-0">
                      <p className="font-medium truncate text-foreground">
                        {tx.vendorName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.vendorId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    <span className="capitalize">{tx.plan}</span>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ${(tx.amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {statusBadge(tx.status)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground truncate max-w-xs">
                    {tx.stripeSessionId}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
