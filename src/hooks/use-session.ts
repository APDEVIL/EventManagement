"use client";

import { authClient } from "@/server/better-auth/client";

/**
 * useSession — wraps better-auth's authClient.useSession()
 *
 * better-auth does NOT export useSession from "better-auth/react" directly.
 * The hook lives on the client instance created by createAuthClient().
 *
 * Role is read from session.user as an additionalField — better-auth
 * surfaces additionalFields on the session object at runtime even though
 * the base TypeScript type doesn't include them, so we narrow with a cast.
 */
export function useSession() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const user = session?.user ?? null;

  // additionalFields are present at runtime but not in the base TS type,
  // so we cast through unknown to access them safely.
  const userWithRole = user as (typeof user & { role?: string; isActive?: boolean }) | null;
  const role = userWithRole?.role ?? "user";

  return {
    session,
    user: userWithRole,
    isPending,
    error,
    refetch,
    isAuthenticated: !!user,
    isUser: role === "user",
    isVendor: role === "vendor",
    isAdmin: role === "admin",
    role,
  };
}

// ─── Sign-out helper ──────────────────────────────────────────────────────────

export async function signOut(redirectTo = "/") {
  await authClient.signOut();
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}