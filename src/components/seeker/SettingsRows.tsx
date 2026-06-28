"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function SettingsSection({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-100 px-4 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
      準備中
    </span>
  );
}

type RowContentProps = {
  icon: LucideIcon;
  label: string;
  detail?: string;
  destructive?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

function RowContent({ icon: Icon, label, detail, destructive, disabled, comingSoon }: RowContentProps) {
  return (
    <>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          disabled ? "bg-slate-50" : destructive ? "bg-red-50" : "bg-slate-100"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            disabled ? "text-slate-300" : destructive ? "text-red-600" : "text-slate-600"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={`block text-sm font-semibold ${
            disabled ? "text-slate-400" : destructive ? "text-red-600" : "text-slate-900"
          }`}
        >
          {label}
        </span>
        {detail && (
          <span className={`mt-0.5 block truncate text-xs ${disabled ? "text-slate-400" : "text-slate-500"}`}>
            {detail}
          </span>
        )}
      </div>
      {comingSoon ? <ComingSoonBadge /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
    </>
  );
}

type SettingsLinkRowProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

export function SettingsLinkRow({
  href,
  icon,
  label,
  external,
  disabled,
  comingSoon,
}: SettingsLinkRowProps) {
  const className = `flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
    disabled ? "cursor-not-allowed opacity-60" : "active:bg-slate-50"
  }`;

  const content = (
    <RowContent icon={icon} label={label} disabled={disabled} comingSoon={comingSoon ?? disabled} />
  );

  if (disabled) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

type SettingsButtonRowProps = {
  icon: LucideIcon;
  label: string;
  detail?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

export function SettingsButtonRow({
  icon,
  label,
  detail,
  onClick,
  destructive,
  disabled,
  comingSoon,
}: SettingsButtonRowProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
        disabled ? "cursor-not-allowed opacity-60" : "active:bg-slate-50"
      }`}
    >
      <RowContent
        icon={icon}
        label={label}
        detail={detail}
        destructive={destructive}
        disabled={disabled}
        comingSoon={comingSoon ?? disabled}
      />
    </button>
  );
}

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingsToggleRow({
  label,
  description,
  checked,
  disabled,
  comingSoon,
  onChange,
}: SettingsToggleRowProps) {
  const isDisabled = disabled || comingSoon;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${isDisabled ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${isDisabled ? "text-slate-400" : "text-slate-900"}`}>{label}</p>
          {comingSoon && <ComingSoonBadge />}
        </div>
        {description && (
          <p className={`mt-0.5 text-xs ${isDisabled ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isDisabled}
        onClick={() => !isDisabled && onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked && !isDisabled ? "seeker-toggle-on bg-[var(--accent)]" : "bg-slate-200"
        } ${isDisabled ? "cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked && !isDisabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <section className={`mt-2 bg-white ${disabled ? "pointer-events-none" : ""}`}>{children}</section>
  );
}
