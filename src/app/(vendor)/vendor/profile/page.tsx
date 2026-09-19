"use client";

import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BlobBg } from "@/components/shared/blob-bg";
import { VendorProfileForm } from "@/components/vendor/vendor-profile-form";
import { VerifiedBadge } from "@/components/vendor/verified-badge";
import { RatingDisplay } from "@/components/review/star-rating";
import { pluralize } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function VendorProfilePage() {
  const { data: profile, isLoading } = api.vendor.myProfile.useQuery();

  const isEdit = !!profile;

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-200">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {isEdit ? "Vendor Profile" : "Create Vendor Profile"}
              </h1>
              <p className="text-sm text-gray-500">
                {isEdit
                  ? "Update your business details and branding"
                  : "Set up your profile to start receiving bookings"}
              </p>
            </div>
          </div>

          {/* View public profile link */}
          {profile?.slug && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              <Link
                href={`/vendors/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Public Profile
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <ProfileFormSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Stats banner — only shown if profile already exists */}
            {isEdit && (
              <Card className="relative isolate overflow-hidden border-0 shadow-lg shadow-violet-100/40">
                <BlobBg variant="card" className="h-full" />
                <div className="relative z-10 flex flex-wrap items-center gap-6 p-6">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">
                      {profile.listings?.length ?? 0}
                    </p>
                    <p className="text-xs font-medium text-violet-200">
                      Listings
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">
                      {profile.totalReviews}
                    </p>
                    <p className="text-xs font-medium text-violet-200">
                      Reviews
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-center">
                    <RatingDisplay
                      rating={profile.averageRating}
                      totalReviews={profile.totalReviews}
                      size="md"
                      className="text-white [&_span]:text-white [&_span]:text-white"
                    />
                    <p className="mt-0.5 text-xs font-medium text-violet-200">
                      Avg Rating
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {profile.isVerified ? (
                      <VerifiedBadge showLabel size="md" />
                    ) : (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-200 ring-1 ring-white/20">
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Profile form */}
            <Card className="border border-gray-100 p-6 shadow-sm">
              <VendorProfileForm
                defaultValues={
                  isEdit
                    ? {
                        businessName: profile.businessName,
                        description: profile.description ?? "",
                        category: profile.category as any,
                        logoUrl: profile.logoUrl ?? "",
                        bannerUrl: profile.bannerUrl ?? "",
                        website: profile.website ?? "",
                        city: profile.city ?? "",
                        address: profile.address ?? "",
                      }
                    : undefined
                }
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}