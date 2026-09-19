"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  ListChecks,
  Loader2,
  ShieldAlert,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    api.admin.stats.useQuery();

  const { data: bookingReport, isLoading: bookingsLoading } =
    api.admin.bookingReport.useQuery({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    });

  const { data: pendingListings, isLoading: listingsLoading } =
    api.admin.listListings.useQuery({ status: "draft", limit: 5 });

  const recentBookings = bookingReport?.slice(0, 5);

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-200">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Platform overview and moderation tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Link href="/admin/listings">
                <ListChecks className="mr-2 h-4 w-4" />
                Review Listings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statsLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} className="xl:col-span-1" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString() ?? "0"}
                icon={Users}
                color="violet"
                className="xl:col-span-1"
              />
              <StatCard
                title="Vendors"
                value={stats?.totalVendors?.toLocaleString() ?? "0"}
                icon={Store}
                color="sky"
                className="xl:col-span-1"
              />
              <StatCard
                title="Listings"
                value={stats?.totalListings?.toLocaleString() ?? "0"}
                icon={ListChecks}
                color="emerald"
                className="xl:col-span-1"
              />
              <StatCard
                title="Total Bookings"
                value={stats?.totalBookings?.toLocaleString() ?? "0"}
                icon={BookOpen}
                color="amber"
                className="xl:col-span-1"
              />
              <StatCard
                title="Last 30 Days"
                value={stats?.recentBookings?.toLocaleString() ?? "0"}
                icon={TrendingUp}
                color="pink"
                trend={{ value: 12, label: "vs previous period" }}
                className="xl:col-span-1"
              />
              <StatCard
                title="Pending Review"
                value={stats?.pendingListings?.toLocaleString() ?? "0"}
                icon={ShieldAlert}
                color="violet"
                className="xl:col-span-1"
              />
            </>
          )}
        </div>

        {/* ── Two column grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent bookings */}
          <Card className="border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-500" />
                <h2 className="font-bold text-gray-900">Recent Bookings</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-violet-600">
                <Link href="/admin/dashboard">
                  View report <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {bookingsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <BookingRowSkeleton key={i} />
                  ))
                : recentBookings?.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {b.eventName}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {b.listing?.title} ·{" "}
                          {formatRelativeTime(b.createdAt)}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(b.totalPrice)}
                        </span>
                        <BookingStatusBadge status={b.status} size="sm" />
                      </div>
                    </div>
                  ))}
              {!bookingsLoading && !recentBookings?.length && (
                <p className="px-5 py-8 text-center text-sm text-gray-400">
                  No bookings in the last 30 days
                </p>
              )}
            </div>
          </Card>

          {/* Pending listings */}
          <Card className="border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <h2 className="font-bold text-gray-900">Pending Listings</h2>
                {stats?.pendingListings ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                    {stats.pendingListings > 9 ? "9+" : stats.pendingListings}
                  </span>
                ) : null}
              </div>
              <Button asChild variant="ghost" size="sm" className="text-violet-600">
                <Link href="/admin/listings">
                  Manage <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-gray-50">
              {listingsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <ListingRowSkeleton key={i} />
                  ))
                : pendingListings?.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {l.title}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {l.vendor?.businessName} · {l.category}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg border-violet-200 text-xs text-violet-600 hover:bg-violet-50"
                        >
                          <Link href="/admin/listings">Review</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
              {!listingsLoading && !pendingListings?.length && (
                <p className="px-5 py-8 text-center text-sm text-gray-400">
                  No listings pending review 🎉
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── Quick action cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              label: "Manage Users",
              desc: "View, deactivate, or promote users",
              href: "/admin/users",
              color: "from-violet-500 to-purple-600",
            },
            {
              icon: Store,
              label: "Listings",
              desc: "Approve, suspend, or remove listings",
              href: "/admin/listings",
              color: "from-indigo-500 to-violet-600",
            },
            {
              icon: Star,
              label: "Reviews",
              desc: "Moderate flagged or hidden reviews",
              href: "/admin/reviews",
              color: "from-amber-500 to-orange-600",
            },
            {
              icon: TrendingUp,
              label: "Booking Report",
              desc: "Download CSV of booking data",
              href: "/admin/dashboard",
              color: "from-emerald-500 to-teal-600",
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/50"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${action.color}`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                  {action.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Row skeletons ────────────────────────────────────────────────────────────

function BookingRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function ListingRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-7 w-16 rounded-lg" />
    </div>
  );
}