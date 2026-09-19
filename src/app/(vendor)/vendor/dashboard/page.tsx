"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListPlus,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { BookingCard, BookingCardSkeleton } from "@/components/booking/booking-card";
import { BlobBg } from "@/components/shared/blob-bg";
import { RatingDisplay } from "@/components/review/star-rating";
import { CategoryPill } from "@/components/shared/category-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { api } from "@/trpc/react";

export default function VendorDashboardPage() {
  const { user } = useSession();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const { data: profile, isLoading: profileLoading } =
    api.vendor.myProfile.useQuery();

  const { data: pendingBookings, isLoading: pendingLoading } =
    api.booking.vendorBookings.useQuery({ status: "pending", limit: 3 });

  const { data: allBookings } = api.booking.vendorBookings.useQuery({
    status: "all",
    limit: 50,
  });

  const { data: confirmedBookings } = api.booking.vendorBookings.useQuery({
    status: "confirmed",
    limit: 50,
  });

  const { data: completedBookings } = api.booking.vendorBookings.useQuery({
    status: "completed",
    limit: 50,
  });

  const { data: listings, isLoading: listingsLoading } =
    api.listing.myListings.useQuery({ status: "published", limit: 5 });

  const utils = api.useUtils();

  function handleMutated() {
    void utils.booking.vendorBookings.invalidate();
  }

  const hasProfile = !!profile;

  return (
    <div className="min-h-full">
      {/* ── Welcome header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <BlobBg variant="section" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Vendor Portal 🏪
            </p>
            <h1 className="mt-0.5 text-3xl font-black text-gray-900">
              Hey, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {hasProfile
                ? `Managing ${profile.businessName}`
                : "Set up your vendor profile to start receiving bookings."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {hasProfile ? (
              <Button
                asChild
                className="rounded-xl bg-violet-600 font-semibold hover:bg-violet-700"
              >
                <Link href="/vendor/listings/new">
                  <ListPlus className="mr-2 h-4 w-4" />
                  New Listing
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="rounded-xl bg-violet-600 font-semibold hover:bg-violet-700"
              >
                <Link href="/vendor/profile">
                  Complete Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── No profile banner ── */}
      {!profileLoading && !hasProfile && (
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Card className="relative isolate overflow-hidden border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                  <Store className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-violet-900">
                    Complete your vendor profile
                  </p>
                  <p className="mt-0.5 text-sm text-violet-700/80">
                    Add your business details, logo, and description to start
                    appearing in search results and accepting bookings.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700"
              >
                <Link href="/vendor/profile">Set Up Profile</Link>
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Stats ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profileLoading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Pending Bookings"
                value={pendingBookings?.length ?? 0}
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="Confirmed"
                value={confirmedBookings?.length ?? 0}
                icon={CalendarDays}
                color="emerald"
              />
              <StatCard
                title="Completed"
                value={completedBookings?.length ?? 0}
                icon={CheckCircle2}
                color="violet"
              />
              <StatCard
                title="Total Bookings"
                value={allBookings?.length ?? 0}
                icon={TrendingUp}
                color="sky"
              />
            </>
          )}
        </div>

        {/* ── Two column layout ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Pending bookings — 2/3 */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">Pending Bookings</h2>
                {(pendingBookings?.length ?? 0) > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                    {pendingBookings!.length}
                  </span>
                )}
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-violet-600"
              >
                <Link href="/vendor/bookings">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {pendingLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            ) : pendingBookings?.length ? (
              <div className="space-y-4">
                {pendingBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    perspective="vendor"
                    onMutated={handleMutated}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No pending bookings"
                description="New booking requests will appear here."
                variant="card"
              />
            )}
          </div>

          {/* Right sidebar — 1/3 */}
          <div className="space-y-5">

            {/* Active listings */}
            <Card className="border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-violet-500" />
                  <h3 className="font-bold text-gray-900">Active Listings</h3>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-violet-600"
                >
                  <Link href="/vendor/listings">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-gray-50">
                {listingsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="ml-auto h-4 w-16" />
                    </div>
                  ))
                ) : listings?.length ? (
                  listings.map((l) => (
                    <Link
                      key={l.id}
                      href={`/vendor/listings/${l.id}/edit`}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {l.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <CategoryPill category={l.category} size="sm" />
                        </div>
                      </div>
                      <div className="ml-3 shrink-0 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(l.basePrice)}
                        </p>
                        <RatingDisplay
                          rating={l.averageRating}
                          totalReviews={l.totalReviews}
                          size="sm"
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400">
                      No published listings yet
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="mt-3 bg-violet-600 hover:bg-violet-700"
                    >
                      <Link href="/vendor/listings/new">
                        <ListPlus className="mr-1.5 h-3.5 w-3.5" />
                        Add Listing
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick actions */}
            <div className="space-y-2.5">
              {[
                {
                  icon: ListPlus,
                  label: "New Listing",
                  href: "/vendor/listings/new",
                  color: "from-violet-500 to-indigo-600",
                },
                {
                  icon: BookOpen,
                  label: "All Bookings",
                  href: "/vendor/bookings",
                  color: "from-sky-500 to-cyan-600",
                },
                {
                  icon: Star,
                  label: "View Profile",
                  href: "/vendor/profile",
                  color: "from-amber-500 to-orange-600",
                },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="group flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ${a.color}`}
                  >
                    <a.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                    {a.label}
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}