"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BlobBg } from "@/components/shared/blob-bg";
import { ImageUpload } from "@/components/shared/image-upload";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations";
import { getErrorMessage, initials } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { api } from "@/trpc/react";

export default function ProfilePage() {
  const { user, refetch } = useSession();
  const utils = api.useUtils();

  const { data: profile, isLoading } = api.user.me.useQuery();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      phone: "",
      city: "",
      image: "",
    },
  });

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        bio: (profile as any).bio ?? "",
        phone: (profile as any).phone ?? "",
        city: (profile as any).city ?? "",
        image: profile.image ?? "",
      });
    }
  }, [profile, form]);

  const mutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      void utils.user.me.invalidate();
      void refetch();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function onSubmit(data: UpdateProfileInput) {
    // Strip empty strings → undefined so DB doesn't store blanks
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v]),
    ) as UpdateProfileInput;
    mutation.mutate(cleaned);
  }

  const displayName = profile?.name ?? user?.name ?? "User";
  const displayImage = form.watch("image") || profile?.image || "";

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="relative isolate overflow-hidden border-b border-gray-100 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-200">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">
              Manage your personal information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ── Avatar card ── */}
              <Card className="border border-gray-100 shadow-sm">
                <div className="relative isolate overflow-hidden rounded-t-2xl">
                  <BlobBg variant="card" className="h-28" />
                </div>
                <div className="px-6 pb-6">
                  <div className="-mt-12 flex items-end gap-5">
                    {/* Avatar preview */}
                    <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                      <AvatarImage src={displayImage} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-black text-white">
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="pb-1">
                      <p className="text-lg font-black text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-400">{profile?.email}</p>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Avatar upload */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Photo</FormLabel>
                        <FormControl>
                          <ImageUpload
                            endpoint="avatar"
                            value={field.value ? [field.value] : []}
                            onChange={(urls) => field.onChange(urls[0] ?? "")}
                            maxImages={1}
                          />
                        </FormControl>
                        <FormDescription>
                          JPG, PNG or WEBP · Max 2 MB
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* ── Personal info card ── */}
              <Card className="border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-gray-900">
                  Personal Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bengaluru"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell vendors a bit about yourself and your event style…"
                            rows={3}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length ?? 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* ── Account info card (read-only) ── */}
              <Card className="border border-gray-100 p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-gray-900">
                  Account Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.email}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Role
                    </p>
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-700">
                      {(profile as any)?.role ?? "user"}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email Verified
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${profile?.emailVerified ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                    >
                      {profile?.emailVerified ? "✓ Verified" : "⚠ Not verified"}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* ── Save button ── */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={mutation.isPending || !form.formState.isDirty}
                  className="min-w-36 bg-violet-600 hover:bg-violet-700"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="border border-gray-100">
        <div className="h-28 rounded-t-2xl bg-gradient-to-br from-violet-100 to-indigo-100" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-5">
            <div className="h-24 w-24 rounded-full bg-gray-200 ring-4 ring-white" />
            <div className="space-y-2 pb-1">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-3.5 w-48 rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-5 h-px bg-gray-100" />
          <div className="mt-5 h-32 rounded-2xl bg-gray-100" />
        </div>
      </Card>
      <Card className="border border-gray-100 p-6">
        <div className="mb-5 h-5 w-40 rounded bg-gray-200" />
        <div className="grid gap-5 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-20 rounded bg-gray-100" />
              <div className="h-11 w-full rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}