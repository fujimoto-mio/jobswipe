"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Formik } from "formik";
import { X, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { FormBirthdayInput, FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";
import { getProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { mapUserFacingError } from "@/lib/auth/errors";
import { applySchema } from "@/lib/validation/schemas";
import type { Application, JobFeedItem } from "@/lib/types";

type ApplyModalProps = {
  job: JobFeedItem;
  onClose: () => void;
  onSuccess: (application?: Application) => void;
};

export default function ApplyModal({ job, onClose, onSuccess }: ApplyModalProps) {
  const profile = getProfile();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const [submitError, setSubmitError] = useState("");

  const initialValues = {
    name: profile?.name ?? "",
    birthday: profile?.birthday ?? "",
    area: profile?.area ?? "",
    jobType: profile?.desiredJobType ?? "",
    email: profile?.email ?? "",
    message: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="apply-modal-panel modal-sheet relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-30 h-0 overflow-visible">
          <button
            type="button"
            onClick={onClose}
            className="apply-modal-close absolute right-4 top-[max(0.5rem,env(safe-area-inset-top,0px))] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--seeker-border,#e2e8f0)] bg-white text-[var(--seeker-text,#0f172a)] shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition active:scale-95"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="apply-modal-content px-6 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-3">
          <div className="mb-3 flex justify-center sm:hidden">
            <div className="apply-modal-handle h-1 w-10 rounded-full bg-slate-200" />
          </div>

          <h2 className="mb-5 pr-12 text-lg font-bold text-slate-900">
            {step === "form" ? "応募する" : "応募完了"}
          </h2>

          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{job.company}</p>
            <p className="mt-0.5 font-semibold text-slate-900">{job.title}</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {submitError && (
                  <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                    {submitError}
                  </p>
                )}
                <Formik
                  initialValues={initialValues}
                  validationSchema={applySchema}
                  enableReinitialize
                  onSubmit={async (values) => {
                    setSubmitting(true);
                    setSubmitError("");
                    try {
                      const res = await apiFetch("/api/applications", {
                        method: "POST",
                        body: JSON.stringify({
                          jobId: job.id,
                          message: values.message.trim(),
                          applicantName: values.name.trim(),
                          applicantEmail: values.email.trim(),
                          applicantBirthday: values.birthday,
                          applicantArea: values.area.trim(),
                          applicantJobType: values.jobType.trim(),
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json().catch(() => ({}));
                        setStep("done");
                        setTimeout(() => onSuccess(data.application), 3000);
                      } else {
                        const data = await res.json().catch(() => ({}));
                        setSubmitError(
                          typeof data.error === "string" ? mapUserFacingError(data.error) : "応募に失敗しました"
                        );
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <Form className="space-y-4">
                    <FormTextInput name="name" label="氏名" />
                    <FormBirthdayInput name="birthday" label="生年月日" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormTextInput name="area" label="エリア" />
                      <FormTextInput name="jobType" label="希望職種" />
                    </div>
                    <FormTextInput name="email" label="メールアドレス" type="email" />
                    <FormTextarea
                      name="message"
                      label="志望動機（任意）"
                      rows={4}
                      maxLength={2000}
                      placeholder="この求人に興味を持った理由や、活かせる経験などを記入してください"
                      className="textarea-content"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex w-full items-center justify-center gap-2"
                    >
                      {submitting ? <ButtonSpinner /> : <Send className="h-4 w-4" />}
                      {submitting ? "送信中..." : "応募を送信"}
                    </button>
                  </Form>
                </Formik>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <CheckCircle className="mb-3 h-12 w-12 text-emerald-500" />
                <p className="font-semibold text-[#1E293B]">応募が完了しました</p>
                <Link href="/chat" className="btn-primary mt-4 px-6 py-2.5 text-sm">
                  チャットで企業に連絡する
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
