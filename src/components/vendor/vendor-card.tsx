import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPill } from "@/components/shared/category-pill";
import { VerifiedBadge } from "./verified-badge";
import { cn } from "@/lib/utils";
import { formatRating, initials, pluralize } from "@/lib/utils";

interface VendorCardProps {
  vendor: {
    id: string;
    slug: string;
    businessName: string;
    description?: string | null;
    category: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    city?: string | null;
    isVerified: boolean;
    averageRating: string | number;
    totalReviews: number;
    user?: {
      name?: string | null;
      image?: string | null;
    } | null;
  };
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  const rating = parseFloat(String(vendor.averageRating));
  const hasRating = rating > 0;

  return (
    <Link href={`/vendors/${vendor.slug}`} className={cn("group block", className)}>
      <Card className="overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/50">
        {/* Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600">
          {vendor.bannerUrl ? (
            <Image
              src={vendor.bannerUrl}
              alt={vendor.businessName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            /* Decorative blob fallback */
            <svg
              viewBox="0 0 400 128"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`vg-${vendor.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D1B69" />
                  <stop offset="100%" stopColor="#7EC8E3" />
                </linearGradient>
              </defs>
              <rect width="400" height="128" fill={`url(#vg-${vendor.id})`} />
              <ellipse cx="320" cy="20" rx="140" ry="100" fill="#7C3AED" opacity="0.35" />
              <ellipse cx="60" cy="110" rx="120" ry="80" fill="#A78BFA" opacity="0.25" />
            </svg>
          )}

          {/* Category pill overlay */}
          <div className="absolute left-3 top-3">
            <CategoryPill category={vendor.category} size="sm" />
          </div>

          {/* Verified badge */}
          {vendor.isVerified && (
            <div className="absolute right-3 top-3">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Logo + name row */}
          <div className="-mt-8 mb-3 flex items-end gap-3">
            <Avatar className="h-14 w-14 shrink-0 ring-4 ring-white shadow-md">
              <AvatarImage src={vendor.logoUrl ?? ""} alt={vendor.businessName} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
                {initials(vendor.businessName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h3 className="truncate font-bold text-gray-900 transition-colors group-hover:text-violet-700">
                {vendor.businessName}
              </h3>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {vendor.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between">
            {/* Location */}
            {vendor.city && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                {vendor.city}
              </span>
            )}

            {/* Rating */}
            {hasRating ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {formatRating(rating)}
                </span>
                <span className="text-xs text-gray-400">
                  ({pluralize(vendor.totalReviews, "review")})
                </span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">No reviews yet</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

export function VendorCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-4">
        <div className="-mt-8 mb-3 flex items-end gap-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full ring-4 ring-white" />
          <Skeleton className="mb-1 h-5 w-32" />
        </div>
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-3/4" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}