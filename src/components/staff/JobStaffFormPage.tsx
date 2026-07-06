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
import type { JobSubmissionContent } from "@/lib/types";

type JobStaffFormPageProps = {
  jobId: string;
};

export default function JobStaffFormPage({ jobId }: JobStaffFormPageProps) {
  const router = useRouter();
  const { basePath, role } = useStaffPanel();
  const isCompany = role === "company";

  const [job, setJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<JobSubmissionContent | null>(null);
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
        const loadedJob = d.job as Job;
        const loadedEditJob = (d.editJob as Job | undefined) ?? loadedJob;
        setJob(loadedJob);
        setEditJob(loadedEditJob);
        setPendingSubmission((d.pendingSubmission as JobSubmissionContent | null) ?? null);
        setVideoPreview(loadedEditJob.videoUrl || null);
      })
      .catch(() => router.replace(`${basePath}/jobs`))
      .finally(() => setLoading(false));
  }, [jobId, router, basePath]);

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

  const saveJob = async (
    values: ReturnType<typeof jobToFormValues>,
    setSubmitting: (value: boolean) => void,
    submit: boolean
  ) => {
    if (!job || !editJob) return;

    setUploadError(null);
    setSubmitting(true);

    try {
      let videoUrl = values.videoUrl?.trim() ?? "";

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "video");
      } else if (!videoCleared) {
        videoUrl = videoUrl || editJob.videoUrl;
      }

      const res = await apiFetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...jobFormValuesToBody(values, videoUrl), submit }),
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
  };

  if (loading || !job || !editJob) {
    return <PageLoading message="求人情報を読み込み中..." minHeight="min-h-[320px]" staff />;
  }

  const isActiveRevision = isCompany && job.approvalStatus === "Active";
  const canDraftSave =
    !isActiveRevision &&
    (job.approvalStatus === "Draft" ||
      job.approvalStatus === "Cancelled" ||
      job.approvalStatus === "Pending" ||
      role === "admin");

  return (
    <>
      <Link href={`${basePath}/jobs`} className="staff-back-link mb-6 inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="staff-page-header">
          <h1>{isActiveRevision ? "求人変更申請" : "求人編集"}</h1>
          <p>{editJob.title}</p>
        </div>
        <span className={`badge ${JOB_APPROVAL_BADGE_CLASS[job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[job.approvalStatus]}
        </span>
        {pendingSubmission && (
          <span className="badge badge-amber">変更申請中</span>
        )}
      </div>

      {isActiveRevision && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          承認されるまで求職者には現在公開中の内容が表示されます。
        </p>
      )}

      <Formik
        initialValues={jobToFormValues(editJob)}
        validationSchema={jobFormSchema}
        validationContext={{ companyLocked, hasCompanies: companies.length > 0 }}
        enableReinitialize
        onSubmit={() => {}}
      >
        {({ isSubmitting, values, setSubmitting, setFieldValue }) => (
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
              existingVideo={!videoFile && !videoCleared && Boolean(editJob.videoUrl && videoPreview)}
            />

            {isActiveRevision ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void saveJob(values, setSubmitting, true)}
                className="staff-ui btn-primary w-full py-3"
              >
                {isSubmitting ? "申請中..." : "変更を申請"}
              </button>
            ) : (
              <div className={canDraftSave ? "grid gap-3 sm:grid-cols-2" : ""}>
                {canDraftSave && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void saveJob(values, setSubmitting, false)}
                    className="staff-ui btn-secondary w-full py-3"
                  >
                    {isSubmitting ? "保存中..." : "下書き保存"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void saveJob(values, setSubmitting, true)}
                  className="btn-primary w-full py-3"
                >
                  {isSubmitting
                    ? "申請中..."
                    : job.approvalStatus === "Draft" || job.approvalStatus === "Cancelled"
                      ? "投稿申請"
                      : "変更を保存して申請"}
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </>
  );
}
