import { cn } from "@/lib/utils";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  amber:
    "border-amber-200 bg-amber-50 text-amber-700",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  red:
    "border-red-200 bg-red-50 text-red-700",
  sky:
    "border-sky-200 bg-sky-50 text-sky-700",
};

// ─── Dot color map ────────────────────────────────────────────────────────────

const DOT_MAP: Record<string, string> = {
  amber: "bg-amber-400",
  emerald: "bg-emerald-500",
  red: "bg-red-500",
  sky: "bg-sky-500",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingStatusBadgeProps {
  status: string;
  /** Show animated pulse dot */
  showDot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

// ─── BookingStatusBadge ───────────────────────────────────────────────────────

/**
 * Inline booking status badge.
 * Supports all 4 booking states: pending · confirmed · cancelled · completed
 *
 * @example
 * <BookingStatusBadge status="confirmed" showDot />
 * <BookingStatusBadge status={booking.status} size="sm" />
 */
export function BookingStatusBadge({
  status,
  showDot = false,
  size = "md",
  className,
}: BookingStatusBadgeProps) {
  const config = BOOKING_STATUS[status as BookingStatus];
  const colorClass = COLOR_MAP[config?.color ?? "amber"];
  const dotClass = DOT_MAP[config?.color ?? "amber"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-xs",
        colorClass,
        className,
      )}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {status === "pending" && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotClass,
              )}
            />
          )}
          <span
            className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotClass)}
          />
        </span>
      )}
      {config?.label ?? status}
    </span>
  );
}