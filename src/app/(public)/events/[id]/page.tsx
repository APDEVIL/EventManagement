"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Star,
  Tag,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryPill } from "@/components/shared/category-pill";
import { BookingForm } from "@/components/booking/booking-form";
import { ReviewList } from "@/components/review/review-card";
import { RatingDisplay } from "@/components/review/star-rating";
import { VerifiedBadge } from "@/components/vendor/verified-badge";
import { formatCurrency, initials } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: listing, isLoading } = api.listing.getBySlug.useQuery({
    slug: params.id,
  });

  const { data: reviews, isLoading: reviewsLoading } =
    api.review.forListing.useQuery(
      { listingId: listing?.id ?? "", limit: 10 },
      { enabled: !!listing?.id },
    );

  if (isLoading) return <DetailSkeleton />;
  if (!listing) return notFound();

  const price = parseFloat(String(listing.basePrice));
  const vendor = listing.vendor;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Image gallery ── */}
      <div className="relative bg-black">
        {listing.images.length > 0 ? (
          <div
            className={`grid h-[400px] gap-1 md:h-[520px] ${listing.images.length > 1 ? "grid-cols-2 md:grid-cols-3" : ""}`}
          >
            {listing.images.slice(0, 3).map((img, i) => (
              <div
                key={img}
                className={`relative overflow-hidden ${i === 0 && listing.images.length > 1 ? "col-span-1 md:col-span-2 row-span-1" : ""}`}
              >
                <Image
                  src={img}
                  alt={`${listing.title} image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-72 bg-gradient-to-br from-violet-600 to-indigo-700" />
        )}

        {/* Back button */}
        <div className="absolute left-4 top-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          >
            <Link href="/events">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left: details ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Title block */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <CategoryPill category={listing.category} />
                {listing.city && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.city}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {listing.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <RatingDisplay
                  rating={listing.averageRating}
                  totalReviews={listing.totalReviews}
                  size="md"
                />
                {listing.capacity && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="h-4 w-4 text-violet-400" />
                    Up to {listing.capacity} guests
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                About this Service
              </h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-gray-600">
                {listing.description}
              </p>
            </div>

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-violet-400" />
                  <h2 className="font-bold text-gray-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Vendor info */}
            {vendor && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  About the Vendor
                </h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-violet-100">
                    <AvatarImage
                      src={vendor.logoUrl ?? ""}
                      alt={vendor.businessName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
                      {initials(vendor.businessName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/vendors/${vendor.slug}`}
                        className="font-bold text-gray-900 hover:text-violet-700 transition-colors"
                      >
                        {vendor.businessName}
                      </Link>
                      {vendor.isVerified && (
                        <VerifiedBadge showLabel size="sm" />
                      )}
                    </div>
                    {vendor.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {vendor.city}
                      </p>
                    )}
                    {vendor.user?.name && (
                      <p className="mt-1 text-sm text-gray-500">
                        Contact:{" "}
                        <span className="font-medium text-gray-700">
                          {vendor.user.name}
                        </span>
                      </p>
                    )}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
                  >
                    <Link href={`/vendors/${vendor.slug}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Reviews */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Reviews
                  {listing.totalReviews > 0 && (
                    <span className="ml-2 text-base font-normal text-gray-400">
                      ({listing.totalReviews})
                    </span>
                  )}
                </h2>
                {listing.totalReviews > 0 && (
                  <RatingDisplay
                    rating={listing.averageRating}
                    totalReviews={listing.totalReviews}
                  />
                )}
              </div>

              <ReviewList
                reviews={reviews ?? []}
                isLoading={reviewsLoading}
              />
            </div>
          </div>

          {/* ── Right: booking sticky card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden border border-gray-100 shadow-lg shadow-violet-100/40">
                {/* Price header */}
                <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#2D1B69] to-[#5B4FCF] px-6 py-5">
                  <div className="pointer-events-none absolute inset-0 opacity-30">
                    <svg viewBox="0 0 400 200" className="h-full w-full">
                      <circle cx="350" cy="30" r="120" fill="#A78BFA" opacity="0.4" />
                      <circle cx="50" cy="180" r="100" fill="#7EC8E3" opacity="0.3" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-violet-300">
                      Starting from
                    </p>
                    <p className="mt-0.5 text-3xl font-black text-white">
                      {formatCurrency(price)}
                      <span className="ml-1 text-base font-normal text-violet-200">
                        / {listing.priceUnit}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="divide-y divide-gray-50 px-6 py-4">
                  {listing.city && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {listing.city}
                      </span>
                    </div>
                  )}
                  {listing.capacity && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-500">Max Guests</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {listing.capacity}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-500">Category</span>
                    <CategoryPill category={listing.category} size="sm" />
                  </div>
                </div>

                {/* Booking CTA */}
                <div className="px-6 pb-6">
                  <BookingForm
                    listing={{
                      id: listing.id,
                      title: listing.title,
                      basePrice: listing.basePrice,
                      priceUnit: listing.priceUnit,
                      capacity: listing.capacity,
                      city: listing.city,
                      vendor: vendor
                        ? {
                            businessName: vendor.businessName,
                            isVerified: vendor.isVerified,
                          }
                        : null,
                    }}
                  />
                  <p className="mt-3 text-center text-xs text-gray-400">
                    No payment collected at this stage
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Skeleton className="h-[400px] w-full rounded-none md:h-[520px]" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}