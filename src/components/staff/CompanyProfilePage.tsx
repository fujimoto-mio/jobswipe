"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import CompanyLogo from "@/components/chat/CompanyLogo";
import StaffAvatar from "@/components/chat/StaffAvatar";
import CompanyProfilePageSkeleton from "@/components/staff/CompanyProfilePageSkeleton";
import { FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-client";
import { companyProfileSchema } from "@/lib/validation/schemas";
import type { JobLinks } from "@/lib/types";

type CompanyProfile = {
  role: "company";
  email: string;
  name: string | null;
  avatarUrl: string | null;
  companyId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  companyBannerUrl: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyPostalCode: string | null;
  companyAddress: string | null;
  companyCareersPage: string | null;
  companyTwitter: string | null;
  companyInstagram: string | null;
  companyLinkedin: string | null;
};

const EDIT_TOC_ITEMS = [
  { id: "edit-header", label: "ヘッダー" },
  { id: "edit-overview", label: "企業概要" },
  { id: "edit-business", label: "事業内容" },
  { id: "edit-details", label: "会社情報" },
  { id: "edit-staff", label: "担当者" },
] as const;

const DEFAULT_COMPANY_BANNER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80";

function companyBannerStyle(bannerUrl?: string | null): CSSProperties {
  const imageUrl = bannerUrl?.trim() || DEFAULT_COMPANY_BANNER;
  return {
    backgroundImage: `linear-gradient(135deg, rgb(15 23 42 / 0.35), rgb(15 23 42 / 0.08)), url("${imageUrl}")`,
  };
}

function formatWebsiteHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function formatPostalCodeDisplay(postalCode: string | null | undefined) {
  const trimmed = postalCode?.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 7) return `〒${digits.slice(0, 3)}-${digits.slice(3)}`;
  return trimmed.startsWith("〒") ? trimmed : `〒${trimmed}`;
}

function buildMapEmbedUrl(address: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
}

