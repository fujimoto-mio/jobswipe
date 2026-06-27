"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Form, Formik } from "formik";
import { ArrowLeft, Upload, Video, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import JobFormFields from "@/components/form/JobFormFields";
import { FormTextInput } from "@/components/form/FormFields";
import { VIDEO_SPECS, validateVideoFileFull, formatFileSize } from "@/lib/video";
import type { Job } from "@/lib/types";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { jobFormSchema } from "@/lib/validation/schemas";
import { jobFormValuesToBody, jobToFormValues } from "@/lib/validation/job-form-utils";

async function uploadFile(file: File, type: "video" | "thumbnail"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  const res = await apiFetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "アップロードに失敗しました");
  return data.url as string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const { basePath } = useStaffPanel();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.role === "company") setCompanyLocked(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setJob(d.job);
        setVideoPreview(d.job.videoUrl);
        setThumbnailPreview(d.job.thumbnailUrl);
      })
      .catch(() => router.replace(`${basePath}/jobs`))
      .finally(() => setLoading(false));
  }, [jobId, router, basePath]);

  const handleThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("サムネイルは画像ファイルを選択してください");
      return;
    }
    setUploadError(null);
    setThumbnailFile(file);
    if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
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
    if (videoPreview?.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));
  };

  if (loading || !job) {
    return <PageLoading message="求人情報を読み込み中..." minHeight="min-h-[320px]" />;
  }

  return (
    <>
      <Link href={`${basePath}/jobs`} className="mb-6 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E293B]">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#1E293B]">求人編集</h1>
      <p className="mb-8 text-sm text-[#64748B]">{job.title}</p>

      <Formik
        initialValues={jobToFormValues(job)}
        validationSchema={jobFormSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setUploadError(null);
          setSubmitting(true);

          try {
            let videoUrl = values.videoUrl?.trim() || job.videoUrl;
            let thumbnailUrl = job.thumbnailUrl;

            if (videoFile) {
              videoUrl = await uploadFile(videoFile, "video");
            }

            if (thumbnailFile) {
              thumbnailUrl = await uploadFile(thumbnailFile, "thumbnail");
            }

            const res = await apiFetch(`/api/jobs/${jobId}`, {
              method: "PATCH",
              body: JSON.stringify(jobFormValuesToBody(values, videoUrl, thumbnailUrl)),
            });

            if (res.ok) {
              router.push(`${basePath}/jobs`);
            } else {
              const data = await res.json();
              setUploadError(data.error ?? "更新に失敗しました");
            }
          } catch (err) {
            setUploadError(err instanceof Error ? err.message : "更新に失敗しました");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <JobFormFields companyLocked={companyLocked} />

            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="font-medium text-[#1E293B]">サムネイル画像</h3>
              </div>

              <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-6 transition hover:bg-[#F8FAFC]">
                <Upload className="h-6 w-6 text-[#94A3B8]" />
                <span className="text-sm text-[#64748B]">新しいサムネイルをアップロード</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleThumbnailFile} />
              </label>

              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" />
              )}
            </div>

            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-[#2563EB]" />
                <h3 className="font-medium text-[#1E293B]">
                  求人動画（{VIDEO_SPECS.minDurationSec}〜{VIDEO_SPECS.maxDurationSec}秒）
                </h3>
              </div>

              <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-8 transition hover:bg-[#F8FAFC]">
                <Upload className="h-8 w-8 text-[#94A3B8]" />
                <span className="text-sm text-[#64748B]">新しい動画をアップロード</span>
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

              <FormTextInput name="videoUrl" label="動画URL" placeholder="https://..." />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? "保存中..." : "変更を保存"}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
}
