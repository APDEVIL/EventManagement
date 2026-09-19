"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/shared/image-upload";
import { vendorProfileSchema, type VendorProfileInput } from "@/lib/validations";
import { CATEGORIES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { api } from "@/trpc/react";

interface VendorProfileFormProps {
  /** Pass existing profile to switch to "update" mode */
  defaultValues?: Partial<VendorProfileInput>;
  onSuccess?: () => void;
}

export function VendorProfileForm({
  defaultValues,
  onSuccess,
}: VendorProfileFormProps) {
  const isEdit = !!defaultValues;
  const utils = api.useUtils();

  const form = useForm<VendorProfileInput>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      businessName: "",
      description: "",
      category: "venue",
      logoUrl: "",
      bannerUrl: "",
      website: "",
      city: "",
      address: "",
      ...defaultValues,
    },
  });

  const createMutation = api.vendor.create.useMutation({
    onSuccess: () => {
      toast.success("Vendor profile created! Welcome to Evenza.");
      void utils.vendor.myProfile.invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = api.vendor.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      void utils.vendor.myProfile.invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: VendorProfileInput) {
    // Strip empty optional string fields so DB doesn't store empty strings
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v]),
    ) as VendorProfileInput;

    if (isEdit) {
      updateMutation.mutate(cleaned);
    } else {
      createMutation.mutate(cleaned);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Basic info ── */}
        <section className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Business Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This is what clients see when they discover your profile.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Golden Moments Photography"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://yourwebsite.com"
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
                    <Input placeholder="Bengaluru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full business address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Your Business</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell potential clients what makes your services unique..."
                    rows={4}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/1000 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* ── Branding ── */}
        <section className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Branding</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a logo and banner to make your profile stand out.
            </p>
          </div>

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    endpoint="vendorBranding"
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? "")}
                    maxImages={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bannerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    endpoint="vendorBranding"
                    value={field.value ? [field.value] : []}
                    onChange={(urls) => field.onChange(urls[0] ?? "")}
                    maxImages={1}
                  />
                </FormControl>
                <FormDescription>
                  Recommended: 1200×400px. Displayed at the top of your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-32 bg-violet-600 hover:bg-violet-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Create Profile"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}