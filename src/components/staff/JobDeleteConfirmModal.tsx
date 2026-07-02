"use client";

import { Trash2 } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { Job } from "@/lib/types";

type JobDeleteConfirmModalProps = {
  job: Job;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function JobDeleteConfirmModal({ job, onClose, onConfirm }: JobDeleteConfirmModalProps) {
  return (
    <ConfirmModal
      title="この求人を削除しますか？"
      description="削除すると元に戻せません。"
      confirmLabel="削除する"
      variant="danger"
      icon={Trash2}
      iconTone="danger"
      onClose={onClose}
      onConfirm={onConfirm}
      errorFallback="削除に失敗しました。もう一度お試しください。"
      className="confirm-modal--compact"
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
