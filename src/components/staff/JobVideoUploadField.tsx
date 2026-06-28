"use client";

import { useRef } from "react";
import { useField } from "formik";
import { AlertCircle, CheckCircle2, Upload, Video, X } from "lucide-react";
import { FormTextInput } from "@/components/form/FormFields";
import { formatFileSize } from "@/lib/video";

type JobVideoUploadFieldProps = {
  videoPreview: string | null;
  videoFile: File | null;
  uploadError: string | null;
  onVideoFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearVideo?: () => void;
  existingVideo?: boolean;
};

export default function JobVideoUploadField({
  videoPreview,
  videoFile,
  uploadError,
  onVideoFile,
  onClearVideo,
  existingVideo = false,
}: JobVideoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoUrlField] = useField("videoUrl");
  const urlPreview = typeof videoUrlField.value === "string" ? videoUrlField.value.trim() : "";
  const effectivePreview = videoPreview || (!videoFile && urlPreview ? urlPreview : null);
  const hasVideo = Boolean(effectivePreview);

  return (
    <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-[#2563EB]" />
          <h3 className="font-medium text-[#1E293B]">
            求人動画（任意）
          </h3>
        </div>
        {hasVideo && (
          <span className="badge badge-green shrink-0">選択済み</span>
        )}
      </div>

      {hasVideo && (
        <div className="mb-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-black">
          <video
            key={effectivePreview ?? undefined}
            src={effectivePreview ?? undefined}
            controls
            playsInline
            className="aspect-video w-full object-contain"
          />
        </div>
      )}

      {videoFile && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {videoFile.name} ({formatFileSize(videoFile.size)})
          </span>
        </div>
      )}

      {hasVideo && !videoFile && existingVideo && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          登録済みの動画を表示中
        </div>
      )}

      {hasVideo && !videoFile && urlPreview && !existingVideo && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          動画URLをプレビュー表示中
        </div>
      )}

      {uploadError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {uploadError}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <Upload className="h-4 w-4" />
          {hasVideo ? "動画を変更" : "動画ファイルを選択"}
        </button>
        {hasVideo && onClearVideo && (
          <button
            type="button"
            onClick={onClearVideo}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            動画を削除
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        className="hidden"
        onChange={onVideoFile}
      />

      <div className="mt-4">
        <FormTextInput name="videoUrl" label="動画URL（任意）" placeholder="https://..." />
      </div>
    </div>
  );
}
