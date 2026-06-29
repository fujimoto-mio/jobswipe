"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ban, RotateCcw } from "lucide-react";
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";
import type { AdminSeekerRow } from "@/lib/db/admin-seekers";

type SeekerSuspendConfirmModalProps = {
  seeker: AdminSeekerRow;
  action: "suspend" | "restore";
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY = {
  suspend: {
    title: "アカウントを停止しますか？",
    description: "停止すると求職者はログインおよび応募・チャットなどの操作ができなくなります。",
    confirmLabel: "停止する",
    icon: Ban,
    iconClass: "bg-red-100 text-red-600",
    confirmClass:
      "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  },
  restore: {
    title: "アカウントを復元しますか？",
    description: "復元すると求職者は再びサービスを利用できるようになります。",
    confirmLabel: "復元する",
    icon: RotateCcw,
    iconClass: "bg-emerald-100 text-emerald-600",
    confirmClass: "btn-primary",
  },
} as const;

export default function SeekerSuspendConfirmModal({
  seeker,
  action,
  onClose,
  onConfirm,
}: SeekerSuspendConfirmModalProps) {
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
        aria-labelledby="seeker-suspend-modal-title"
      >
        <div className="mb-1 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="mb-5 mt-2 flex flex-col items-center text-center">
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${copy.iconClass}`}>
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h2 id="seeker-suspend-modal-title" className="text-lg font-bold text-slate-900">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{copy.description}</p>
        </div>

        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
          <p className="font-semibold text-slate-900">{seeker.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">{seeker.email}</p>
          <p className="mt-1 text-xs text-slate-400">
            {seeker.area} · {seeker.desiredJobType}
          </p>
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
