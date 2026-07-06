"use client";

import { Check, X } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { Job, JobApprovalStatus } from "@/lib/types";

type JobApprovalConfirmModalProps = {
  job: Job;
  action: Extract<JobApprovalStatus, "Active" | "Cancelled">;
  kind?: "job" | "revision";
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY = {
  Active: {
    job: {
      title: "投稿申請を承認しますか？",
      description: "承認すると求職者向けに公開されます。",
      confirmLabel: "承認する",
    },
    revision: {
      title: "変更申請を承認しますか？",
      description: "承認すると変更内容が求職者向けに反映されます。",
      confirmLabel: "変更を承認する",
    },
  },
  Cancelled: {
    job: {
      title: "投稿申請を差し戻しますか？",
      description: "差し戻すと企業側で内容を修正できます。",
      confirmLabel: "差し戻す",
    },
    revision: {
      title: "変更申請を差し戻しますか？",
      description: "差し戻しても現在公開中の内容は変わりません。",
      confirmLabel: "変更を差し戻す",
    },
  },
} as const;

export default function JobApprovalConfirmModal({
  job,
  action,
  kind = "job",
  onClose,
  onConfirm,
}: JobApprovalConfirmModalProps) {
  const copy = COPY[action][kind];
  const Icon = action === "Active" ? Check : X;
  const variant = action === "Active" ? "success" : "danger";
  const iconTone = action === "Active" ? "success" : "danger";

  return (
    <ConfirmModal
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      variant={variant}
      icon={Icon}
      iconTone={iconTone}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <div className="flex items-center gap-3">
        <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" showLogoBadge={false} />
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-medium text-slate-500">{job.company}</p>
          <p className="truncate font-semibold text-slate-900">{job.title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {job.category} · {job.area || job.location}
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}
