"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";

export type ConfirmModalVariant = "primary" | "danger" | "success";

export type ConfirmModalProps = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  variant?: ConfirmModalVariant;
  icon?: LucideIcon;
  iconTone?: "danger" | "success" | "primary" | "neutral";
  children?: ReactNode;
  className?: string;
  errorFallback?: string;
  staffStyle?: boolean;
};

const ICON_TONE_CLASS = {
  danger: "confirm-modal-icon--danger",
  success: "confirm-modal-icon--success",
  primary: "confirm-modal-icon--primary",
  neutral: "confirm-modal-icon--neutral",
} as const;

const CONFIRM_BTN_CLASS: Record<ConfirmModalVariant, string> = {
  primary: "btn-primary",
  danger: "confirm-modal-btn--danger",
  success: "btn-primary",
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel = "キャンセル",
  onClose,
  onConfirm,
  variant = "primary",
  icon: Icon,
  iconTone = "neutral",
  children,
  className = "",
  errorFallback = "処理に失敗しました。もう一度お試しください。",
  staffStyle = true,
}: ConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      setError(errorFallback);
    } finally {
      setSubmitting(false);
    }
  };

  const titleId = "confirm-modal-title";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="confirm-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={submitting ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className={`modal-sheet confirm-modal ${staffStyle ? "staff-ui" : ""} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="confirm-modal-body p-6">
          <div className="mb-5 flex flex-col items-center text-center">
            {Icon && (
              <div className={`confirm-modal-icon mb-4 ${ICON_TONE_CLASS[iconTone]}`}>
                <Icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
            )}
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
          </div>

          {children && <div className="confirm-modal-preview mb-5">{children}</div>}

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
              className={`${staffStyle ? "staff-ui " : ""}btn-secondary flex-1 justify-center py-2.5`}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={submitting}
              className={`${staffStyle ? "staff-ui " : ""}flex flex-1 items-center justify-center gap-2 py-2.5 ${CONFIRM_BTN_CLASS[variant]}`}
            >
              {submitting ? <ButtonSpinner /> : confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
