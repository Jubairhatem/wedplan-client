"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Store,
  User as UserIcon,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { uploadToImgBB } from "@/lib/imgbb";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),
  businessName: z
    .string()
    .max(120, "Business name cannot exceed 120 characters")
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  businessName?: string | null;
  subscriptionPlan?: string;
}

function getInitials(name?: string) {
  if (!name) return "WP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileSettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", businessName: "" },
  });

  useEffect(() => {
    if (isPending) return;

    async function loadProfile() {
      try {
        const res = await fetchAPI<ProfileUser>("/users/me", {
          withAuth: true,
        });
        if (res.data) {
          setProfile(res.data);
          setImageUrl(res.data.image || "");
          reset({
            name: res.data.name || "",
            businessName: res.data.businessName || "",
          });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load your profile"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [isPending, reset]);

  const role = profile?.role || (session?.user as { role?: string })?.role;

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setImageUrl(url);
      toast.success("Avatar uploaded — save your profile to apply it");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload the image"
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { name: data.name };
      if (imageUrl) payload.image = imageUrl;
      if (role === "vendor" && data.businessName !== undefined) {
        payload.businessName = data.businessName;
      }

      const res = await fetchAPI<ProfileUser>("/users/me", {
        method: "PATCH",
        withAuth: true,
        body: JSON.stringify(payload),
      });

      if (res.data) {
        setProfile(res.data);
        setImageUrl(res.data.image || "");
      }
      await refetch?.();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update your profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Profile Settings"
        description="Keep your account details up to date. Your role and subscription are managed by WedPlan."
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Identity card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage src={imageUrl} alt={profile?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-card disabled:opacity-60 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="min-w-0">
              <p className="font-heading text-xl font-bold truncate">
                {profile?.name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{profile?.email}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {role || "customer"}
                </Badge>
                {role === "vendor" && (
                  <Badge variant="outline" className="capitalize gap-1">
                    <Store className="w-3 h-3" />
                    {profile?.subscriptionPlan || "free"} plan
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Editable form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  className="pl-9"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {role === "vendor" && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="businessName"
                    placeholder="Your wedding business name"
                    className="pl-9"
                    aria-invalid={!!errors.businessName}
                    {...register("businessName")}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-destructive">
                    {errors.businessName.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                readOnly
                disabled
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                Your email is used for sign-in and cannot be changed here.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                For security, your account role, subscription plan and block
                status can only be changed by a WedPlan administrator.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSaving || isUploading} className="gap-2">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
