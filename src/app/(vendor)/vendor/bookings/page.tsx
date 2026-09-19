"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingList } from "@/components/booking/booking-card";
import { api } from "@/trpc/react";

type StatusTab = "pending" | "confirmed" | "completed" | "cancelled" | "all";

const TABS: { value: StatusTab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export default function VendorBookingsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const utils = api.useUtils();

  const { data: bookings, isLoading } = api.booking.vendorBookings.useQuery({
    status: activeTab,
    limit: 30,
  });

  function handleMutated() {
    void utils.booking.vendorBookings.invalidate();
  }

  const pendingCount = bookings?.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white to-violet-50/40" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Bookings
            </h1>
            <p className="text-sm text-gray-500">
              Review, confirm, and manage client booking requests
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
                className="relative rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
              >
                {tab.label}
                {/* Pending badge */}
                {tab.value === "pending" &&
                  activeTab !== "pending" &&
                  (pendingCount ?? 0) > 0 && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
              </TabsTrigger>
            ))}
          </TabsList>

          <BookingList
            bookings={bookings}
            isLoading={isLoading}
            perspective="vendor"
            onMutated={handleMutated}
            emptyMessage={
              activeTab === "pending"
                ? "No pending requests right now. Share your listings to attract clients!"
                : `No ${activeTab} bookings found.`
            }
          />
        </Tabs>
      </div>
    </div>
  );
}