"use client";

import { useMemo, useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import {
  birthdayDayOptions,
  birthdayMonthOptions,
  birthdayYearOptions,
  composeBirthday,
  splitBirthday,
} from "@/lib/birthday";

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

type FormBirthdayInputProps = {
  name: string;
  label: string;
};

export function FormBirthdayInput({ name, label }: FormBirthdayInputProps) {
  const [field, meta, helpers] = useField(name);
  const { year, month, day } = splitBirthday(field.value);
  const hasError = Boolean(meta.error && meta.touched);

  const yearOptions = useMemo(() => birthdayYearOptions(), []);
  const monthOptions = useMemo(() => birthdayMonthOptions(), []);
  const dayOptions = useMemo(() => birthdayDayOptions(year, month), [year, month]);

  const handleBlur = () => helpers.setTouched(true);

  const update = (nextYear: string, nextMonth: string, nextDay: string) => {
    helpers.setValue(composeBirthday(nextYear, nextMonth, nextDay));
  };

  const setYear = (nextYear: string) => {
    const maxDay = birthdayDayOptions(nextYear, month).length;
    const nextDay = day && Number(day) > maxDay ? "" : day;
    update(nextYear, month, nextDay);
  };

  const setMonth = (nextMonth: string) => {
    const maxDay = birthdayDayOptions(year, nextMonth).length;
    const nextDay = day && Number(day) > maxDay ? "" : day;
    update(year, nextMonth, nextDay);
  };

  const setDay = (nextDay: string) => update(year, month, nextDay);

  const pickerProps = {
    error: hasError,
    touched: Boolean(meta.touched),
    compact: true,
    allowClear: true,
    onBlur: handleBlur,
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
            onChange={setYear}
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
            onChange={setMonth}
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
            onChange={setDay}
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
};

export function FormSelect({ name, label, options, placeholder = "選択" }: FormSelectProps) {
  const [field, meta, helpers] = useField(name);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <FormSelectPicker
        name={field.name}
        value={field.value ?? ""}
        options={options}
        placeholder={placeholder}
        title={label}
        error={Boolean(meta.error)}
        touched={Boolean(meta.touched)}
        onChange={(value) => helpers.setValue(value)}
        onBlur={() => helpers.setTouched(true)}
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
};

export function FormTextarea({ name, label, rows = 3, placeholder, maxLength }: FormTextareaProps) {
  const [field, meta] = useField(name);
  const length = typeof field.value === "string" ? field.value.length : 0;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <textarea
        {...field}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${fieldClass(meta.error, meta.touched)} resize-none`}
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
