import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// ─── User profile ─────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d\s()-]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  city: z.string().max(100).optional(),
  image: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Vendor profile ───────────────────────────────────────────────────────────

export const vendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(120),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "venue",
    "catering",
    "photography",
    "music",
    "decoration",
    "transportation",
    "planning",
    "other",
  ]),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  city: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
});

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;

// ─── Listing ──────────────────────────────────────────────────────────────────

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title is too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3000, "Description is too long"),
  category: z.enum([
    "venue",
    "catering",
    "photography",
    "music",
    "decoration",
    "transportation",
    "planning",
    "other",
  ]),
  tags: z.array(z.string().max(30)).max(10).default([]),
  images: z.array(z.string().url()).max(10).default([]),
  basePrice: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(10_000_000, "Price is too high"),
  priceUnit: z
    .enum(["event", "hour", "person", "day", "package"])
    .default("event"),
  city: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  capacity: z
    .number()
    .positive()
    .int("Capacity must be a whole number")
    .optional(),                          // ✅ removed .nullable()
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ListingInput = z.infer<typeof listingSchema>;

// ─── Booking ──────────────────────────────────────────────────────────────────

export const bookingSchema = z.object({
  listingId: z.string().uuid(),
  eventDate: z
    .date({ message: "Event date is required" })
    .refine((d) => d > new Date(), {
      message: "Event date must be in the future",
    }),
  eventName: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(150),
  guestCount: z
    .number()
    .positive("Guest count must be positive")
    .int()
    .optional(),
  notes: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ─── Review ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z.string().max(120).optional(),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1500, "Review is too long"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ─── Search / filter ──────────────────────────────────────────────────────────

export const listingFilterSchema = z.object({
  search: z.string().optional(),
  category: z
    .enum([
      "venue",
      "catering",
      "photography",
      "music",
      "decoration",
      "transportation",
      "planning",
      "other",
    ])
    .optional(),
  city: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  sortBy: z
    .enum(["newest", "price_asc", "price_desc", "rating"])
    .default("newest"),
});

export type ListingFilterInput = z.infer<typeof listingFilterSchema>;

// ─── Vendor cancel / confirm ──────────────────────────────────────────────────

export const bookingActionSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type BookingActionInput = z.infer<typeof bookingActionSchema>;