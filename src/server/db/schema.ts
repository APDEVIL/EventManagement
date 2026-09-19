import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "vendor", "admin"]);

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "published",
  "suspended",
]);

export const listingCategoryEnum = pgEnum("listing_category", [
  "venue",
  "catering",
  "photography",
  "music",
  "decoration",
  "transportation",
  "planning",
  "other",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

// ─── Better-Auth required tables ──────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Extended fields
  role: userRoleEnum("role").notNull().default("user"),
  phone: text("phone"),
  bio: text("bio"),
  city: text("city"),
  isActive: boolean("is_active").notNull().default(true),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Vendor Profiles ──────────────────────────────────────────────────────────

export const vendorProfile = pgTable(
  "vendor_profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    category: listingCategoryEnum("category").notNull(),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    website: text("website"),
    city: text("city"),
    address: text("address"),
    isVerified: boolean("is_verified").notNull().default(false),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    totalReviews: integer("total_reviews").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("vendor_slug_idx").on(t.slug), index("vendor_user_idx").on(t.userId)],
);

// ─── Listings ─────────────────────────────────────────────────────────────────

export const listing = pgTable(
  "listing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendorProfile.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    category: listingCategoryEnum("category").notNull(),
    tags: text("tags").array().notNull().default([]),
    images: text("images").array().notNull().default([]),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    priceUnit: text("price_unit").notNull().default("event"), // per event, per hour, per person
    city: text("city"),
    address: text("address"),
    capacity: integer("capacity"),
    status: listingStatusEnum("status").notNull().default("draft"),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    totalReviews: integer("total_reviews").notNull().default(0),
    totalBookings: integer("total_bookings").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("listing_slug_idx").on(t.slug),
    index("listing_vendor_idx").on(t.vendorId),
    index("listing_category_idx").on(t.category),
    index("listing_status_idx").on(t.status),
  ],
);

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const booking = pgTable(
  "booking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendorProfile.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("pending"),
    eventDate: timestamp("event_date").notNull(),
    eventName: text("event_name").notNull(),
    guestCount: integer("guest_count"),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    vendorNotes: text("vendor_notes"),
    confirmedAt: timestamp("confirmed_at"),
    cancelledAt: timestamp("cancelled_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("booking_user_idx").on(t.userId),
    index("booking_vendor_idx").on(t.vendorId),
    index("booking_listing_idx").on(t.listingId),
    index("booking_status_idx").on(t.status),
  ],
);

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listing.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => booking.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1–5
    title: text("title"),
    body: text("body").notNull(),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("review_listing_idx").on(t.listingId),
    index("review_user_idx").on(t.userId),
  ],
);

// ─── Notifications ────────────────────────────────────────────────────────────

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // booking_confirmed, booking_cancelled, review_received, etc.
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    relatedId: text("related_id"), // bookingId or listingId etc.
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notification_user_idx").on(t.userId)],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  vendorProfile: one(vendorProfile, {
    fields: [user.id],
    references: [vendorProfile.userId],
  }),
  bookings: many(booking),
  reviews: many(review),
  notifications: many(notification),
  sessions: many(session),
  accounts: many(account),
}));

export const vendorProfileRelations = relations(
  vendorProfile,
  ({ one, many }) => ({
    user: one(user, {
      fields: [vendorProfile.userId],
      references: [user.id],
    }),
    listings: many(listing),
    bookings: many(booking),
  }),
);

export const listingRelations = relations(listing, ({ one, many }) => ({
  vendor: one(vendorProfile, {
    fields: [listing.vendorId],
    references: [vendorProfile.id],
  }),
  bookings: many(booking),
  reviews: many(review),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  listing: one(listing, {
    fields: [booking.listingId],
    references: [listing.id],
  }),
  user: one(user, {
    fields: [booking.userId],
    references: [user.id],
  }),
  vendor: one(vendorProfile, {
    fields: [booking.vendorId],
    references: [vendorProfile.id],
  }),
  review: one(review, {
    fields: [booking.id],
    references: [review.bookingId],
  }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  listing: one(listing, {
    fields: [review.listingId],
    references: [listing.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  booking: one(booking, {
    fields: [review.bookingId],
    references: [booking.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));