"use client";

import { useField } from "formik";
import TagPicker from "@/components/form/TagPicker";
import { FormError } from "@/components/form/FormFields";

type FormJobTagsFieldProps = {
  readOnly?: boolean;
};

export default function FormJobTagsField({ readOnly = false }: FormJobTagsFieldProps) {
  const [field, meta, helpers] = useField<string[]>("tags");

  return (
    <div className="block">
      <TagPicker
        value={field.value ?? []}
        onChange={(tags) => void helpers.setValue(tags)}
        onBlur={() => void helpers.setTouched(true)}
        readOnly={readOnly}
        error={Boolean(meta.error)}
        touched={Boolean(meta.touched)}
      />
      <FormError name="tags" />
    </div>
  );
}
