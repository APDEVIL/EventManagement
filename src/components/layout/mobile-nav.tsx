"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  ListPlus,
  Settings,
  Store,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MobileNavVariant = "user" | "vendor";

interface MobileNavProps {
  variant: MobileNavVariant;
}

const ITEMS = {
  user: [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/bookings", icon: BookOpen },
    { label: "Profile", href: "/profile", icon: User },
  ],
  vendor: [
    { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "Listings", href: "/vendor/listings", icon: Store },
    { label: "Add", href: "/vendor/listings/new", icon: ListPlus },
    { label: "Bookings", href: "/vendor/bookings", icon: BookOpen },
    { label: "Settings", href: "/vendor/profile", icon: Settings },
  ],
} satisfies Record<MobileNavVariant, { label: string; href: string; icon: typeof LayoutDashboard }[]>;

/**
 * Fixed bottom tab bar — only renders on mobile (hidden md:hidden).
 * Pair with the Sidebar which is hidden on mobile.
 */
export function MobileNav({ variant }: MobileNavProps) {
  const pathname = usePathname();
  const items = ITEMS[variant];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/90 backdrop-blur-lg md:hidden">
      <div className="flex items-stretch">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href.includes("new")
              ? pathname === item.href
              : !item.href.endsWith("dashboard") && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition-colors",
                isActive ? "text-violet-600" : "text-gray-400 hover:text-gray-700",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                  isActive && "bg-violet-100 shadow-sm shadow-violet-100",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-violet-600" : "text-gray-400",
                  )}
                />
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* iOS safe area spacer */}
      <div className="h-safe-bottom bg-white/90" />
    </nav>
  );
}