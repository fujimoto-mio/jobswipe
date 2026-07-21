"use client";

import { Ban, Check, RotateCcw, X } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { CompanyStatus } from "@/lib/constants";

export type CompanyStatusAction = "approve" | "reject" | "suspend" | "resume";

export const COMPANY_STATUS_ACTION_TARGET: Record<CompanyStatusAction, CompanyStatus> = {
  approve: "Active",
  reject: "Cancelled",
  suspend: "Suspended",
  resume: "Active",
};

type CompanyStatusConfirmModalProps = {
  company: { id: string; name: string };
  action: CompanyStatusAction;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const COPY = {
  approve: {
    title: "企業を承認しますか？",
    description: "承認すると企業は求人掲載などサービスを利用できるようになります。",
    confirmLabel: "承認する",
    icon: Check,
    iconTone: "success" as const,
    variant: "success" as const,
  },
  reject: {
    title: "企業を却下しますか？",
    description: "却下すると企業アカウントはログインおよびサービス利用ができなくなります。",
    confirmLabel: "却下する",
    icon: X,
    iconTone: "danger" as const,
    variant: "danger" as const,
  },
  suspend: {
    title: "企業を停止しますか？",
    description: "停止すると企業アカウントはログインおよび求人・チャットなどの操作ができなくなります。",
    confirmLabel: "停止する",
    icon: Ban,
    iconTone: "danger" as const,
    variant: "danger" as const,
  },
  resume: {
    title: "企業を再開しますか？",
    description: "再開すると企業は再びサービスを利用できるようになります。",
    confirmLabel: "再開する",
    icon: RotateCcw,
    iconTone: "success" as const,
    variant: "success" as const,
  },
} as const;

export default function CompanyStatusConfirmModal({
  company,
  action,
  onClose,
  onConfirm,
}: CompanyStatusConfirmModalProps) {
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
        <p className="font-semibold text-slate-900">{company.name}</p>
      </div>
    </ConfirmModal>
  );
}
