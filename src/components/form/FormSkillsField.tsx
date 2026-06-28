"use client";

import { FieldArray, useField } from "formik";
import { Plus, Trash2 } from "lucide-react";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import { FormError } from "@/components/form/FormFields";
import { EXPERIENCE_LEVELS } from "@/lib/constants";
import { EMPTY_SKILL_ENTRY } from "@/lib/profile-fields";

type FormSkillsFieldProps = {
  name: string;
  label: string;
};

type SkillRowProps = {
  name: string;
  index: number;
  onRemove: () => void;
};

function fieldClass(error?: string, touched?: boolean) {
  return touched && error ? "input-field ring-1 ring-red-300" : "input-field";
}

function SkillRow({ name, index, onRemove }: SkillRowProps) {
  const namePath = `${name}.${index}.name`;
  const yearsPath = `${name}.${index}.years`;
  const [nameField, nameMeta] = useField(namePath);
  const [yearsField, yearsMeta, yearsHelpers] = useField(yearsPath);

  const hasError = Boolean(
    (nameMeta.error && nameMeta.touched) || (yearsMeta.error && yearsMeta.touched)
  );

  return (
    <div className="profile-skill-row-wrap">
      <div className="profile-skill-row">
        <input
          {...nameField}
          type="text"
          placeholder="スキル名"
          aria-label="スキル名"
          className={fieldClass(nameMeta.error, nameMeta.touched)}
        />
        <FormSelectPicker
          name={yearsField.name}
          value={yearsField.value ?? ""}
          options={EXPERIENCE_LEVELS}
          placeholder="経験年数"
          title="経験年数"
          compact
          error={Boolean(yearsMeta.error)}
          touched={Boolean(yearsMeta.touched)}
          onChange={(value) => yearsHelpers.setValue(value)}
          onBlur={() => yearsHelpers.setTouched(true)}
        />
        <button
          type="button"
          onClick={onRemove}
          className="btn-icon btn-icon-muted profile-skill-row-remove"
          aria-label="スキルを削除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {hasError && (
        <div className="profile-skill-row-errors">
          <FormError name={namePath} />
          <FormError name={yearsPath} />
        </div>
      )}
    </div>
  );
}

export default function FormSkillsField({ name, label }: FormSkillsFieldProps) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <FieldArray name={name}>
        {({ push, remove, form }) => {
          const skills = (form.values[name] as typeof EMPTY_SKILL_ENTRY[] | undefined) ?? [];
          return (
            <div className="space-y-2">
              {skills.length > 0 && (
                <div className="profile-skill-list">
                  {skills.map((_, index) => (
                    <SkillRow key={index} name={name} index={index} onRemove={() => remove(index)} />
                  ))}
                </div>
              )}
              {skills.length < 30 && (
                <button
                  type="button"
                  onClick={() => push({ ...EMPTY_SKILL_ENTRY })}
                  className="btn-secondary flex w-full items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  スキルを追加
                </button>
              )}
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}
