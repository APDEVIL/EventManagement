import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPill } from "@/components/shared/category-pill";
import { VerifiedBadge } from "@/components/vendor/verified-badge";
import { RatingDisplay } from "@/components/review/star-rating";
import { cn, formatCurrency, getImagePlaceholder } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  basePrice: string | number;
  priceUnit: string;
  city?: string | null;
  averageRating: string | number;
  totalReviews: number;
  vendor?: {
    businessName: string;
    slug: string;
    logoUrl?: string | null;
    isVerified: boolean;
    city?: string | null;
  } | null;
}

interface ListingCardProps {
  listing: ListingCardData;
  className?: string;
}

// ─── ListingCard ──────────────────────────────────────────────────────────────

/**
 * Grid card for a single listing. Links to `/events/[slug]`.
 * Shows cover image, category pill, price badge, vendor name, and rating.
 *
 * @example
 * <ListingCard listing={listing} />
 */
export function ListingCard({ listing, className }: ListingCardProps) {
  const coverImage =
    listing.images[0] ?? getImagePlaceholder(listing.title);
  const price = parseFloat(String(listing.basePrice));

  return (
    <Link
      href={`/events/${listing.slug}`}
      className={cn("group block focus:outline-none", className)}
    >
      <Card className="overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-100/40 group-focus-visible:ring-2 group-focus-visible:ring-violet-500 group-focus-visible:ring-offset-2">

        {/* ── Cover image ── */}
        <div className="relative h-48 overflow-hidden bg-violet-50">
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Gradient overlay for bottom badges */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Category pill — top left */}
          <div className="absolute left-3 top-3">
            <CategoryPill category={listing.category} size="sm" />
          </div>

          {/* Price badge — bottom right */}
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(price)}
            </span>
            <span className="ml-1 text-xs text-gray-400">
              /{listing.priceUnit}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-1.5 line-clamp-1 font-bold text-gray-900 transition-colors group-hover:text-violet-700">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {listing.description}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            {/* Vendor info */}
            {listing.vendor ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-xs font-medium text-gray-600">
                  {listing.vendor.businessName}
                </span>
                {listing.vendor.isVerified && <VerifiedBadge size="sm" />}
              </div>
            ) : listing.city ? (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                {listing.city}
              </span>
            ) : (
              <span />
            )}

            {/* Rating */}
            <RatingDisplay
              rating={listing.averageRating}
              totalReviews={listing.totalReviews}
              size="sm"
              className="shrink-0"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-gray-100 bg-white shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}