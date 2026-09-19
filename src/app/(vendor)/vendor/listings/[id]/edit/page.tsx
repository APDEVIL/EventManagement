"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingForm } from "@/components/listing/listing-form";
import { api } from "@/trpc/react";

export default function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch own listings and find the one matching this id
  const { data: listings, isLoading } = api.listing.myListings.useQuery({
    status: "all",
    limit: 100,
  });

  const listing = listings?.find((l) => l.id === params.id);

  if (!isLoading && listings && !listing) return notFound();

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-xl text-gray-500 hover:text-gray-900"
          >
            <Link href="/vendor/listings">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-200">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Edit Listing
              </h1>
              <p className="truncate max-w-xs text-sm text-gray-500">
                {isLoading ? "Loading…" : listing?.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <EditSkeleton />
        ) : listing ? (
          <ListingForm
            defaultValues={{
              id: listing.id,
              title: listing.title,
              description: listing.description,
              category: listing.category as any,
              tags: listing.tags,
              images: listing.images,
              basePrice: parseFloat(String(listing.basePrice)),
              priceUnit: listing.priceUnit as any,
              city: listing.city ?? "",
              address: listing.address ?? "",
              capacity: listing.capacity ?? undefined,
              status: listing.status as "draft" | "published",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          {i === 0 && <Skeleton className="h-32 rounded-xl" />}
        </div>
      ))}
    </div>
  );
}