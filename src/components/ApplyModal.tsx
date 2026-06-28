"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Formik } from "formik";
import { X, Send, CheckCircle } from "lucide-react";
import Link from "next/link";
import { FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { getProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { maxBirthdayForMinAge, minBirthdayForMaxAge } from "@/lib/birthday";
import { applySchema } from "@/lib/validation/schemas";
import type { Job } from "@/lib/types";

type ApplyModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
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
        className="modal-sheet p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="mb-5 mt-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {step === "form" ? "応募する" : "応募完了"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                        message: values.message,
                        applicantName: values.name,
                        applicantEmail: values.email,
                        applicantBirthday: values.birthday,
                        applicantArea: values.area,
                        applicantJobType: values.jobType,
                      }),
                    });
                    if (res.ok) {
                      setStep("done");
                      setTimeout(onSuccess, 3000);
                    } else {
                      const data = await res.json().catch(() => ({}));
                      setSubmitError(typeof data.error === "string" ? data.error : "応募に失敗しました");
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <Form className="space-y-4">
                  <FormTextInput name="name" label="氏名" />
                  <div className="grid grid-cols-2 gap-3">
                    <FormTextInput
                      name="birthday"
                      label="生年月日"
                      type="date"
                      min={minBirthdayForMaxAge(80)}
                      max={maxBirthdayForMinAge(18)}
                    />
                    <FormTextInput name="area" label="エリア" />
                  </div>
                  <FormTextInput name="jobType" label="希望職種" />
                  <FormTextInput name="email" label="メールアドレス" type="email" />
                  <FormTextarea name="message" label="志望動機（任意）" rows={3} />
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
                    <Send className="h-4 w-4" />
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
              <Link href="/chat" className="mt-4 text-sm font-medium text-[#2563EB]">
                チャットで企業に連絡する →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
