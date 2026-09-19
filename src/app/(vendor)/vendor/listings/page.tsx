"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Edit,
  Eye,
  EyeOff,
  ListPlus,
  Loader2,
  Store,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryPill } from "@/components/shared/category-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingDisplay } from "@/components/review/star-rating";
import { formatCurrency, getImagePlaceholder } from "@/lib/utils";
import { api } from "@/trpc/react";

type StatusFilter = "all" | "published" | "draft" | "suspended";

const STATUS_BADGE: Record<string, string> = {
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  suspended: "border-red-200 bg-red-50 text-red-700",
};

export default function VendorListingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: listings, isLoading } = api.listing.myListings.useQuery({
    status: statusFilter,
    limit: 50,
  });

  const setStatusMutation = api.listing.setStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "published" ? "Listing published!" : "Moved to draft.",
      );
      void utils.listing.myListings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = api.listing.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted.");
      setDeleteId(null);
      void utils.listing.myListings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

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
              <h1 className="text-2xl font-black text-gray-900">My Listings</h1>
              <p className="text-sm text-gray-500">
                Manage your services and track performance
              </p>
            </div>
          </div>
          <Button
            asChild
            className="rounded-xl bg-violet-600 font-semibold hover:bg-violet-700"
          >
            <Link href="/vendor/listings/new">
              <ListPlus className="mr-2 h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Status tabs ── */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          className="space-y-6"
        >
          <TabsList className="h-auto rounded-2xl bg-gray-100 p-1">
            {(["all", "published", "draft", "suspended"] as const).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="rounded-xl px-4 py-2 text-sm font-semibold capitalize data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
              >
                {s === "all" ? "All" : s}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Listings grid ── */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <ListingRowSkeleton key={i} />
              ))}
            </div>
          ) : !listings?.length ? (
            <EmptyState
              icon={Store}
              title="No listings found"
              description={
                statusFilter === "all"
                  ? "Create your first listing to start receiving bookings."
                  : `No ${statusFilter} listings.`
              }
              actionLabel="Create Listing"
              actionHref="/vendor/listings/new"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => {
                const coverImage = l.images[0] ?? getImagePlaceholder(l.title);
                const isPublished = l.status === "published";

                return (
                  <Card
                    key={l.id}
                    className="group overflow-hidden border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:shadow-violet-100/50"
                  >
                    {/* Cover image */}
                    <div className="relative h-36 overflow-hidden bg-violet-50">
                      <Image
                        src={coverImage}
                        alt={l.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {/* Status badge */}
                      <div className="absolute left-2.5 top-2.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_BADGE[l.status] ?? STATUS_BADGE.draft}`}
                        >
                          {l.status}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="mb-2">
                        <p className="truncate font-bold text-gray-900">
                          {l.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <CategoryPill category={l.category} size="sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-gray-900">
                          {formatCurrency(l.basePrice)}
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            /{l.priceUnit}
                          </span>
                        </span>
                        <RatingDisplay
                          rating={l.averageRating}
                          totalReviews={l.totalReviews}
                          size="sm"
                        />
                      </div>

                      {/* Booking count */}
                      <p className="mt-1 text-xs text-gray-400">
                        {l.totalBookings} booking
                        {l.totalBookings !== 1 ? "s" : ""}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                        {/* Edit */}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 rounded-xl border-gray-200 text-xs"
                        >
                          <Link href={`/vendor/listings/${l.id}/edit`}>
                            <Edit className="h-3 w-3" />
                            Edit
                          </Link>
                        </Button>

                        {/* Publish / Draft toggle */}
                        {l.status !== "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={setStatusMutation.isPending}
                            onClick={() =>
                              setStatusMutation.mutate({
                                id: l.id,
                                status: isPublished ? "draft" : "published",
                              })
                            }
                            className={`flex-1 gap-1.5 rounded-xl text-xs ${isPublished ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                          >
                            {setStatusMutation.isPending &&
                            setStatusMutation.variables?.id === l.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isPublished ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                            {isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(l.id)}
                          className="h-8 w-8 rounded-xl p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Tabs>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              This will permanently delete the listing and all associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ListingRowSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100 animate-pulse">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-20 rounded-full" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}