import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating, RATING_LABELS } from "./star-rating";
import { cn, formatRelativeTime, initials } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    body: string;
    createdAt: Date | string;
    user?: {
      id?: string;
      name?: string | null;
      image?: string | null;
    } | null;
  };
  /** Compact variant removes card border and padding for inline use */
  variant?: "card" | "inline";
  className?: string;
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

/**
 * Displays a single user review with avatar, star rating, relative timestamp,
 * optional title, and body text.
 *
 * @example
 * <ReviewCard review={review} />
 * <ReviewCard review={review} variant="inline" />
 */
export function ReviewCard({
  review,
  variant = "card",
  className,
}: ReviewCardProps) {
  const label = RATING_LABELS[review.rating];

  const content = (
    <>
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-violet-50">
          <AvatarImage
            src={review.user?.image ?? ""}
            alt={review.user?.name ?? "User"}
          />
          <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-xs font-bold text-violet-700">
            {initials(review.user?.name ?? "A")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">
              {review.user?.name ?? "Anonymous"}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>

          {/* Stars + label */}
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={review.rating} readonly size="xs" />
            {label && (
              <span className="text-xs font-medium text-amber-600">{label}</span>
            )}
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="mt-3 space-y-1">
        {review.title && (
          <p className="text-sm font-semibold text-gray-900">{review.title}</p>
        )}
        <p className="text-sm leading-relaxed text-gray-600">{review.body}</p>
      </div>
    </>
  );

  if (variant === "inline") {
    return <div className={cn("py-4", className)}>{content}</div>;
  }

  return (
    <Card
      className={cn(
        "border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {content}
    </Card>
  );
}

// ─── ReviewList ───────────────────────────────────────────────────────────────

interface ReviewListProps {
  reviews: ReviewCardProps["review"][];
  isLoading?: boolean;
  className?: string;
  variant?: ReviewCardProps["variant"];
}

/**
 * Renders a vertical list of ReviewCards with optional skeleton loading state.
 *
 * @example
 * <ReviewList reviews={reviews} isLoading={isLoading} />
 */
export function ReviewList({
  reviews,
  isLoading = false,
  className,
  variant = "card",
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No reviews yet. Be the first to review!
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} variant={variant} />
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("border border-gray-100 p-5", className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </Card>
  );
}