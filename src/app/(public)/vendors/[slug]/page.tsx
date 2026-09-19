"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPill } from "@/components/shared/category-pill";
import { BlobBg } from "@/components/shared/blob-bg";
import { ListingCard, ListingCardSkeleton } from "@/components/listing/listing-card";
import { VerifiedBadge } from "@/components/vendor/verified-badge";
import { RatingDisplay } from "@/components/review/star-rating";
import { formatRelativeTime, initials, pluralize } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function VendorDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: vendor, isLoading } = api.vendor.getBySlug.useQuery({
    slug: params.slug,
  });

  if (isLoading) return <VendorSkeleton />;
  if (!vendor) return notFound();

  const publishedListings = vendor.listings ?? [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Banner ── */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#2D1B69] to-[#5B4FCF] md:h-72">
        {vendor.bannerUrl ? (
          <Image
            src={vendor.bannerUrl}
            alt={`${vendor.businessName} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <BlobBg variant="hero" />
        )}

        {/* Back button */}
        <div className="absolute left-4 top-4 z-10">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
          >
            <Link href="/vendors">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Profile card overlapping banner ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="-mt-16 relative z-10 border border-gray-100 px-6 pb-6 pt-0 shadow-lg shadow-violet-100/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Logo */}
            <Avatar className="h-24 w-24 shrink-0 -mt-8 ring-4 ring-white shadow-xl">
              <AvatarImage
                src={vendor.logoUrl ?? ""}
                alt={vendor.businessName}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-black text-white">
                {initials(vendor.businessName)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">
                  {vendor.businessName}
                </h1>
                {vendor.isVerified && <VerifiedBadge showLabel size="md" />}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <CategoryPill category={vendor.category} size="sm" />

                {vendor.city && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {vendor.city}
                  </span>
                )}

                <RatingDisplay
                  rating={vendor.averageRating}
                  totalReviews={vendor.totalReviews}
                  size="sm"
                />
              </div>
            </div>

            {/* Website CTA */}
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </Button>
              </a>
            )}
          </div>

          {/* Description */}
          {vendor.description && (
            <>
              <Separator className="my-5" />
              <p className="text-sm leading-relaxed text-gray-600">
                {vendor.description}
              </p>
            </>
          )}
        </Card>

        {/* ── Main content ── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Listings — 2/3 */}
          <div className="space-y-5 lg:col-span-2">
            <h2 className="text-xl font-black text-gray-900">
              Services & Listings
              {publishedListings.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-400">
                  ({publishedListings.length})
                </span>
              )}
            </h2>

            {publishedListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 py-14 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  No listings yet
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  This vendor hasn't published any services yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {publishedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      vendor: {
                        businessName: vendor.businessName,
                        slug: vendor.slug,
                        logoUrl: vendor.logoUrl,
                        isVerified: vendor.isVerified,
                        city: vendor.city,
                      },
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-5">
            {/* Stats card */}
            <Card className="border border-gray-100 p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900">Overview</h3>
              <div className="space-y-3">
                <OverviewRow
                  label="Listings"
                  value={pluralize(publishedListings.length, "service")}
                />
                <OverviewRow
                  label="Reviews"
                  value={pluralize(vendor.totalReviews, "review")}
                />
                {parseFloat(String(vendor.averageRating)) > 0 && (
                  <OverviewRow
                    label="Avg Rating"
                    value={
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {parseFloat(String(vendor.averageRating)).toFixed(1)}
                      </span>
                    }
                  />
                )}
                {vendor.city && (
                  <OverviewRow label="Location" value={vendor.city} />
                )}
                {vendor.user && (
                  <OverviewRow
                    label="Contact"
                    value={vendor.user.name ?? "—"}
                  />
                )}
              </div>
            </Card>

            {/* Verified card */}
            {vendor.isVerified && (
              <Card className="border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <VerifiedBadge size="sm" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">
                      Verified Vendor
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-emerald-700/80">
                      This vendor has been reviewed and verified by the Evenza team for quality and reliability.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="py-16" />
    </div>
  );
}

// ─── Overview row helper ──────────────────────────────────────────────────────

function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function VendorSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Skeleton className="h-56 w-full rounded-none md:h-72" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="-mt-16 relative z-10 border border-gray-100 p-6 shadow-lg animate-pulse">
          <div className="flex items-end gap-6">
            <Skeleton className="-mt-8 h-24 w-24 shrink-0 rounded-full ring-4 ring-white" />
            <div className="flex-1 space-y-2 pb-1">
              <Skeleton className="h-7 w-56" />
              <div className="flex gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="mt-5 h-px w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}