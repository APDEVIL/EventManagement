"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  ShieldOff,
  Store,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime, initials } from "@/lib/utils";
import { api } from "@/trpc/react";

type RoleFilter = "all" | "user" | "vendor" | "admin";

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const utils = api.useUtils();

  const { data: users, isLoading } = api.admin.listUsers.useQuery({
    role: roleFilter,
    limit: 50,
  });

  const setActiveMutation = api.admin.setUserActive.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? "User activated." : "User deactivated.");
      void utils.admin.listUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const setRoleMutation = api.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated.");
      void utils.admin.listUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const ROLE_BADGE: Record<string, string> = {
    admin: "bg-violet-100 text-violet-700 border-violet-200",
    vendor: "bg-sky-100 text-sky-700 border-sky-200",
    user: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-200">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Users</h1>
              <p className="text-sm text-gray-500">
                Manage user accounts and permissions
              </p>
            </div>
          </div>

          {/* Role filter */}
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
            <SelectTrigger className="w-40 rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="vendor">Vendors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-gray-100 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                <TableHead className="w-64">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="ml-auto h-8 w-8 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                : users?.map((u) => {
                    const role = (u as any).role as string ?? "user";
                    const isActive = (u as any).isActive !== false;

                    return (
                      <TableRow key={u.id} className="hover:bg-gray-50/40">
                        {/* User cell */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-gray-100">
                              <AvatarImage src={u.image ?? ""} />
                              <AvatarFallback className="bg-violet-100 text-xs font-bold text-violet-700">
                                {initials(u.name ?? "U")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {u.name}
                              </p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[role] ?? ROLE_BADGE.user}`}
                          >
                            {role}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="text-sm text-gray-500">
                          {formatRelativeTime(u.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 rounded-lg p-0"
                              >
                                <span className="text-gray-400">•••</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl"
                            >
                              <DropdownMenuLabel className="text-xs text-gray-400">
                                Change Role
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleMutation.mutate({
                                    userId: u.id,
                                    role: "user",
                                  })
                                }
                                disabled={role === "user"}
                              >
                                <User className="mr-2 h-4 w-4" /> Set as User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleMutation.mutate({
                                    userId: u.id,
                                    role: "vendor",
                                  })
                                }
                                disabled={role === "vendor"}
                              >
                                <Store className="mr-2 h-4 w-4" /> Set as Vendor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleMutation.mutate({
                                    userId: u.id,
                                    role: "admin",
                                  })
                                }
                                disabled={role === "admin"}
                              >
                                <Shield className="mr-2 h-4 w-4" /> Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setActiveMutation.mutate({
                                    userId: u.id,
                                    isActive: !isActive,
                                  })
                                }
                                className={
                                  isActive ? "text-red-600 focus:text-red-600" : "text-emerald-600 focus:text-emerald-600"
                                }
                              >
                                {isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>

          {!isLoading && !users?.length && (
            <p className="py-12 text-center text-sm text-gray-400">
              No users found for the selected filter.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}