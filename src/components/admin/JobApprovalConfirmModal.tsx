"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";
import type { Job, JobApprovalStatus } from "@/lib/types";

type JobApprovalConfirmModalProps = {
  job: Job;
  action: Extract<JobApprovalStatus, "approved" | "rejected">;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY = {
  approved: {
    title: "求人を承認しますか？",
    description: "承認すると求職者向けに公開されます。",
    confirmLabel: "承認する",
    icon: Check,
    iconClass: "bg-emerald-100 text-emerald-600",
    confirmClass: "btn-primary",
  },
  rejected: {
    title: "求人を却下しますか？",
    description: "却下すると求職者向けには公開されません。",
    confirmLabel: "却下する",
    icon: X,
    iconClass: "bg-red-100 text-red-600",
    confirmClass:
      "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  },
} as const;

export default function JobApprovalConfirmModal({
  job,
  action,
  onClose,
  onConfirm,
}: JobApprovalConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const copy = COPY[action];
  const Icon = copy.icon;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, submitting]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("処理に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={submitting ? undefined : onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="modal-sheet staff-ui p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-approval-modal-title"
      >
        <div className="mb-1 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="mb-5 mt-2 flex flex-col items-center text-center">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${copy.iconClass}`}>
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h2 id="job-approval-modal-title" className="text-lg font-bold text-slate-900">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{copy.description}</p>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" showLogoBadge={false} />
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-medium text-slate-500">{job.company}</p>
            <p className="truncate font-semibold text-slate-900">{job.title}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {job.category} · {job.area || job.location}
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="staff-ui btn-secondary flex-1 justify-center py-2.5"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={submitting}
            className={`staff-ui flex flex-1 items-center justify-center gap-2 py-2.5 ${copy.confirmClass}`}
          >
            {submitting ? <ButtonSpinner /> : copy.confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
