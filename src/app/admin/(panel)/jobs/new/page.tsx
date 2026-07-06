"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Formik } from "formik";
import { ArrowLeft } from "lucide-react";
import JobFormFields, { type CompanyOption } from "@/components/form/JobFormFields";
import { validateVideoFileFull } from "@/lib/video";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { jobFormSchema } from "@/lib/validation/schemas";
import { emptyJobFormValues, jobFormValuesToBody } from "@/lib/validation/job-form-utils";
import JobVideoUploadField from "@/components/staff/JobVideoUploadField";
import { uploadFile } from "@/lib/upload-client";

export default function NewJobPage() {
  const router = useRouter();
  const { basePath } = useStaffPanel();
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [initialCompany, setInitialCompany] = useState("");
  const [initialCompanyId, setInitialCompanyId] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const meRes = await apiFetch("/api/admin/me");
        const me = await meRes.json();
        if (me.role === "company" && me.companyName) {
          setInitialCompany(me.companyName);
          if (me.companyId) setInitialCompanyId(me.companyId);
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

  const clearVideo = (setFieldValue: (field: string, value: string) => void) => {
    if (videoPreview?.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    setFieldValue("videoUrl", "");
    setUploadError(null);
  };

  const saveJob = async (
    values: typeof emptyJobFormValues,
    setSubmitting: (value: boolean) => void,
    submit: boolean
  ) => {
    setUploadError(null);
    setSubmitting(true);

    try {
      let videoUrl = values.videoUrl?.trim() ?? "";

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "video");
      }

      const res = await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ ...jobFormValuesToBody(values, videoUrl), submit }),
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
    }
  };

  return (
    <>
      <Link href={`${basePath}/jobs`} className="staff-back-link mb-6 inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <div className="staff-page-header mb-8">
        <h1>求人登録</h1>
        <p>下書き保存後、投稿申請すると管理者の承認後に公開されます</p>
      </div>

      <Formik
        initialValues={{
          ...emptyJobFormValues,
          company: initialCompany,
          companyId: initialCompanyId || emptyJobFormValues.companyId,
        }}
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
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void saveJob(values, setSubmitting, false)}
                className="staff-ui btn-secondary w-full py-3"
              >
                {isSubmitting ? "保存中..." : "下書き保存"}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void saveJob(values, setSubmitting, true)}
                className="btn-primary w-full py-3"
              >
                {isSubmitting ? "申請中..." : "投稿申請"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
