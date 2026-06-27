"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { formatDateTimeJST } from "@/lib/datetime";
import type { Job } from "@/lib/types";

type ApplyModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
};

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

export default function ApplyModal({ job, onClose, onSuccess }: ApplyModalProps) {
  const profile = getProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [area, setArea] = useState(profile?.area ?? "");
  const [jobType, setJobType] = useState(profile?.desiredJobType ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "booking" | "done">("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(profile.age?.toString() ?? "");
      setArea(profile.area);
      setJobType(profile.desiredJobType);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          jobId: job.id,
          message,
          applicantName: name,
          applicantEmail: email,
          applicantAge: Number(age),
          applicantArea: area,
          applicantJobType: jobType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplicationId(data.application?.id ?? null);
        setStep("booking");
      }
    } finally {
      setSubmitting(false);
    }
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
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">氏名</span>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-[#64748B]">年齢</span>
                  <input type="number" className="input-field" value={age} onChange={(e) => setAge(e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-[#64748B]">エリア</span>
                  <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} required />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm text-[#64748B]">希望職種</span>
                <input className="input-field" value={jobType} onChange={(e) => setJobType(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#64748B]">メールアドレス</span>
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#64748B]">志望動機（任意）</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="input-field resize-none" />
              </label>
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
                <Send className="h-4 w-4" />
                {submitting ? "送信中..." : "応募を送信"}
              </button>
            </motion.form>
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
