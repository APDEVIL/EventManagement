"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingList } from "@/components/booking/booking-card";
import { BlobBg } from "@/components/shared/blob-bg";
import { api } from "@/trpc/react";

type StatusTab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const utils = api.useUtils();

  const { data: bookings, isLoading } = api.booking.myBookings.useQuery({
    status: activeTab,
    limit: 20,
  });

  function handleMutated() {
    void utils.booking.myBookings.invalidate();
  }

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-sky-50/40" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500">
              Track and manage all your event bookings
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Status tabs ── */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as StatusTab)}
          className="space-y-6"
        >
          <TabsList className="h-auto w-full rounded-2xl bg-gray-100 p-1 sm:w-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Booking list ── */}
          <BookingList
            bookings={bookings}
            isLoading={isLoading}
            perspective="user"
            onMutated={handleMutated}
            emptyMessage={
              activeTab === "all"
                ? "You haven't made any bookings yet. Browse events to get started."
                : `No ${activeTab} bookings found.`
            }
          />
        </Tabs>
      </div>
    </div>
  );
}