"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Video, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { AREAS, JOB_CATEGORIES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { VIDEO_SPECS, validateVideoFileFull, formatFileSize } from "@/lib/video";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";

async function uploadFile(file: File, type: "video" | "thumbnail"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await apiFetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "アップロードに失敗しました");
  return data.url as string;
}

export default function NewJobPage() {
  const router = useRouter();
  const { basePath } = useStaffPanel();
  const [submitting, setSubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyLocked, setCompanyLocked] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.role === "company" && d.companyName) {
          setCompanyName(d.companyName);
          setCompanyLocked(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("サムネイルは画像ファイルを選択してください");
      return;
    }
    setUploadError(null);
    setThumbnailFile(file);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateVideoFileFull(file);
    if (!validation.ok) {
      setUploadError(validation.message);
      return;
    }

    setUploadError(null);
    setVideoFile(file);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadError(null);

    try {
      const form = new FormData(e.currentTarget);
      let videoUrl = form.get("videoUrl") as string;

      if (videoFile) {
        setUploading(true);
        videoUrl = await uploadFile(videoFile, "video");
      }

      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        setUploading(true);
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnail");
      }
      setUploading(false);

      if (!videoUrl) {
        setUploadError("動画ファイルまたは動画URLを指定してください");
        setSubmitting(false);
        return;
      }

      const body = {
        title: form.get("title"),
        company: form.get("company"),
        location: form.get("location"),
        area: form.get("area"),
        category: form.get("category"),
        salary: form.get("salary"),
        employmentType: form.get("employmentType"),
        description: form.get("description"),
        requirements: (form.get("requirements") as string)
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        benefits: (form.get("benefits") as string)
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        videoUrl,
        thumbnailUrl,
        tags: (form.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean),
        links: {
          website: (form.get("website") as string) || undefined,
          careersPage: (form.get("careersPage") as string) || undefined,
          twitter: (form.get("twitter") as string) || undefined,
          instagram: (form.get("instagram") as string) || undefined,
          linkedin: (form.get("linkedin") as string) || undefined,
          jobPdf: (form.get("jobPdf") as string) || undefined,
        },
      };

      const res = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push(`${basePath}/jobs`);
      } else {
        const data = await res.json();
        setUploadError(data.error ?? "登録に失敗しました");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <>
      <Link href={`${basePath}/jobs`} className="mb-6 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E293B]">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#1E293B]">求人登録</h1>
      <p className="mb-8 text-sm text-[#64748B]">動画付き求人を新規登録（管理者審査後に公開）</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">求人タイトル *</span>
            <input name="title" required className="input-field" placeholder="フロントエンドエンジニア" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">会社名 *</span>
            <input
              name="company"
              required
              readOnly={companyLocked}
              value={companyName}
              onChange={(e) => {
                if (!companyLocked) setCompanyName(e.target.value);
              }}
              className={`input-field ${companyLocked ? "bg-[#F8FAFC] text-[#64748B]" : ""}`}
              placeholder="株式会社〇〇"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">勤務地 *</span>
            <input name="location" required className="input-field" placeholder="東京都渋谷区" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">エリア *</span>
            <select name="area" required className="input-field">
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">年収 *</span>
            <input name="salary" required className="input-field" placeholder="年収 500万〜800万円" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">職種 *</span>
            <select name="category" required className="input-field">
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm text-[#64748B]">雇用形態</span>
          <select name="employmentType" className="input-field">
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-[#64748B]">仕事内容 *</span>
          <textarea name="description" required rows={4} className="input-field resize-none" placeholder="仕事内容を入力..." />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-[#64748B]">必須条件（1行1項目）</span>
          <textarea name="requirements" rows={4} className="input-field resize-none" placeholder={"3年以上の開発経験\nReact/TypeScriptの実務経験"} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-[#64748B]">福利厚生（1行1項目）</span>
          <textarea name="benefits" rows={3} className="input-field resize-none" placeholder={"リモートワーク可\nフレックスタイム制"} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-[#64748B]">タグ（カンマ区切り）</span>
          <input name="tags" className="input-field" placeholder="React, リモート可, フレックス" />
        </label>

        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <h3 className="mb-3 font-medium text-[#1E293B]">リンク設定</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="website" className="input-field" placeholder="企業HP URL" />
            <input name="careersPage" className="input-field" placeholder="採用ページ URL" />
            <input name="twitter" className="input-field" placeholder="Twitter / X URL" />
            <input name="instagram" className="input-field" placeholder="Instagram URL" />
            <input name="linkedin" className="input-field" placeholder="LinkedIn URL" />
            <input name="jobPdf" className="input-field" placeholder="求人票PDF URL" />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#2563EB]" />
            <h3 className="font-medium text-[#1E293B]">サムネイル画像（任意）</h3>
          </div>

          <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-6 transition hover:bg-[#F8FAFC]">
            <Upload className="h-6 w-6 text-[#94A3B8]" />
            <span className="text-sm text-[#64748B]">JPEG / PNG を選択</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleThumbnailFile} />
          </label>

          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" />
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-[#2563EB]" />
            <h3 className="font-medium text-[#1E293B]">求人動画（{VIDEO_SPECS.minDurationSec}〜{VIDEO_SPECS.maxDurationSec}秒）</h3>
          </div>

          <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-8 transition hover:bg-[#F8FAFC]">
            <Upload className="h-8 w-8 text-[#94A3B8]" />
            <span className="text-sm text-[#64748B]">MP4/WebM を選択（Supabase Storage にアップロード）</span>
            <input type="file" accept="video/mp4,video/webm,video/*" className="hidden" onChange={handleVideoFile} />
          </label>

          {uploadError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {uploadError}
            </div>
          )}

          {videoFile && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {videoFile.name} ({formatFileSize(videoFile.size)})
            </div>
          )}

          {videoPreview && (
            <video src={videoPreview} controls playsInline className="mb-4 w-full rounded-xl" />
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm text-[#64748B]">または動画URL</span>
            <input
              name="videoUrl"
              className="input-field"
              placeholder="https://..."
            />
          </label>
        </div>

        <button type="submit" disabled={submitting || uploading} className="btn-primary w-full py-3">
          {uploading ? "動画アップロード中..." : submitting ? "登録中..." : "求人を申請（審査待ち）"}
        </button>
      </form>
    </>
  );
}
