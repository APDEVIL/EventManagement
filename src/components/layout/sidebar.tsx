"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListPlus,
  LogOut,
  Settings,
  Shield,
  Star,
  Store,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { useSession, signOut } from "@/hooks/use-session";

// ─── Nav config per role ──────────────────────────────────────────────────────

const USER_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", href: "/bookings", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
];

const VENDOR_ITEMS = [
  { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "My Listings", href: "/vendor/listings", icon: Store },
  { label: "Add Listing", href: "/vendor/listings/new", icon: ListPlus },
  { label: "Bookings", href: "/vendor/bookings", icon: BookOpen },
  { label: "Profile", href: "/vendor/profile", icon: Settings },
];

const ADMIN_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Listings", href: "/admin/listings", icon: Store },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
];

type SidebarVariant = "user" | "vendor" | "admin";

interface SidebarProps {
  variant: SidebarVariant;
}

const NAV_MAP: Record<SidebarVariant, typeof USER_ITEMS> = {
  user: USER_ITEMS,
  vendor: VENDOR_ITEMS,
  admin: ADMIN_ITEMS,
};

const VARIANT_META: Record<SidebarVariant, { label: string; icon: typeof LayoutDashboard; color: string }> = {
  user: { label: "My Account", icon: User, color: "from-violet-500 to-purple-600" },
  vendor: { label: "Vendor Portal", icon: Store, color: "from-indigo-500 to-violet-600" },
  admin: { label: "Admin Panel", icon: Shield, color: "from-rose-500 to-pink-600" },
};

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const items = NAV_MAP[variant];
  const meta = VARIANT_META[variant];

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo + variant label */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
              meta.color,
            )}
          >
            <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="text-base font-extrabold tracking-tight text-gray-900">
              {APP_NAME}
            </span>
          )}
        </Link>
      </div>

      {/* Variant badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl bg-gradient-to-r px-3 py-2",
              `${meta.color} bg-opacity-10`,
            )}
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.08) 100%)",
            }}
          >
            <meta.icon className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">{meta.label}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/vendor/dashboard" &&
                item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-violet-50 text-violet-700 shadow-sm shadow-violet-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600",
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}

                  {/* Active indicator */}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-gray-100 p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2",
              collapsed && "justify-center",
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 ring-2 ring-violet-100">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                {initials(user.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => signOut("/")}
                title="Sign out"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "absolute -right-3 top-20 flex h-6 w-6 items-center justify-center",
          "rounded-full border border-gray-200 bg-white shadow-sm",
          "text-gray-400 transition-all hover:border-violet-300 hover:text-violet-600",
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}