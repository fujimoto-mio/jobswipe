"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useField, useFormikContext } from "formik";
import { Eye, EyeOff } from "lucide-react";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import {
  birthdayDayOptions,
  birthdayMonthOptions,
  birthdayYearOptions,
  composeBirthday,
  splitBirthday,
} from "@/lib/birthday";

export function FormError({ name }: { name: string }) {
  const [, meta] = useField(name);
  const { submitCount } = useFormikContext();
  const show = Boolean(meta.error && (meta.touched || submitCount > 0));
  if (!show) return null;
  return <p className="mt-1 text-xs text-red-600">{meta.error}</p>;
}

function shouldShowFieldError(error?: string, touched?: boolean, submitCount = 0) {
  return Boolean(error && (touched || submitCount > 0));
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
  hint?: string;
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
  hint,
}: FormTextInputProps) {
  const [field, meta] = useField(name);
  const { submitCount } = useFormikContext();
  const showError = shouldShowFieldError(meta.error, meta.touched, submitCount);

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
        className={`${showError ? "input-field ring-1 ring-red-300" : "input-field"} ${className}`}
      />
      {hint && !meta.error && <p className="form-field-hint">{hint}</p>}
      <FormError name={name} />
    </label>
  );
}

type FormBirthdayInputProps = {
  name: string;
  label: string;
};

export function FormBirthdayInput({ name, label }: FormBirthdayInputProps) {
  const [field, meta, helpers] = useField(name);
  const { submitCount } = useFormikContext();
  const initial = splitBirthday(field.value);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const showError = shouldShowFieldError(meta.error, meta.touched, submitCount);

  useEffect(() => {
    if (!field.value) return;
    const next = splitBirthday(field.value);
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
  }, [field.value]);

  const yearOptions = useMemo(() => birthdayYearOptions(), []);
  const monthOptions = useMemo(() => birthdayMonthOptions(), []);
  const dayOptions = useMemo(() => birthdayDayOptions(year, month), [year, month]);

  const commit = (nextYear: string, nextMonth: string, nextDay: string) => {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
    const nextValue = composeBirthday(nextYear, nextMonth, nextDay);
    void helpers.setValue(nextValue, true);
    if (nextValue) {
      void helpers.setTouched(true, false);
    }
  };

  const setYearValue = (nextYear: string) => {
    const maxDay = birthdayDayOptions(nextYear, month).length;
    const nextDay = day && Number(day) > maxDay ? "" : day;
    commit(nextYear, month, nextDay);
  };

  const setMonthValue = (nextMonth: string) => {
    const maxDay = birthdayDayOptions(year, nextMonth).length;
    const nextDay = day && Number(day) > maxDay ? "" : day;
    commit(year, nextMonth, nextDay);
  };

  const setDayValue = (nextDay: string) => commit(year, month, nextDay);

  const pickerProps = {
    error: showError,
    touched: showError,
    compact: true,
    allowClear: true,
    onBlur: () => {},
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <div className="birthday-fields">
        <div className="birthday-part">
          <FormSelectPicker
            {...pickerProps}
            name={`${name}-year`}
            value={year}
            options={yearOptions}
            placeholder="—"
            title="生年"
            onChange={setYearValue}
          />
        </div>
        <span className="birthday-unit">年</span>
        <div className="birthday-part">
          <FormSelectPicker
            {...pickerProps}
            name={`${name}-month`}
            value={month}
            options={monthOptions}
            placeholder="—"
            title="生月"
            onChange={setMonthValue}
          />
        </div>
        <span className="birthday-unit">月</span>
        <div className="birthday-part">
          <FormSelectPicker
            {...pickerProps}
            name={`${name}-day`}
            value={day}
            options={dayOptions}
            placeholder="—"
            title="生日"
            onChange={setDayValue}
          />
        </div>
        <span className="birthday-unit">日</span>
      </div>
      <FormError name={name} />
    </label>
  );
}

type FormSelectProps = {
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
  readOnly?: boolean;
};

export function FormSelect({ name, label, options, placeholder = "選択", readOnly }: FormSelectProps) {
  const [field, meta, helpers] = useField(name);
  const { submitCount } = useFormikContext();
  const showError = shouldShowFieldError(meta.error, meta.touched, submitCount);

  if (readOnly) {
    return (
      <FormTextInput
        name={name}
        label={label}
        readOnly
        className="bg-[#F8FAFC] text-[#64748B]"
      />
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <FormSelectPicker
        name={field.name}
        value={field.value ?? ""}
        options={options}
        placeholder={placeholder}
        title={label}
        error={showError}
        touched={showError}
        onChange={(value) => {
          void helpers.setValue(value, true);
          void helpers.setTouched(true, false);
        }}
        onBlur={() => {}}
      />
      <FormError name={name} />
    </label>
  );
}

type FormTextareaProps = {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  readOnly?: boolean;
};

function adjustTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  const minHeight = parseFloat(getComputedStyle(el).minHeight) || 0;
  el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
}

export function FormTextarea({
  name,
  label,
  rows = 3,
  placeholder,
  maxLength,
  className = "",
  readOnly,
}: FormTextareaProps) {
  const [field, meta] = useField(name);
  const { submitCount } = useFormikContext();
  const showError = shouldShowFieldError(meta.error, meta.touched, submitCount);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const length = typeof field.value === "string" ? field.value.length : 0;

  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
  }, [field.value]);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <textarea
        {...field}
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        onChange={(e) => {
          field.onChange(e);
          adjustTextareaHeight(e.target);
        }}
        className={`${showError ? "input-field ring-1 ring-red-300" : "input-field"} resize-none overflow-hidden ${readOnly ? "bg-[#F8FAFC] text-[#64748B]" : ""} ${className}`}
      />
      {maxLength != null && (
        <p className="mt-1.5 text-right text-xs text-slate-400">
          {length} / {maxLength}
        </p>
      )}
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
  const { submitCount } = useFormikContext();
  const showError = shouldShowFieldError(meta.error, meta.touched, submitCount);
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <div className="relative">
        <input
          {...field}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${showError ? "input-field ring-1 ring-red-300" : "input-field"} pr-11`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="field-toggle-btn absolute right-2.5 top-1/2 -translate-y-1/2"
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
