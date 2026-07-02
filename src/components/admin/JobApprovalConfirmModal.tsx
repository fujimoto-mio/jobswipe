"use client";

import { Check, X } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { Job, JobApprovalStatus } from "@/lib/types";

type JobApprovalConfirmModalProps = {
  job: Job;
  action: Extract<JobApprovalStatus, "Active" | "Cancelled">;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY = {
  Active: {
    title: "求人を承認しますか？",
    description: "承認すると求職者向けに公開されます。",
    confirmLabel: "承認する",
    icon: Check,
    iconTone: "success" as const,
    variant: "success" as const,
  },
  Cancelled: {
    title: "求人を却下しますか？",
    description: "却下すると求職者向けには公開されません。",
    confirmLabel: "却下する",
    icon: X,
    iconTone: "danger" as const,
    variant: "danger" as const,
  },
} as const;

export default function JobApprovalConfirmModal({
  job,
  action,
  onClose,
  onConfirm,
}: JobApprovalConfirmModalProps) {
  const copy = COPY[action];
  const Icon = copy.icon;

  return (
    <ConfirmModal
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      variant={copy.variant}
      icon={Icon}
      iconTone={copy.iconTone}
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
