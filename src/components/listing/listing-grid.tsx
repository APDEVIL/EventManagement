"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard, ListingCardSkeleton, type ListingCardData } from "./listing-card";
import { cn } from "@/lib/utils";
import { Store } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingGridProps {
  listings?: ListingCardData[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  skeletonCount?: number;
  /** Columns preset — defaults to responsive auto */
  cols?: "auto" | 2 | 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  className?: string;
}

// ─── Column class map ─────────────────────────────────────────────────────────

const COLS_MAP = {
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

// ─── ListingGrid ──────────────────────────────────────────────────────────────

/**
 * Responsive grid of ListingCard components.
 * Handles loading skeletons, empty state, and "Load More" pagination.
 *
 * @example
 * <ListingGrid
 *   listings={listings}
 *   isLoading={isLoading}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 * />
 */
export function ListingGrid({
  listings,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  skeletonCount = 8,
  cols = "auto",
  emptyTitle = "No listings found",
  emptyDescription = "Try adjusting your filters or search terms.",
  emptyActionLabel,
  emptyActionHref,
  className,
}: ListingGridProps) {
  const colsClass = COLS_MAP[cols];

  // ── Loading — initial ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn("grid gap-6", colsClass, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!listings?.length) {
    return (
      <EmptyState
        icon={Store}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
        variant="card"
      />
    );
  }

  // ── Grid ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className={cn("grid gap-6", colsClass, className)}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="min-w-40 rounded-full border-violet-200 text-violet-700 hover:border-violet-400 hover:bg-violet-50"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}