"use client";

import Link from "next/link";
import { useField } from "formik";
import { FormError } from "@/components/form/FormFields";

type LegalLink = {
  href: string;
  label: string;
};

type LegalAgreementFieldProps = {
  name: string;
  links: LegalLink[];
};

function formatLinks(links: LegalLink[]) {
  return links.map((link, index) => {
    const prefix =
      index === 0 ? "" : index === links.length - 1 ? "および" : "、";

    return (
      <span key={link.href}>
        {prefix}
        <Link
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] underline hover:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {link.label}
        </Link>
      </span>
    );
  });
}

export function LegalAgreementField({ name, links }: LegalAgreementFieldProps) {
  const [field, , helpers] = useField<boolean>({ name, type: "checkbox" });

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--foreground)]">
        <input
          type="checkbox"
          name={field.name}
          checked={Boolean(field.value)}
          onChange={(e) => helpers.setValue(e.target.checked)}
          onBlur={field.onBlur}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[var(--accent)]"
        />
        <span className="leading-relaxed">
          {formatLinks(links)}に同意する
        </span>
      </label>
      <FormError name={name} />
    </div>
  );
}

export const SEEKER_LEGAL_LINKS: LegalLink[] = [
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
];

export const COMPANY_LEGAL_LINKS: LegalLink[] = [
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/guidelines", label: "求人掲載ガイドライン" },
];