function CompanyAddressMap({ address, companyName }: { address: string; companyName: string }) {
  const trimmed = address.trim();
  if (!trimmed) return null;

  return (
    <div className="company-profile-map mt-3">
      <iframe
        title={`${companyName}の所在地`}
        src={buildMapEmbedUrl(trimmed)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="company-profile-map-frame"
      />
    </div>
  );
}

function splitForForm(description: string | null | undefined) {
  const text = description?.trim() ?? "";
  if (!text) return { overview: "", business: "" };

  const blocks = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  if (blocks.length >= 2) {
    return { overview: blocks[0], business: blocks.slice(1).join("\n\n") };
  }

  return { overview: text, business: "" };
}

function combineDescription(overview: string, business: string) {
  const o = overview.trim();
  const b = business.trim();
  if (o && b) return `${o}\n\n${b}`;
  return o || b;
}

function splitCompanyDescription(description: string | null | undefined) {
  const text = description?.trim() ?? "";
  if (!text) return { overview: "", business: "" };

  const blocks = text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  if (blocks.length >= 2) {
    return { overview: blocks[0], business: blocks.slice(1).join("\n\n") };
  }

  if (text.length <= 320) {
    return { overview: text, business: text };
  }

  const sentenceBreak = text.lastIndexOf("。", 320);
  const splitAt = sentenceBreak > 120 ? sentenceBreak + 1 : 320;
  return {
    overview: text.slice(0, splitAt).trim(),
    business: text,
  };
}

function shouldCollapseBusiness(text: string) {
  return text.length > 420 || text.split("\n").length > 8;
}

const PROFILE_LINK_ITEMS = [
  { key: "careersPage", label: "採用ページ" },
  { key: "twitter", label: "Twitter / X" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
] as const satisfies ReadonlyArray<{ key: keyof JobLinks; label: string }>;

function profileToLinks(profile: CompanyProfile): JobLinks {
  return {
    careersPage: profile.companyCareersPage ?? undefined,
    twitter: profile.companyTwitter ?? undefined,
    instagram: profile.companyInstagram ?? undefined,
    linkedin: profile.companyLinkedin ?? undefined,
  };
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { loginPath } = useStaffPanel();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [businessExpanded, setBusinessExpanded] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setProfile)
      .catch(() => router.replace(loginPath))
      .finally(() => setLoading(false));
  }, [router, loginPath]);

  if (loading || !profile) {
    return (
      <div className="company-profile-page">
        <div className="staff-page-header mb-8">
          <h1>プロフィール</h1>
          <p>求職者に表示される企業紹介ページ</p>
        </div>
        <CompanyProfilePageSkeleton />
      </div>
    );
  }

  const contactName = profile.name?.trim() || profile.email.split("@")[0];
  const companyName = profile.companyName?.trim() || "未設定";
  const websiteHref = profile.companyWebsite ? formatWebsiteHref(profile.companyWebsite) : "";
  const { overview, business } = splitCompanyDescription(profile.companyDescription);
  const showBusinessToggle = shouldCollapseBusiness(business);
  const businessPreview = showBusinessToggle && !businessExpanded ? `${business.slice(0, 420).trim()}…` : business;
  const profileLinks = profileToLinks(profile);

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUploadError("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleLogoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoUploadError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("画像ファイル（JPEG / PNG / WebP）を選択してください");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError("ロゴは2MB以下にしてください");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearBannerSelection = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerUploadError("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const removeBanner = () => {
    clearBannerSelection();
    setBannerRemoved(true);
  };

  const handleBannerFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setBannerUploadError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBannerUploadError("画像ファイル（JPEG / PNG / WebP）を選択してください");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBannerUploadError("背景画像は5MB以下にしてください");
      return;
    }

    setBannerRemoved(false);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUploadError("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarUploadError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("画像ファイル（JPEG / PNG / WebP）を選択してください");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError("アバターは2MB以下にしてください");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const startEditing = () => {
    clearLogoSelection();
    clearBannerSelection();
    setBannerRemoved(false);
    clearAvatarSelection();
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    clearLogoSelection();
    clearBannerSelection();
    setBannerRemoved(false);
    clearAvatarSelection();
    setSaveError("");
    setEditing(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="company-profile-page">
      <div className="staff-page-header mb-8">
        <h1>プロフィール</h1>
        <p>{editing ? "求職者向けページの編集" : "求職者に表示される企業紹介ページのプレビュー"}</p>
      </div>

      {saveError && <p className="staff-alert staff-alert--error mb-4">{saveError}</p>}

      {editing ? (
        <Formik
          initialValues={{
            name: profile.name ?? "",
            companyName: profile.companyName ?? "",
            website: profile.companyWebsite ?? "",
            postalCode: profile.companyPostalCode ?? "",
            address: profile.companyAddress ?? "",
            careersPage: profile.companyCareersPage ?? "",
            twitter: profile.companyTwitter ?? "",
            instagram: profile.companyInstagram ?? "",
            linkedin: profile.companyLinkedin ?? "",
            ...splitForForm(profile.companyDescription),
          }}
          validationSchema={companyProfileSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setSaveError("");
            setLogoUploadError("");
            setBannerUploadError("");
            setAvatarUploadError("");
            try {
              let companyLogoUrl: string | null | undefined;
              let companyBannerUrl: string | null | undefined;
              let avatarUrl: string | null | undefined;
              if (logoFile) {
                companyLogoUrl = await uploadFile(logoFile, "company-logo");
              }
              if (bannerFile) {
                companyBannerUrl = await uploadFile(bannerFile, "company-banner");
              } else if (bannerRemoved) {
                companyBannerUrl = null;
              }
              if (avatarFile) {
                avatarUrl = await uploadFile(avatarFile, "staff-avatar");
              }

              const payload: Record<string, string | null> = {
                name: values.name,
                companyName: values.companyName,
                website: values.website,
                postalCode: values.postalCode,
                address: values.address,
                careersPage: values.careersPage,
                twitter: values.twitter,
                instagram: values.instagram,
                linkedin: values.linkedin,
                description: combineDescription(values.overview, values.business),
              };
              if (companyLogoUrl !== undefined) payload.companyLogoUrl = companyLogoUrl;
              if (companyBannerUrl !== undefined) payload.companyBannerUrl = companyBannerUrl;
              if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl;

              const res = await apiFetch("/api/admin/me", {
                method: "PATCH",
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (res.ok) {
                setProfile(data);
                clearLogoSelection();
                clearBannerSelection();
                setBannerRemoved(false);
                clearAvatarSelection();
                setEditing(false);
              } else {
                setSaveError(typeof data.error === "string" ? data.error : "保存に失敗しました");
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "アップロードに失敗しました";
              if (bannerFile) setBannerUploadError(message);
              else if (avatarFile && !logoFile) setAvatarUploadError(message);
              else setLogoUploadError(message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, submitForm }) => {
            const editCompanyName = values.companyName.trim() || "未設定";
            const editWebsiteHref = values.website ? formatWebsiteHref(values.website) : "";
            const editBannerUrl = bannerRemoved ? null : (bannerPreview ?? profile.companyBannerUrl);
            const hasCustomBanner = Boolean(bannerPreview || (profile.companyBannerUrl && !bannerRemoved));

            return (
              <Form>
                <section id="edit-header" className="company-profile-hero company-profile-section">
                  <div className="company-profile-hero-banner-wrap">
                    <div
                      className="company-profile-hero-banner"
                      style={companyBannerStyle(editBannerUrl)}
                      aria-hidden
                    />
                    <div className="company-profile-banner-actions">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="company-profile-banner-action-btn"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        背景
                      </button>
                      {hasCustomBanner && (
                        <button
                          type="button"
                          onClick={removeBanner}
                          className="company-profile-banner-action-btn"
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
                      onChange={handleBannerFile}
                    />
                  </div>
                  <div className="company-profile-hero-body">
                    <div className="company-profile-hero-logo-wrap">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt=""
                          className="company-profile-hero-logo object-cover"
                        />
                      ) : (
                        <CompanyLogo
                          company={editCompanyName}
                          logoUrl={profile.companyLogoUrl}
                          size="lg"
                          className="company-profile-hero-logo"
                        />
                      )}
                      <div className="company-profile-logo-actions">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="company-profile-logo-action-btn"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          ロゴ
                        </button>
                        {(logoPreview || profile.companyLogoUrl) && (
                          <button
                            type="button"
                            onClick={clearLogoSelection}
                            className="company-profile-logo-action-btn"
                            aria-label="ロゴ選択解除"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleLogoFile}
                      />
                    </div>
                    <div className="company-profile-hero-meta company-profile-hero-meta--edit">
                      <FormTextInput
                        name="companyName"
                        label="会社名"
                        placeholder="株式会社サンプル"
                        className="company-profile-hero-field"
                      />
                      <FormTextInput
                        name="website"
                        label="コーポレートサイト"
                        placeholder="https://example.com"
                        className="company-profile-hero-field"
                      />
                      {editWebsiteHref ? (
                        <a
                          href={editWebsiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-profile-hero-link"
                        >
                          プレビューを開く
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                  {logoUploadError && (
                    <p className="staff-alert staff-alert--error px-5 pb-4">{logoUploadError}</p>
                  )}
                  {bannerUploadError && (
                    <p className="staff-alert staff-alert--error px-5 pb-4">{bannerUploadError}</p>
                  )}
                </section>

                <div className="company-profile-layout">
                  <main>
                    <section id="edit-overview" className="company-profile-section company-profile-edit-section">
                      <div className="company-profile-section-header">
                        <h2 className="company-profile-section-title">企業概要</h2>
                        <p className="company-profile-edit-lead">
                          求職者向けページの「企業概要」に表示されます。
                        </p>
                      </div>
                      <div className="company-profile-section-body">
                        <FormTextarea
                          name="overview"
                          label=" "
                          rows={5}
                          placeholder="ミッション・会社の想い・採用方針など"
                          className="company-profile-edit-textarea"
                        />
                      </div>
                    </section>

                    <section id="edit-business" className="company-profile-section company-profile-edit-section">
                      <div className="company-profile-section-header">
                        <h2 className="company-profile-section-title">事業内容</h2>
                        <p className="company-profile-edit-lead">
                          求職者向けページの「事業内容」に表示されます。
                        </p>
                      </div>
                      <div className="company-profile-section-body">
                        <FormTextarea
                          name="business"
                          label=" "
                          rows={8}
                          placeholder="提供サービス・プロダクト・事業領域など"
                          className="company-profile-edit-textarea"
                        />
                      </div>
                    </section>

                    <section id="edit-details" className="company-profile-section company-profile-edit-section">
                      <div className="company-profile-section-header">
                        <h2 className="company-profile-section-title">会社情報</h2>
                        <p className="company-profile-edit-lead">
                          社名とサイトURLはヘッダーで編集できます。郵便番号・所在地・採用ページやSNSのリンクは求職者向けページに表示されます。
                        </p>
                      </div>
                      <div className="company-profile-section-body">
                        <div className="company-profile-info-table mb-4">
                        <div className="company-profile-info-row">
                          <div className="company-profile-info-label">社名</div>
                          <div className="company-profile-info-value">{editCompanyName}</div>
                        </div>
                        <div className="company-profile-info-row">
                          <div className="company-profile-info-label">コーポレートサイト</div>
                          <div className="company-profile-info-value">
                            {editWebsiteHref ? (
                              <span className="break-all text-blue-600">{values.website}</span>
                            ) : (
                              <span className="company-profile-text--muted">未設定</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <FormTextInput
                          name="postalCode"
                          label="郵便番号"
                          placeholder="150-0051"
                          autoComplete="postal-code"
                        />
                        <FormTextInput
                          name="address"
                          label="所在地"
                          placeholder="東京都渋谷区..."
                          autoComplete="street-address"
                        />
                        <CompanyAddressMap address={values.address} companyName={editCompanyName} />
                        <div className="grid gap-4 border-t border-[var(--staff-border)] pt-4 md:grid-cols-2">
                          <FormTextInput
                            name="careersPage"
                            label="採用ページ URL"
                            placeholder="https://..."
                          />
                          <FormTextInput name="twitter" label="Twitter / X URL" placeholder="https://..." />
                          <FormTextInput name="instagram" label="Instagram URL" placeholder="https://..." />
                          <FormTextInput name="linkedin" label="LinkedIn URL" placeholder="https://..." />
                        </div>
                      </div>
                      </div>
                    </section>
                  </main>

                  <aside className="company-profile-sidebar">
                    <section id="edit-staff" className="company-profile-side-card company-profile-edit-section">
                      <h3 className="company-profile-side-card-title">担当者（チャット）</h3>
                      <p className="company-profile-edit-lead mb-3">
                        メッセージ送信時に求職者へ表示されます。
                      </p>
                      <div className="space-y-4">
                        <div>
                          <span className="mb-2 block text-sm font-medium text-[var(--staff-text-secondary)]">
                            担当者アバター
                          </span>
                          <div className="company-profile-staff-row">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt=""
                                className="h-12 w-12 shrink-0 rounded-full border border-[var(--staff-border)] object-cover"
                              />
                            ) : (
                              <StaffAvatar
                                name={values.name || contactName}
                                avatarUrl={profile.avatarUrl}
                                size="lg"
                              />
                            )}
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                写真
                              </button>
                              {(avatarPreview || profile.avatarUrl) && (
                                <button
                                  type="button"
                                  onClick={clearAvatarSelection}
                                  className="btn-ghost inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--staff-text-secondary)]"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleAvatarFile}
                          />
                          {avatarUploadError && (
                            <p className="mt-2 text-xs text-red-400">{avatarUploadError}</p>
                          )}
                        </div>
                        <FormTextInput name="name" label="担当者名" placeholder="採用 太郎" autoComplete="name" />
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-[var(--staff-text-secondary)]">
                            メールアドレス
                          </span>
                          <input
                            type="email"
                            value={profile.email}
                            readOnly
                            className="input-field text-sm"
                          />
                        </label>
                      </div>
                    </section>

                    <div className="company-profile-side-card company-profile-edit-actions">
                      <button
                        type="button"
                        onClick={() => submitForm()}
                        disabled={isSubmitting}
                        className="btn-primary w-full py-2.5 text-sm"
                      >
                        {isSubmitting ? "保存中..." : "保存する"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="btn-secondary mt-2 w-full py-2.5 text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </aside>
                </div>
              </Form>
            );
          }}
        </Formik>
      ) : (
        <>
          <section className="company-profile-hero" aria-label="企業ヘッダー">
            <div
              className="company-profile-hero-banner"
              style={companyBannerStyle(profile.companyBannerUrl)}
              aria-hidden
            />
            <div className="company-profile-hero-body">
              <CompanyLogo
                company={companyName}
                logoUrl={profile.companyLogoUrl}
                size="lg"
                className="company-profile-hero-logo"
              />
              <div className="company-profile-hero-meta">
                <h1 className="company-profile-hero-title">{companyName}</h1>
                {websiteHref ? (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="company-profile-hero-link"
                  >
                    {profile.companyWebsite}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="company-profile-hero-muted">コーポレートサイト未設定</p>
                )}
              </div>
              <div className="company-profile-hero-actions">
                <button type="button" onClick={startEditing} className="btn-ghost company-profile-action-link shrink-0">
                  <Pencil className="h-4 w-4" />
                  編集
                </button>
              </div>
            </div>
          </section>

          <div className="company-profile-layout">
            <main>
              <section id="company-overview" className="company-profile-section">
                <div className="company-profile-section-header">
                  <h2 className="company-profile-section-title">企業概要</h2>
                </div>
                <div className="company-profile-section-body">
                  {overview ? (
                    <p className="company-profile-text">{overview}</p>
                  ) : (
                    <p className="company-profile-text company-profile-text--muted">
                      企業概要が未入力です。編集から紹介文の1段落目を追加してください。
                    </p>
                  )}
                </div>
              </section>

              <section id="company-business" className="company-profile-section">
                <div className="company-profile-section-header">
                  <h2 className="company-profile-section-title">事業内容</h2>
                </div>
                <div className="company-profile-section-body">
                  {business ? (
                    <>
                      <p className="company-profile-text">{businessPreview}</p>
                      {showBusinessToggle && (
                        <button
                          type="button"
                          onClick={() => setBusinessExpanded((prev) => !prev)}
                          className="company-profile-expand inline-flex items-center gap-1"
                        >
                          {businessExpanded ? "閉じる" : "もっと見る"}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${businessExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="company-profile-text company-profile-text--muted">
                      事業内容が未入力です。編集から2段落目以降に事業内容を追加してください。
                    </p>
                  )}
                </div>
              </section>

              <section id="company-details" className="company-profile-section">
                <div className="company-profile-section-header">
                  <h2 className="company-profile-section-title">会社情報</h2>
                </div>
                <div className="company-profile-section-body">
                <div className="company-profile-info-table">
                  <div className="company-profile-info-row">
                    <div className="company-profile-info-label">社名</div>
                    <div className="company-profile-info-value">{companyName}</div>
                  </div>
                  <div className="company-profile-info-row">
                    <div className="company-profile-info-label">コーポレートサイト</div>
                    <div className="company-profile-info-value">
                      {websiteHref ? (
                        <a
                          href={websiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-profile-hero-link inline-flex items-center gap-1 font-medium hover:underline"
                        >
                          {profile.companyWebsite}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="company-profile-text--muted">未設定</span>
                      )}
                    </div>
                  </div>
                  <div className="company-profile-info-row">
                    <div className="company-profile-info-label">郵便番号</div>
                    <div className="company-profile-info-value">
                      {profile.companyPostalCode ? (
                        formatPostalCodeDisplay(profile.companyPostalCode)
                      ) : (
                        <span className="company-profile-text--muted">未設定</span>
                      )}
                    </div>
                  </div>
                  <div className="company-profile-info-row">
                    <div className="company-profile-info-label">所在地</div>
                    <div className="company-profile-info-value">
                      {profile.companyAddress?.trim() ? (
                        <>
                          <p>{profile.companyAddress}</p>
                          <CompanyAddressMap address={profile.companyAddress} companyName={companyName} />
                        </>
                      ) : (
                        <span className="company-profile-text--muted">未設定</span>
                      )}
                    </div>
                  </div>
                  {PROFILE_LINK_ITEMS.map(({ key, label }) => {
                    const href = profileLinks[key];
                    if (!href) return null;
                    return (
                      <div key={key} className="company-profile-info-row">
                        <div className="company-profile-info-label">{label}</div>
                        <div className="company-profile-info-value">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="company-profile-hero-link inline-flex items-start gap-1.5 break-all font-medium hover:underline"
                          >
                            <span>{href}</span>
                            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </section>
            </main>

            <aside className="company-profile-sidebar">
              <div className="company-profile-side-card">
                <h3 className="company-profile-side-card-title">担当者（チャット）</h3>
                <div className="company-profile-staff-row">
                  <StaffAvatar name={contactName} avatarUrl={profile.avatarUrl} size="lg" />
                  <div className="company-profile-staff-meta">
                    <p className="company-profile-staff-name">{contactName}</p>
                    <p className="company-profile-staff-note">メッセージ送信時に表示</p>
                  </div>
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div>
                    <dt className="company-profile-meta-label">メール</dt>
                    <dd className="company-profile-meta-value">{profile.email}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
