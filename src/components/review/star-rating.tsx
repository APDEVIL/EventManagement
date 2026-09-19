"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

interface RatingDisplayProps {
  rating: number | string;
  totalReviews?: number;
  size?: "sm" | "md";
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

// ─── StarRating ───────────────────────────────────────────────────────────────

/**
 * Interactive (default) and readonly star rating.
 *
 * Interactive — pass `onChange` to receive the chosen value.
 * Readonly    — pass `readonly` to render a static display.
 *
 * @example interactive
 * <StarRating value={rating} onChange={setRating} size="lg" showLabel />
 *
 * @example readonly
 * <StarRating value={4.5} readonly size="sm" />
 */
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showLabel = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = readonly ? value : hovered || value;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Stars */}
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readonly && setHovered(0)}
        role={readonly ? undefined : "group"}
        aria-label={readonly ? `${value} out of 5 stars` : "Star rating"}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={cn(
              "transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 rounded-sm",
              !readonly && "cursor-pointer hover:scale-110 active:scale-95",
              readonly && "cursor-default pointer-events-none",
            )}
            aria-label={
              readonly
                ? `${value} out of 5`
                : `Rate ${star} star${star !== 1 ? "s" : ""}`
            }
          >
            <Star
              className={cn(
                SIZE_MAP[size],
                "transition-colors duration-100",
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-100 text-gray-200",
              )}
            />
          </button>
        ))}
      </div>

      {/* Optional label (e.g. "Very Good") */}
      {showLabel && value > 0 && (
        <span className="text-sm font-semibold text-amber-600">
          {RATING_LABELS[Math.round(value)]}
        </span>
      )}
    </div>
  );
}

// ─── RatingDisplay ────────────────────────────────────────────────────────────

/**
 * Compact inline rating display used on cards, listing headers, etc.
 * Shows a single filled star, the numeric value, and optional review count.
 *
 * @example
 * <RatingDisplay rating={4.3} totalReviews={28} />
 */
export function RatingDisplay({
  rating,
  totalReviews,
  size = "sm",
  className,
}: RatingDisplayProps) {
  const num = parseFloat(String(rating));

  if (!num || num === 0) {
    return (
      <span className={cn("text-xs text-gray-400", className)}>
        No reviews yet
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-1", className)}>
      <Star
        className={cn(
          "fill-amber-400 text-amber-400",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
      />
      <span
        className={cn(
          "font-semibold text-gray-900",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {num.toFixed(1)}
      </span>
      {totalReviews !== undefined && (
        <span
          className={cn(
            "text-gray-400",
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          ({totalReviews.toLocaleString()})
        </span>
      )}
    </span>
  );
}