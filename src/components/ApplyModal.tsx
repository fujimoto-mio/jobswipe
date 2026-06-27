"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Formik } from "formik";
import { X, Send, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { getProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { formatDateTimeJST } from "@/lib/datetime";
import { applySchema } from "@/lib/validation/schemas";
import type { Job } from "@/lib/types";

type ApplyModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
};

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

export default function ApplyModal({ job, onClose, onSuccess }: ApplyModalProps) {
  const profile = getProfile();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "booking" | "done">("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const initialValues = {
    name: profile?.name ?? "",
    age: profile?.age ? String(profile.age) : "",
    area: profile?.area ?? "",
    jobType: profile?.desiredJobType ?? "",
    email: profile?.email ?? "",
    message: "",
  };

  const handleBookingComplete = useCallback(async (slot?: string) => {
    if (applicationId) {
      const interviewSlot =
        slot && !Number.isNaN(Date.parse(slot)) ? formatDateTimeJST(slot) : "calendly";
      await apiFetch("/api/applications", {
        method: "PUT",
        body: JSON.stringify({
          applicationId,
          interviewSlot,
        }),
      }).catch(() => {});
    }
    setBooked(true);
    setStep("done");
    setTimeout(onSuccess, 3000);
  }, [applicationId, onSuccess]);

  useEffect(() => {
    if (step !== "booking" || !CALENDLY_URL) return;

    const onMessage = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        const startTime = e.data?.payload?.event?.start_time as string | undefined;
        handleBookingComplete(startTime);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [step, handleBookingComplete]);

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
            {step === "form" && "応募する"}
            {step === "booking" && "面談日時を予約"}
            {step === "done" && "応募完了"}
          </h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200">
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
                        applicantAge: Number(values.age),
                        applicantArea: values.area,
                        applicantJobType: values.jobType,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setApplicationId(data.application?.id ?? null);
                      setStep("booking");
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
                    <FormTextInput name="age" label="年齢" type="number" />
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

          {step === "booking" && (
            <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {CALENDLY_URL ? (
                <>
                  <p className="mb-3 text-sm text-[#64748B]">
                    外部予約システム（Calendly）で面談日時を選択してください
                  </p>
                  <div className="mb-3 overflow-hidden rounded-xl border border-[#E2E8F0]">
                    <iframe
                      src={`${CALENDLY_URL}?hide_gdpr_banner=1`}
                      title="面談予約"
                      className="h-[420px] w-full"
                    />
                  </div>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary mb-2 w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                    新しいタブで開く
                  </a>
                  <button type="button" onClick={() => handleBookingComplete()} className="btn-primary w-full py-3">
                    予約を完了した
                  </button>
                  <button type="button" onClick={onSuccess} className="mt-2 w-full py-2 text-sm text-[#64748B]">
                    後で予約する
                  </button>
                </>
              ) : (
                <p className="text-sm text-amber-700">
                  NEXT_PUBLIC_CALENDLY_URL を設定してください。応募は完了しています。
                </p>
              )}
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="mb-3 h-12 w-12 text-emerald-500" />
              <p className="font-semibold text-[#1E293B]">応募が完了しました</p>
              {booked && <p className="mt-2 text-sm text-[#64748B]">面談予約が記録されました</p>}
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
