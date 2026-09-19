import Link from "next/link";
import { ArrowLeft, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listing/listing-form";

export const metadata = { title: "New Listing" };

export default function NewListingPage() {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-200">
              <ListPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                Create New Listing
              </h1>
              <p className="text-sm text-gray-500">
                Fill in the details below. You can save as draft and publish later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <ListingForm />
      </div>
    </div>
  );
}