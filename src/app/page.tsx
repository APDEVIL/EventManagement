import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Star, Store, Zap } from "lucide-react";

import { HydrateClient, api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { SearchBar } from "@/components/shared/search-bar";
import { BlobBg } from "@/components/shared/blob-bg";
import { CATEGORIES, APP_NAME } from "@/lib/constants";
import { FeaturedListings } from "./_components/featured-listings";
import { TopVendors } from "./_components/top-vendors";

export default async function HomePage() {
  void api.listing.list.prefetch({
    sortBy: "rating",
    limit: 8,
  });
  void api.vendor.list.prefetch({
    verifiedOnly: true,
    limit: 4,
  });

  return (
    <HydrateClient>
      <main>
        {/* ══ Hero ══ */}
        <PageHero
          size="lg"
          cityscape
          title={
            <>
              Plan Your{" "}
              <span className="text-violet-200 [text-shadow:0_0_40px_rgba(167,139,250,0.6)]">
                Perfect
              </span>
              <br />
              Event
            </>
          }
          subtitle="Discover top-rated venues, caterers, photographers and more — all in one place. From intimate gatherings to grand celebrations."
          actions={
            <div className="w-full max-w-3xl">
              <SearchBar />
            </div>
          }
        />

        {/* ══ Category strip ══ */}
        <section className="border-b border-gray-100 bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Browse by Category
              </h2>
              <Link
                href="/events"
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/events?category=${cat.value}`}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/50"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 transition-colors group-hover:bg-violet-100">
                    <cat.icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <span className="text-center text-xs font-semibold text-gray-700 group-hover:text-violet-700">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Featured listings ══ */}
        <section className="py-16 bg-gray-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Top Rated"
              title="Featured Services"
              description="Handpicked listings with the highest ratings from verified vendors."
              href="/events"
              linkLabel="Browse all listings"
            />
            <FeaturedListings />
          </div>
        </section>

        {/* ══ How it works ══ */}
        <HowItWorks />

        {/* ══ Top vendors ══ */}
        <section className="bg-gray-50/60 py-16" id="vendors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label="Verified Vendors"
              title="Trusted by Thousands"
              description="Every vendor on our platform is reviewed and verified by our team."
              href="/vendors"
              linkLabel="See all vendors"
            />
            <TopVendors />
          </div>
        </section>

        {/* ══ Stats strip ══ */}
        <StatsStrip />

        {/* ══ Bottom CTA ══ */}
        <BottomCTA />
      </main>
    </HydrateClient>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Search & Discover",
      description:
        "Browse thousands of verified vendors by category, location, and budget.",
    },
    {
      icon: Star,
      step: "02",
      title: "Compare & Choose",
      description:
        "Read real reviews, compare packages, and shortlist your favourites.",
    },
    {
      icon: Zap,
      step: "03",
      title: "Book Instantly",
      description:
        "Send a booking request in seconds. No phone calls, no hassle.",
    },
    {
      icon: CheckCircle2,
      step: "04",
      title: "Enjoy Your Event",
      description:
        "Your vendor handles the rest. Leave a review to help others.",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden py-20" id="how-it-works">
      <BlobBg variant="section" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Simple Process"
          title="How It Works"
          description="From discovery to your dream event in four simple steps."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-violet-100/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/50"
            >
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-8 z-10 hidden h-px w-6 bg-gradient-to-r from-violet-200 to-transparent lg:block" />
              )}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-200">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-3xl font-black text-violet-100 group-hover:text-violet-200 transition-colors">
                  {s.step}
                </span>
              </div>
              <h3 className="mb-1.5 font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { value: "10,000+", label: "Events Planned" },
    { value: "500+", label: "Verified Vendors" },
    { value: "4.9★", label: "Average Rating" },
    { value: "50+", label: "Cities Covered" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#2D1B69] py-14">
      <BlobBg variant="section" className="opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-white [text-shadow:0_0_30px_rgba(167,139,250,0.5)]">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-violet-300/80">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

function BottomCTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1B69] via-[#5B4FCF] to-[#7EC8E3] px-8 py-16 shadow-2xl shadow-violet-900/30">
          <BlobBg variant="auth" className="opacity-30" />
          <div className="relative z-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-300">
              Are you a vendor?
            </p>
            <h2 className="mb-4 text-4xl font-black text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.3)]">
              Grow Your Business with {APP_NAME}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base text-violet-100/80">
              Join hundreds of vendors already connecting with clients.
              List your services for free and start receiving bookings today.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 font-bold text-violet-700 shadow-lg hover:bg-violet-50"
              >
                <Link href="/sign-up">Become a Vendor</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full border border-white/20 text-white hover:bg-white/10"
              >
                <Link href="/vendors">
                  Explore Vendors <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  description,
  href,
  linkLabel,
}: {
  label: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-violet-500">
          {label}
        </p>
        <h2 className="text-3xl font-black text-gray-900">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}