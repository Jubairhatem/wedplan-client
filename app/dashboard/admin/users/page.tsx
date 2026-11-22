"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, User, Users, ShieldCheck, RefreshCw, Crown } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBlocked: boolean;
  businessName: string | null;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  createdAt: string | null;
}

const ROLE_FILTERS = [
  { value: "all", label: "All Roles" },
  { value: "customer", label: "Customers" },
  { value: "vendor", label: "Vendors" },
  { value: "admin", label: "Admins" },
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockTarget, setBlockTarget] = useState<{ id: string; name: string; block: boolean } | null>(null);
  const [isBlocking, setIsBlocking] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setHasFailed(false);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      params.set("page", "1");
      params.set("limit", "20");

      const res = await fetchAPI<AdminUser[]>(
        `/admin/users?${params.toString()}`,
        { withAuth: true }
      );
      setUsers(res.data ?? []);
      setPagination((res as any).pagination ?? null);
    } catch (error) {
      setHasFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Failed to load users"
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const confirmBlock = (user: AdminUser, block: boolean) => {
    setBlockTarget({ id: user.id, name: user.name, block });
  };

  const executeBlock = async () => {
    if (!blockTarget) return;
    setIsBlocking(blockTarget.id);
    try {
      const action = blockTarget.block ? "block" : "unblock";
      await fetchAPI(`/admin/users/${blockTarget.id}/${action}`, {
        method: "PATCH",
        withAuth: true,
      });
      toast.success(
        `User ${blockTarget.block ? "blocked" : "unblocked"} successfully`
      );
      setBlockTarget(null);
      await loadUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user status"
      );
    } finally {
      setIsBlocking(null);
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-primary/10 text-primary border-primary/20",
      vendor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      customer: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    };
    return (
      <Badge variant="outline" className={cn("text-xs capitalize", styles[role])}>
        {role}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Manage Users" description="Search, filter, and block or unblock platform users." />
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
        <PageHeader title="Manage Users" description="Search, filter, and block or unblock platform users." />
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load users right now.
          </p>
          <Button onClick={loadUsers} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users;

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="Search, filter, and block or unblock platform users."
        action={
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            {filteredUsers.length} users
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/70 bg-card p-6 mb-6">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search users"
              className="pl-9 h-10"
            />
          </div>
          <div className="md:col-span-3">
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(String(value))}
            >
              <SelectTrigger className="w-full h-10" aria-label="Filter by role">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-5 flex items-end gap-2">
            <Button onClick={() => { setSearch(""); setRoleFilter("all"); }} className="w-full">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or role filter."
          actionLabel="Reset filters"
          onAction={() => { setSearch(""); setRoleFilter("all"); }}
        />
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Plan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold">
                            {user.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "WP"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-foreground">{user.name || "Unnamed"}</p>
                        {user.businessName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.businessName}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {roleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {user.subscriptionPlan === "premium" ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                        <Crown className="w-3 h-3 mr-1.5" />
                        Premium
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    <Badge
                      variant={user.isBlocked ? "destructive" : "secondary"}
                      className={cn(
                        "text-xs capitalize",
                        user.isBlocked ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      )}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmBlock(user, !user.isBlocked)}
                      disabled={isBlocking === user.id}
                      className="text-xs"
                      aria-label={user.isBlocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                    >
                      {isBlocking === user.id ? (
                        <Loader2Inline />
                      ) : (
                        user.isBlocked ? (
                          <span className="flex items-center gap-1">Unblock</span>
                        ) : (
                          <span className="flex items-center gap-1">Block</span>
                        )
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      <Dialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blockTarget?.block ? "Block user?" : "Unblock user?"}
            </DialogTitle>
            <DialogDescription>
              {blockTarget && `This will ${blockTarget.block ? "block" : "unblock"} <strong>"{blockTarget.name}"</strong>. They ${blockTarget.block ? "will not be able to access the platform" : "will regain access"}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTarget(null)} disabled={isBlocking === blockTarget?.id}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeBlock}
              disabled={isBlocking === blockTarget?.id}
              className="gap-2"
            >
              {isBlocking === blockTarget?.id ? (
                <Loader2Inline />
              ) : (
                blockTarget?.block ? "Block User" : "Unblock User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Loader2Inline() {
  return (
    <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
