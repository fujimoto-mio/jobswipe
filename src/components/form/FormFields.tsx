"use client";

import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";

function fieldClass(error?: string, touched?: boolean) {
  return touched && error ? "input-field ring-1 ring-red-300" : "input-field";
}

export function FormError({ name }: { name: string }) {
  const [, meta] = useField(name);
  if (!meta.touched || !meta.error) return null;
  return <p className="mt-1 text-xs text-red-600">{meta.error}</p>;
}

type FormTextInputProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  readOnly?: boolean;
  className?: string;
  min?: string;
  max?: string;
};

export function FormTextInput({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  readOnly,
  className = "",
  min,
  max,
}: FormTextInputProps) {
  const [field, meta] = useField(name);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <input
        {...field}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        min={min}
        max={max}
        className={`${fieldClass(meta.error, meta.touched)} ${className}`}
      />
      <FormError name={name} />
    </label>
  );
}

type FormSelectProps = {
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
};

export function FormSelect({ name, label, options, placeholder = "選択" }: FormSelectProps) {
  const [field, meta] = useField(name);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <select {...field} className={fieldClass(meta.error, meta.touched)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FormError name={name} />
    </label>
  );
}

type FormTextareaProps = {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
};

export function FormTextarea({ name, label, rows = 3, placeholder }: FormTextareaProps) {
  const [field, meta] = useField(name);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[#64748B]">{label}</span>
      <textarea
        {...field}
        rows={rows}
        placeholder={placeholder}
        className={`${fieldClass(meta.error, meta.touched)} resize-none`}
      />
      <FormError name={name} />
    </label>
  );
}

type FormPasswordProps = {
  name: string;
  label: string;
  autoComplete?: string;
  hint?: string;
};

export function FormPassword({ name, label, autoComplete = "current-password", hint }: FormPasswordProps) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <div className="relative">
        <input
          {...field}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${fieldClass(meta.error, meta.touched)} pr-11`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] transition hover:text-[var(--foreground)]"
          aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !meta.error && <p className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p>}
      <FormError name={name} />
    </label>
  );
}
