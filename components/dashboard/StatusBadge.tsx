import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadge({ status }: { status?: string | null }) {
  const config = STATUS_STYLES[(status || "").toLowerCase()] || {
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
