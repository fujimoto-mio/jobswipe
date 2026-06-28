import { ValidationError, type AnySchema } from "yup";

export type ValidateResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: 400 };

export async function validateBody<T>(
  schema: AnySchema<T>,
  body: unknown
): Promise<ValidateResult<T>> {
  try {
    const data = await schema.validate(body, { abortEarly: true, stripUnknown: true });
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ValidationError) {
      return { ok: false, error: err.errors[0] ?? "入力内容を確認してください", status: 400 };
    }
    throw err;
  }
}
