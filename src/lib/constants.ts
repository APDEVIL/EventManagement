import {
  Building2,
  Camera,
  Car,
  type LucideIcon,
  Music,
  Palette,
  Sparkles,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: "venue", label: "Venues", icon: Building2, color: "violet" },
  { value: "catering", label: "Catering", icon: UtensilsCrossed, color: "amber" },
  { value: "photography", label: "Photography", icon: Camera, color: "sky" },
  { value: "music", label: "Music & DJ", icon: Music, color: "pink" },
  { value: "decoration", label: "Decoration", icon: Palette, color: "emerald" },
  { value: "transportation", label: "Transport", icon: Car, color: "blue" },
  { value: "planning", label: "Planning", icon: Wand2, color: "purple" },
  { value: "other", label: "Other", icon: Sparkles, color: "gray" },
] as const satisfies {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}[];

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string): LucideIcon {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? Sparkles;
}

// ─── Price units ──────────────────────────────────────────────────────────────

export const PRICE_UNITS = [
  { value: "event", label: "Per Event" },
  { value: "hour", label: "Per Hour" },
  { value: "person", label: "Per Person" },
  { value: "day", label: "Per Day" },
  { value: "package", label: "Package" },
] as const;

export type PriceUnit = (typeof PRICE_UNITS)[number]["value"];

// ─── Booking statuses ─────────────────────────────────────────────────────────

export const BOOKING_STATUS = {
  pending: {
    label: "Pending",
    color: "amber",
    description: "Awaiting vendor confirmation",
  },
  confirmed: {
    label: "Confirmed",
    color: "emerald",
    description: "Vendor has accepted your request",
  },
  cancelled: {
    label: "Cancelled",
    color: "red",
    description: "This booking was cancelled",
  },
  completed: {
    label: "Completed",
    color: "sky",
    description: "Event has taken place",
  },
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUS;

// ─── Listing statuses ─────────────────────────────────────────────────────────

export const LISTING_STATUS = {
  draft: { label: "Draft", color: "gray" },
  published: { label: "Published", color: "emerald" },
  suspended: { label: "Suspended", color: "red" },
} as const;

export type ListingStatus = keyof typeof LISTING_STATUS;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const PUBLIC_NAV = [
  { label: "Events", href: "/events" },
  { label: "Vendors", href: "/vendors" },
] as const;

export const USER_NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Profile", href: "/profile" },
] as const;

export const VENDOR_NAV = [
  { label: "Dashboard", href: "/vendor/dashboard" },
  { label: "My Listings", href: "/vendor/listings" },
  { label: "Bookings", href: "/vendor/bookings" },
  { label: "Profile", href: "/vendor/profile" },
] as const;

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Reviews", href: "/admin/reviews" },
] as const;

// ─── Sort options ─────────────────────────────────────────────────────────────

export const LISTING_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export type ListingSortOption = (typeof LISTING_SORT_OPTIONS)[number]["value"];

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_PAGE_SIZE_ADMIN = 20;

// ─── Limits ───────────────────────────────────────────────────────────────────

export const MAX_LISTING_IMAGES = 10;
export const MAX_BIO_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 3000;
export const MAX_REVIEW_LENGTH = 1500;

// ─── App metadata ─────────────────────────────────────────────────────────────

export const APP_NAME = "Evenza";
export const APP_TAGLINE = "Plan your perfect event. Find the best vendors.";
export const APP_DESCRIPTION =
  "Evenza connects event planners with top-rated vendors across all categories — from stunning venues to expert caterers, photographers, and more.";

// ─── Brand colors (used in blob-bg, hero, SVG decorations) ───────────────────

export const BRAND_COLORS = {
  deep: "#2D1B69",
  mid: "#5B4FCF",
  light: "#A78BFA",
  sky: "#7EC8E3",
  blob: "#C7B8F5",
  blobDark: "#7C3AED",
  gradient: "linear-gradient(135deg, #2D1B69 0%, #5B4FCF 45%, #7EC8E3 100%)",
} as const;

// ─── Rating thresholds ────────────────────────────────────────────────────────

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function getRatingLabel(rating: number): string {
  return RATING_LABELS[Math.round(rating)] ?? "Unrated";
}