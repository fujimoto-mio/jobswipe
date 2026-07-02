"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ApplicationDetailBody } from "@/components/staff/ApplicationSeekerDetail";
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
      className="confirm-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="modal-sheet application-seeker-info-modal staff-ui max-h-[92vh] w-full overflow-y-auto p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="応募者プロフィール"
      >
        <div className="application-seeker-info-modal-header sticky top-0 z-10 flex items-center justify-end px-4 py-3 sm:px-5">
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
          layout="modal"
        />
      </motion.div>
    </motion.div>
  );
}
