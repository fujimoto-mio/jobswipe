"use client";

import { Check, Trash2, X } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { Job } from "@/lib/types";

export type JobCancelVariant = "request" | "approve" | "reject" | "direct";

type JobCancelConfirmModalProps = {
  job: Job;
  variant: JobCancelVariant;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY: Record<
  JobCancelVariant,
  { title: string; description: string; confirmLabel: string; icon: typeof Trash2; tone: "success" | "danger" }
> = {
  request: {
    title: "この求人の掲載キャンセルを申請しますか？",
    description: "管理者が承認すると求人がキャンセルされ、掲載が終了します。",
    confirmLabel: "キャンセルを申請",
    icon: Trash2,
    tone: "danger",
  },
  approve: {
    title: "キャンセル申請を承認しますか？",
    description: "承認すると求人がキャンセルされ、求職者に表示されなくなります。",
    confirmLabel: "キャンセルを承認",
    icon: Check,
    tone: "danger",
  },
  reject: {
    title: "キャンセル申請を却下しますか？",
    description: "却下すると求人は掲載中のままになります。",
    confirmLabel: "却下する",
    icon: X,
    tone: "danger",
  },
  direct: {
    title: "この求人をキャンセルしますか？",
    description: "キャンセルすると掲載が終了し、求職者に表示されなくなります。",
    confirmLabel: "キャンセルする",
    icon: Trash2,
    tone: "danger",
  },
};

export default function JobCancelConfirmModal({
  job,
  variant,
  onClose,
  onConfirm,
}: JobCancelConfirmModalProps) {
  const copy = COPY[variant];
  const Icon = copy.icon;

  return (
    <ConfirmModal
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      variant={copy.tone}
      icon={Icon}
      iconTone={copy.tone}
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
