import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional trend vs previous period */
  trend?: {
    value: number; // positive = up, negative = down
    label?: string; // e.g. "vs last month"
  };
  /** Gradient preset for the icon bg */
  color?: "violet" | "sky" | "emerald" | "amber" | "pink";
  className?: string;
}

const COLOR_MAP = {
  violet: {
    icon: "from-violet-500 to-purple-600",
    text: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
  },
  sky: {
    icon: "from-sky-500 to-cyan-600",
    text: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-100",
  },
  emerald: {
    icon: "from-emerald-500 to-teal-600",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  amber: {
    icon: "from-amber-500 to-orange-600",
    text: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
  },
  pink: {
    icon: "from-pink-500 to-rose-600",
    text: "text-pink-600",
    bg: "bg-pink-50",
    ring: "ring-pink-100",
  },
} as const;

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "violet",
  className,
}: StatCardProps) {
  const colors = COLOR_MAP[color];
  const isPositive = trend ? trend.value >= 0 : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6",
        "shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Subtle corner glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl",
          `bg-gradient-to-br ${colors.icon}`,
        )}
      />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ring-4",
            colors.icon,
            colors.ring,
          )}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {trend?.label && (
          <p className="mt-1 text-xs text-gray-400">{trend.label}</p>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-gray-100" />
        <div className="h-6 w-14 rounded-full bg-gray-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-24 rounded bg-gray-100" />
        <div className="h-8 w-20 rounded bg-gray-100" />
      </div>
    </div>
  );
}