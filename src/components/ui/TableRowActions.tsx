"use client";

import Link from "next/link";
import { Ban, Check, Eye, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

type TableRowActionsProps = {
  children: ReactNode;
};

export function TableRowActions({ children }: TableRowActionsProps) {
  return (
    <div className="staff-ui flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

export function TableViewLink({ href, label = "表示" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="btn-icon btn-icon-muted h-9 w-9 shrink-0" aria-label={label}>
      <Eye className="h-4 w-4" />
    </Link>
  );
}

export function TableEditLink({ href, label = "編集" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="btn-icon btn-icon-muted h-9 w-9 shrink-0" aria-label={label}>
      <Pencil className="h-4 w-4" />
    </Link>
  );
}

export function TableDeleteButton({
  onClick,
  label = "削除",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-danger h-9 w-9 shrink-0"
      aria-label={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function TableApproveButton({
  onClick,
  label = "承認",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-primary h-9 w-9 shrink-0"
      aria-label={label}
    >
      <Check className="h-4 w-4" />
    </button>
  );
}

export function TableRejectButton({
  onClick,
  label = "却下",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-danger h-9 w-9 shrink-0"
      aria-label={label}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export function TableSuspendButton({
  onClick,
  label = "停止",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-danger h-9 w-9 shrink-0"
      aria-label={label}
    >
      <Ban className="h-4 w-4" />
    </button>
  );
}

export function TableCancelButton({
  onClick,
  label = "キャンセル",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-danger h-9 w-9 shrink-0"
      aria-label={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function TableRestoreButton({
  onClick,
  label = "復元",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-icon btn-icon-primary h-9 w-9 shrink-0"
      aria-label={label}
    >
      <RotateCcw className="h-4 w-4" />
    </button>
  );
}
