"use client";

import { Ban, RotateCcw } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
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
    iconTone: "danger" as const,
    variant: "danger" as const,
  },
  restore: {
    title: "アカウントを復元しますか？",
    description: "復元すると求職者は再びサービスを利用できるようになります。",
    confirmLabel: "復元する",
    icon: RotateCcw,
    iconTone: "success" as const,
    variant: "success" as const,
  },
} as const;

export default function SeekerSuspendConfirmModal({
  seeker,
  action,
  onClose,
  onConfirm,
}: SeekerSuspendConfirmModalProps) {
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
      <div className="text-left">
        <p className="font-semibold text-slate-900">{seeker.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">{seeker.email}</p>
        <p className="mt-1 text-xs text-slate-400">
          {seeker.area} · {seeker.desiredJobType}
        </p>
      </div>
    </ConfirmModal>
  );
}
