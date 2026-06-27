"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  X,
  MapPin,
  Briefcase,
  CheckCircle,
  Gift,
  Send,
  Heart,
  ExternalLink,
  FileText,
} from "lucide-react";
import { formatDateJST } from "@/lib/datetime";
import type { Job } from "@/lib/types";

type JobDetailModalProps = {
  job: Job;
  isSaved?: boolean;
  onClose: () => void;
  onSave?: () => void;
  onApply: () => void;
};

function LinkItem({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#2563EB] transition hover:bg-blue-50"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      {label}
    </a>
  );
}

export default function JobDetailModal({
  job,
  isSaved,
  onClose,
  onSave,
  onApply,
}: JobDetailModalProps) {
  const links = job.links ?? {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48">
          <img src={job.thumbnailUrl} alt={job.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
            aria-label="閉じる"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <img src={job.companyLogo} alt={job.company} className="h-12 w-12 rounded-xl object-cover" />
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">{job.title}</h2>
              <p className="text-sm text-[#64748B]">{job.company}</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-[#334155]">
              <MapPin className="h-4 w-4 text-[#2563EB]" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Briefcase className="h-4 w-4" />
              {job.salary}
            </span>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563EB]">
                {tag}
              </span>
            ))}
          </div>

          <p className="mb-5 text-xs text-[#64748B]">掲載日: {formatDateJST(job.postedAt)}</p>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-[#64748B]">仕事内容</h3>
            <p className="text-sm leading-relaxed text-[#334155]">{job.description}</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <CheckCircle className="h-4 w-4" />
              必須条件
            </h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2 text-sm text-[#334155]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                  {req}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <Gift className="h-4 w-4" />
              福利厚生
            </h3>
            <ul className="space-y-1.5">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-[#334155]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          {(links.website || links.careersPage || links.twitter || links.instagram || links.linkedin || links.jobPdf) && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-[#64748B]">リンク</h3>
              <div className="grid gap-2">
                <LinkItem href={links.website} label="企業HP" />
                <LinkItem href={links.careersPage} label="採用ページ" />
                <LinkItem href={links.twitter} label="Twitter / X" />
                <LinkItem href={links.instagram} label="Instagram" />
                <LinkItem href={links.linkedin} label="LinkedIn" />
                <LinkItem href={links.jobPdf} label="求人票・募集要項PDF" />
              </div>
            </section>
          )}

          <div className="flex gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className={`btn-secondary flex-1 ${isSaved ? "border-[#2563EB] text-[#2563EB]" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-[#2563EB]" : ""}`} />
                気になる
              </button>
            )}
            <button onClick={onApply} className="btn-primary flex-1">
              <Send className="h-4 w-4" />
              応募する
            </button>
          </div>

          <Link
            href={`/jobs/${job.id}`}
            className="mt-3 flex items-center justify-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]"
          >
            <FileText className="h-4 w-4" />
            詳細ページで見る
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
