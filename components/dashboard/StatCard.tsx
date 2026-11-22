import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-destructive/10 text-destructive",
  gold: "bg-amber-500/10 text-amber-600",
} as const;

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: keyof typeof TONES;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold leading-none">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            TONES[tone]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
