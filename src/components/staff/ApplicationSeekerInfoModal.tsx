"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  APPLICATION_STATUS_CHIP_COLORS,
  ApplicationDetailBody,
} from "@/components/staff/ApplicationSeekerDetail";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateJST } from "@/lib/datetime";
import type { ApplicationStatus, ApplicationWithSeeker } from "@/lib/types";

type ApplicationSeekerInfoModalProps = {
  application: ApplicationWithSeeker;
  basePath?: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
};

export default function ApplicationSeekerInfoModal({
  application,
  basePath = "/company",
  onClose,
  onUpdateStatus,
}: ApplicationSeekerInfoModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

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
        className="modal-sheet application-seeker-info-modal staff-ui max-h-[92vh] w-full overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-seeker-info-title"
      >
        <div className="mb-1 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="mb-5 mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="application-seeker-info-title" className="text-lg font-bold text-slate-900">
                {application.applicantName}
              </h2>
              <span className={`badge ${APPLICATION_STATUS_CHIP_COLORS[application.status]}`}>
                {APPLICATION_STATUS_LABELS[application.status]}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-500">{application.applicantEmail}</p>
            <p className="mt-1 text-xs text-slate-400">応募日: {formatDateJST(application.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon btn-icon-muted shrink-0" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ApplicationDetailBody
          application={application}
          seeker={application.seeker}
          basePath={basePath}
          isCompany
          onUpdateStatus={onUpdateStatus}
          showChatLink={false}
        />
      </motion.div>
    </motion.div>
  );
}
