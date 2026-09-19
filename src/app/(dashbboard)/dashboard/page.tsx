"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { BookingCard, BookingCardSkeleton } from "@/components/booking/booking-card";
import { BlobBg } from "@/components/shared/blob-bg";
import { useSession } from "@/hooks/use-session";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  const { user } = useSession();

  const { data: bookings, isLoading: bookingsLoading } =
    api.booking.myBookings.useQuery({ limit: 3, status: "all" });

  const { data: pendingBookings } = api.booking.myBookings.useQuery({
    status: "pending",
    limit: 50,
  });
  const { data: confirmedBookings } = api.booking.myBookings.useQuery({
    status: "confirmed",
    limit: 50,
  });
  const { data: completedBookings } = api.booking.myBookings.useQuery({
    status: "completed",
    limit: 50,
  });

  const { data: notifications } = api.user.getNotifications.useQuery({
    limit: 5,
    unreadOnly: true,
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const unreadCount = notifications?.length ?? 0;

  return (
    <div className="min-h-full">
      {/* ── Welcome hero ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <BlobBg variant="section" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Welcome back 👋
            </p>
            <h1 className="mt-0.5 text-3xl font-black text-gray-900">
              Hey, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your events.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-2 ring-1 ring-violet-100">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
                <span className="text-sm font-medium text-violet-700">
                  new notification{unreadCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
            <Button
              asChild
              className="rounded-xl bg-violet-600 font-semibold hover:bg-violet-700"
            >
              <Link href="/events">
                <Store className="mr-2 h-4 w-4" />
                Browse Events
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {bookingsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
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
            </>
          )}
        </div>

        {/* ── Two column layout ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent bookings — 2/3 width */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent Bookings</h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-violet-600"
              >
                <Link href="/bookings">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            ) : bookings?.length ? (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    perspective="user"
                  />
                ))}
              </div>
            ) : (
              <EmptyBookings />
            )}
          </div>

          {/* Quick actions sidebar — 1/3 width */}
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Quick Actions</h2>

            <div className="space-y-3">
              {[
                {
                  icon: Store,
                  label: "Browse Events",
                  desc: "Find your next vendor",
                  href: "/events",
                  color: "from-violet-500 to-indigo-600",
                },
                {
                  icon: BookOpen,
                  label: "My Bookings",
                  desc: "View all your bookings",
                  href: "/bookings",
                  color: "from-sky-500 to-cyan-600",
                },
                {
                  icon: CalendarDays,
                  label: "Upcoming Events",
                  desc: "See what's coming up",
                  href: "/bookings?status=confirmed",
                  color: "from-emerald-500 to-teal-600",
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${action.color}`}
                  >
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-300 group-hover:text-violet-400 transition-colors" />
                </Link>
              ))}
            </div>

            {/* Become a vendor CTA */}
            <Card className="relative isolate overflow-hidden border-0 bg-gradient-to-br from-[#2D1B69] to-[#5B4FCF] p-5 text-white shadow-lg shadow-violet-900/20">
              <BlobBg variant="card" className="opacity-40" />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                  Are you a vendor?
                </p>
                <p className="mt-1.5 text-sm font-bold leading-snug">
                  List your services and start receiving bookings today
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-4 w-full rounded-xl bg-white font-semibold text-violet-700 hover:bg-violet-50"
                >
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyBookings() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
        <BookOpen className="h-8 w-8 text-violet-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-gray-900">No bookings yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Find an event or vendor and make your first booking.
        </p>
      </div>
      <Button
        asChild
        className="rounded-xl bg-violet-600 hover:bg-violet-700"
      >
        <Link href="/events">Browse Events</Link>
      </Button>
    </div>
  );
}