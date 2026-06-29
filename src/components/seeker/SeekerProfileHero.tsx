"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, Upload, X } from "lucide-react";
import SeekerAvatar from "@/components/chat/SeekerAvatar";
import { apiFetch } from "@/lib/api-client";
import { saveProfile } from "@/lib/profile";
import { DEFAULT_SEEKER_BANNER } from "@/lib/job-image";
import { uploadFile } from "@/lib/upload-client";
import { getUploadValidationError } from "@/lib/upload/validation";
import type { UserProfile } from "@/lib/types";

type SeekerProfileHeroProps = {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  name: string;
  bio?: string;
  children?: ReactNode;
  editable?: boolean;
};

export default function SeekerProfileHero({
  profile,
  onProfileUpdate,
  name,
  bio,
  children,
  editable = true,
}: SeekerProfileHeroProps) {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"banner" | "avatar" | null>(null);
  const [uploadError, setUploadError] = useState("");

  const displayBannerUrl = bannerPreview ?? profile.bannerUrl;
  const displayAvatarUrl = avatarPreview ?? profile.avatarUrl;
  const hasCustomBanner = Boolean(displayBannerUrl?.trim());
  const bannerImageUrl = displayBannerUrl?.trim() || DEFAULT_SEEKER_BANNER;

  async function persistProfile(patch: Partial<UserProfile>) {
    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(typeof data.error === "string" ? data.error : "保存に失敗しました");
    }
    const data = await res.json();
    saveProfile(data.profile);
    onProfileUpdate(data.profile);
    return data.profile as UserProfile;
  }

  async function handleBannerFile(file: File | null) {
    if (!file || !editable) return;
    setUploadError("");
    const validationError = getUploadValidationError(file, "seeker-banner");
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setBannerPreview(URL.createObjectURL(file));
    setUploading("banner");
    try {
      const url = await uploadFile(file, "seeker-banner");
      await persistProfile({ bannerUrl: url });
      setBannerPreview(null);
    } catch (error) {
      setBannerPreview(null);
      setUploadError(error instanceof Error ? error.message : "背景画像のアップロードに失敗しました");
    } finally {
      setUploading(null);
    }
  }

  async function handleAvatarFile(file: File | null) {
    if (!file || !editable) return;
    setUploadError("");
    const validationError = getUploadValidationError(file, "seeker-avatar");
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setUploading("avatar");
    try {
      const url = await uploadFile(file, "seeker-avatar");
      await persistProfile({ avatarUrl: url });
      setAvatarPreview(null);
    } catch (error) {
      setAvatarPreview(null);
      setUploadError(error instanceof Error ? error.message : "アバターのアップロードに失敗しました");
    } finally {
      setUploading(null);
    }
  }

  async function removeBanner() {
    if (!editable || uploading) return;
    setUploadError("");
    setUploading("banner");
    try {
      await persistProfile({ bannerUrl: "" });
      setBannerPreview(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "背景画像の削除に失敗しました");
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      <div className="relative mb-2 min-h-[17rem] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${bannerImageUrl}")` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#fe2c55]/10 to-white"
        aria-hidden
      />

      {editable && (
        <>
          <div className="absolute right-3 top-3 z-20 flex gap-1.5">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading === "banner"}
              className="inline-flex items-center gap-1 rounded-full border-0 bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-[#161823] shadow-md transition active:scale-95 disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              背景
            </button>
            {hasCustomBanner && (
              <button
                type="button"
                onClick={() => void removeBanner()}
                disabled={uploading === "banner"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-white/90 text-[#161823] shadow-md transition active:scale-95 disabled:opacity-60"
                aria-label="背景画像を削除"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleBannerFile(file);
              event.target.value = "";
            }}
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center px-4 pb-5 pt-10">
        <div className="relative">
          <SeekerAvatar name={name} avatarUrl={displayAvatarUrl} size="hero" />
          {editable && (
            <>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading === "avatar"}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#161823] text-white shadow-md transition active:scale-95 disabled:opacity-60"
                aria-label="プロフィール写真を変更"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void handleAvatarFile(file);
                  event.target.value = "";
                }}
              />
            </>
          )}
        </div>

        <h2 className="mt-3 text-lg font-extrabold tracking-tight text-white drop-shadow-md">{name}</h2>
        {bio ? (
          <p className="mt-1 max-w-[18rem] truncate text-[13px] font-medium text-white/85 drop-shadow">
            {bio}
          </p>
        ) : null}

        {children ? (
          <div className="mt-4 flex w-full max-w-xs flex-col items-center">{children}</div>
        ) : null}
      </div>
    </div>

      {uploadError ? (
        <div
          role="alert"
          className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm font-medium text-red-600"
        >
          {uploadError}
        </div>
      ) : null}
    </>
  );
}
