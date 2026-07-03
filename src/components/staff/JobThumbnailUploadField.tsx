"use client";

import { useRef } from "react";
import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";

type JobThumbnailUploadFieldProps = {
  thumbnailPreview: string | null;
  thumbnailFile: File | null;
  onThumbnailFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearThumbnail?: () => void;
  existingThumbnail?: boolean;
};

export default function JobThumbnailUploadField({
  thumbnailPreview,
  thumbnailFile,
  onThumbnailFile,
  onClearThumbnail,
  existingThumbnail = false,
}: JobThumbnailUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasThumbnail = Boolean(thumbnailPreview);

  return (
    <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#2563EB]" />
          <h3 className="font-medium text-[#1E293B]">サムネイル画像</h3>
        </div>
        {hasThumbnail && <span className="badge badge-green shrink-0">選択済み</span>}
      </div>

      {hasThumbnail && (
        <div className="relative mb-4 overflow-hidden rounded-xl border border-[#E2E8F0]">
          <img src={thumbnailPreview!} alt="" className="h-40 w-full object-cover" />
          {onClearThumbnail && (
            <button
              type="button"
              onClick={onClearThumbnail}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:bg-white"
              aria-label="サムネイルを削除"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {thumbnailFile && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{thumbnailFile.name}</span>
        </div>
      )}

      {hasThumbnail && !thumbnailFile && existingThumbnail && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          登録済みのサムネイルを表示中
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <Upload className="h-4 w-4" />
          {hasThumbnail ? "サムネイルを変更" : "サムネイルをアップロード"}
        </button>
        {hasThumbnail && onClearThumbnail && (
          <button
            type="button"
            onClick={onClearThumbnail}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            サムネイルを削除
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onThumbnailFile}
      />
    </div>
  );
}
