"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import JobFormFields, { type CompanyOption } from "@/components/form/JobFormFields";
import { validateVideoFileFull } from "@/lib/video";
import { JOB_APPROVAL_BADGE_CLASS, JOB_APPROVAL_LABELS } from "@/lib/constants";
import type { Job } from "@/lib/types";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { jobFormSchema } from "@/lib/validation/schemas";
import { jobFormValuesToBody, jobToFormValues } from "@/lib/validation/job-form-utils";
import JobVideoUploadField from "@/components/staff/JobVideoUploadField";
import { uploadFile } from "@/lib/upload-client";
type JobStaffFormPageProps = {
  jobId: string;
};

export default function JobStaffFormPage({ jobId }: JobStaffFormPageProps) {
  const router = useRouter();
  const { basePath, role } = useStaffPanel();
  const isCompany = role === "company";

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoCleared, setVideoCleared] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const meRes = await apiFetch("/api/admin/me");
        const me = await meRes.json();
        if (me.role === "company") {
          setCompanyLocked(true);
          return;
        }
        if (me.role === "admin") {
          const companiesRes = await apiFetch("/api/admin/companies");
          const data = await companiesRes.json();
          setCompanies(data.companies ?? []);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    apiFetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setJob(d.job);
        setVideoPreview(d.job.videoUrl || null);
      })
      .catch(() => router.replace(`${basePath}/jobs`))
      .finally(() => setLoading(false));
  }, [jobId, router, basePath]);

  useEffect(() => {
    if (!job || loading || !isCompany) return;
    if (job.approvalStatus === "Active") {
      router.replace(`${basePath}/jobs/${jobId}/view`);
    }
  }, [job, loading, isCompany, jobId, basePath, router]);

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
    setVideoCleared(false);
    if (videoPreview?.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));
  };

  const clearVideo = (setFieldValue: (field: string, value: string) => void) => {
    if (videoPreview?.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoCleared(true);
    setFieldValue("videoUrl", "");
    setUploadError(null);
  };

  if (loading || !job) {
    return <PageLoading message="求人情報を読み込み中..." minHeight="min-h-[320px]" staff />;
  }

  if (isCompany && job.approvalStatus === "Active") {
    return <PageLoading message="表示ページへ移動中..." minHeight="min-h-[320px]" staff />;
  }

  return (
    <>
      <Link href={`${basePath}/jobs`} className="staff-back-link mb-6 inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="staff-page-header">
          <h1>求人編集</h1>
          <p>{job.title}</p>
        </div>
        <span className={`badge ${JOB_APPROVAL_BADGE_CLASS[job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[job.approvalStatus]}
        </span>
      </div>

      <Formik
        initialValues={jobToFormValues(job)}
        validationSchema={jobFormSchema}
        validationContext={{ companyLocked, hasCompanies: companies.length > 0 }}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setUploadError(null);
          setSubmitting(true);

          try {
            let videoUrl = values.videoUrl?.trim() ?? "";

            if (videoFile) {
              videoUrl = await uploadFile(videoFile, "video");
            } else if (!videoCleared) {
              videoUrl = videoUrl || job.videoUrl;
            }

            const res = await apiFetch(`/api/jobs/${jobId}`, {
              method: "PATCH",
              body: JSON.stringify(jobFormValuesToBody(values, videoUrl)),
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
        {({ isSubmitting, setFieldValue }) => (
          <Form className="staff-ui space-y-5">
            <div className="staff-form-card space-y-5">
              <JobFormFields companyLocked={companyLocked} companies={companies} />
            </div>

            <JobVideoUploadField
              videoPreview={videoPreview}
              videoFile={videoFile}
              uploadError={uploadError}
              onVideoFile={handleVideoFile}
              onClearVideo={() => clearVideo(setFieldValue)}
              existingVideo={!videoFile && !videoCleared && Boolean(job.videoUrl && videoPreview)}
            />

            <button type="submit" disabled={isSubmitting} className="staff-ui btn-primary w-full py-3">
              {isSubmitting ? "保存中..." : "変更を保存"}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
}
