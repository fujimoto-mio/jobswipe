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
      <div className="profile-hero-card">
        <div className="profile-hero-banner-wrap relative min-h-[17rem] overflow-hidden">
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
              <div className="profile-hero-banner-actions">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading === "banner"}
                  className="profile-hero-media-btn"
                >
                  <Upload className="h-3.5 w-3.5" />
                  背景
                </button>
                {hasCustomBanner && (
                  <button
                    type="button"
                    onClick={() => void removeBanner()}
                    disabled={uploading === "banner"}
                    className="profile-hero-media-btn profile-hero-media-btn--icon"
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

          <div className="profile-hero-body relative z-10 !items-center !pb-5 !pt-10">
            <div className="profile-hero-avatar-wrap">
              <SeekerAvatar name={name} avatarUrl={displayAvatarUrl} size="hero" />
              {editable && (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading === "avatar"}
                    className="profile-hero-avatar-edit"
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

            <h2 className="profile-hero-name !text-white drop-shadow-md">{name}</h2>
            {bio ? (
              <p className="profile-hero-bio !max-w-none !text-white/85 drop-shadow">{bio}</p>
            ) : null}

            {children ? <div className="profile-hero-actions">{children}</div> : null}
          </div>
        </div>
      </div>

      {uploadError ? (
        <p role="alert" className="seeker-auth-alert seeker-auth-alert--error profile-hero-upload-error">
          {uploadError}
        </p>
      ) : null}
    </>
  );
}
