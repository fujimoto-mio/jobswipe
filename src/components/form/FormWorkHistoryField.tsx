"use client";

import { useMemo } from "react";
import { FieldArray, useField } from "formik";
import { Plus, Trash2 } from "lucide-react";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import { FormError, FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { EMPTY_WORK_HISTORY_ENTRY } from "@/lib/profile-fields";
import { workHistoryMonthOptions, workHistoryYearOptions } from "@/lib/work-history-dates";

type FormWorkHistoryFieldProps = {
  name: string;
  label: string;
};

type WorkHistoryYearMonthProps = {
  prefix: string;
  label: string;
  disabled?: boolean;
};

function WorkHistoryYearMonth({ prefix, label, disabled = false }: WorkHistoryYearMonthProps) {
  const [yearField, yearMeta, yearHelpers] = useField(`${prefix}Year`);
  const [monthField, monthMeta, monthHelpers] = useField(`${prefix}Month`);

  const year = String(yearField.value ?? "");
  const month = String(monthField.value ?? "");

  const yearOptions = useMemo(() => workHistoryYearOptions(), []);
  const monthOptions = useMemo(() => workHistoryMonthOptions(), []);

  const hasError = Boolean(
    (yearMeta.error && yearMeta.touched) || (monthMeta.error && monthMeta.touched)
  );

  const touchAll = () => {
    yearHelpers.setTouched(true);
    monthHelpers.setTouched(true);
  };

  const pickerProps = {
    error: hasError,
    touched: hasError,
    compact: true,
    allowClear: true,
    onBlur: touchAll,
    disabled,
  };

  return (
    <div className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <div className={`birthday-fields ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <div className="birthday-part">
          <FormSelectPicker
            {...pickerProps}
            name={`${prefix}-year`}
            value={year}
            options={yearOptions}
            placeholder="—"
            title={`${label}（年）`}
            onChange={(value) => {
              yearHelpers.setValue(value);
              touchAll();
            }}
          />
        </div>
        <span className="birthday-unit">年</span>
        <div className="birthday-part">
          <FormSelectPicker
            {...pickerProps}
            name={`${prefix}-month`}
            value={month}
            options={monthOptions}
            placeholder="—"
            title={`${label}（月）`}
            onChange={(value) => {
              monthHelpers.setValue(value);
              touchAll();
            }}
          />
        </div>
        <span className="birthday-unit">月</span>
      </div>
      <FormError name={`${prefix}Year`} />
    </div>
  );
}

type WorkHistoryPeriodRowProps = {
  base: string;
  isCurrent: boolean;
};

function WorkHistoryPeriodRow({ base, isCurrent }: WorkHistoryPeriodRowProps) {
  return (
    <div className="space-y-2">
      <div className="profile-form-row profile-form-row-2 profile-work-period-row">
        <WorkHistoryYearMonth prefix={`${base}.start`} label="開始日" />
        <WorkHistoryYearMonth prefix={`${base}.end`} label="終了日" disabled={isCurrent} />
      </div>
      <WorkHistoryCurrentField name={`${base}.isCurrent`} endPrefix={`${base}.end`} />
    </div>
  );
}

export default function FormWorkHistoryField({ name, label }: FormWorkHistoryFieldProps) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <FieldArray name={name}>
        {({ form, push, remove }) => {
          const entries = (form.values[name] as typeof EMPTY_WORK_HISTORY_ENTRY[] | undefined) ?? [];
          return (
            <div className="space-y-4">
              {entries.map((entry, index) => {
                const base = `${name}.${index}`;
                const isCurrent = Boolean(entry.isCurrent);
                return (
                  <div key={index} className="profile-work-entry">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600">職歴 {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="btn-icon btn-icon-muted"
                        aria-label="職歴を削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <FormTextInput
                        name={`${base}.company`}
                        label="会社名"
                        placeholder="株式会社〇〇"
                      />
                      <FormTextInput
                        name={`${base}.role`}
                        label="職種・役職"
                        placeholder="営業, エンジニア など"
                      />
                      <WorkHistoryPeriodRow base={base} isCurrent={isCurrent} />
                      <FormTextarea
                        name={`${base}.description`}
                        label="業務内容"
                        rows={5}
                        maxLength={2000}
                        placeholder="担当業務や実績を記入"
                        className="textarea-content"
                      />
                    </div>
                  </div>
                );
              })}
              {entries.length < 10 && (
                <button
                  type="button"
                  onClick={() => push({ ...EMPTY_WORK_HISTORY_ENTRY })}
                  className="btn-secondary flex w-full items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  職歴を追加
                </button>
              )}
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}

function WorkHistoryCurrentField({
  name,
  endPrefix,
}: {
  name: string;
  endPrefix: string;
}) {
  const [field, , helpers] = useField<boolean>({ name, type: "checkbox" });
  const [, , endYearHelpers] = useField(`${endPrefix}Year`);
  const [, , endMonthHelpers] = useField(`${endPrefix}Month`);
  const [, , endDayHelpers] = useField(`${endPrefix}Day`);

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        name={field.name}
        checked={Boolean(field.value)}
        onChange={(e) => {
          const checked = e.target.checked;
          helpers.setValue(checked);
          if (checked) {
            endYearHelpers.setValue("");
            endMonthHelpers.setValue("");
            endDayHelpers.setValue("");
          }
        }}
        onBlur={field.onBlur}
        className="rounded border-slate-300"
      />
      現在も在籍中
    </label>
  );
}
