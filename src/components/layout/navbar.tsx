"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Store,
  User,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { APP_NAME, PUBLIC_NAV } from "@/lib/constants";
import { useSession, signOut } from "@/hooks/use-session";
import { SearchBar } from "@/components/shared/search-bar";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isVendor, isAdmin, isPending } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll to switch between transparent and frosted glass
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const isHeroPage = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || !isHeroPage
            ? "border-b border-white/10 bg-[#2D1B69]/90 shadow-lg shadow-violet-950/20 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-md shadow-violet-900/40">
              <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop public nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Compact search — hidden on hero, visible on scroll / other pages */}
          <div
            className={cn(
              "hidden flex-1 max-w-sm transition-all duration-300 lg:block",
              isHeroPage && !scrolled ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <SearchBar compact />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
            ) : isAuthenticated && user ? (
              <UserMenu
                user={user}
                isVendor={isVendor}
                isAdmin={isAdmin}
              />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <MobileMenu
        open={mobileOpen}
        isAuthenticated={isAuthenticated}
        isVendor={isVendor}
        isAdmin={isAdmin}
        user={user}
        pathname={pathname}
      />
    </>
  );
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({
  user,
  isVendor,
  isAdmin,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  isVendor: boolean;
  isAdmin: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="bg-violet-600 text-xs font-bold text-white">
              {initials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate sm:block">
            {user.name ?? user.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-violet-100 bg-white/95 shadow-xl shadow-violet-950/10 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-violet-500" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex cursor-pointer items-center gap-2">
            <User className="h-4 w-4 text-violet-500" />
            Profile
          </Link>
        </DropdownMenuItem>

        {isVendor && (
          <DropdownMenuItem asChild>
            <Link href="/vendor/dashboard" className="flex cursor-pointer items-center gap-2">
              <Store className="h-4 w-4 text-violet-500" />
              Vendor Portal
            </Link>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex cursor-pointer items-center gap-2">
              <Shield className="h-4 w-4 text-violet-500" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut("/")}
          className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Auth buttons ─────────────────────────────────────────────────────────────

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
      >
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="rounded-full bg-white font-semibold text-violet-700 shadow-md shadow-violet-900/30 hover:bg-violet-50"
      >
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  );
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  isAuthenticated,
  isVendor,
  isAdmin,
  user,
  pathname,
}: {
  open: boolean;
  isAuthenticated: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
  pathname: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-[#2D1B69]/95 backdrop-blur-xl transition-all duration-300 md:hidden",
        open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
        <SearchBar compact className="mb-4" />

        {PUBLIC_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}

        <div className="my-3 border-t border-white/10" />

        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="bg-violet-600 text-xs font-bold text-white">
                  {initials(user.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-white/50">{user.email}</p>
              </div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/profile" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              <User className="h-4 w-4" /> Profile
            </Link>
            {isVendor && (
              <Link href="/vendor/dashboard" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <Store className="h-4 w-4" /> Vendor Portal
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/dashboard" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <Shield className="h-4 w-4" /> Admin Panel
              </Link>
            )}
            <button
              onClick={() => signOut("/")}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-white font-semibold text-violet-700 hover:bg-violet-50">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}