/** Returns true if the string already contains Japanese characters. */
function hasJapanese(text: string): boolean {
  return /[\u3000-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text);
}

type ErrorRule = {
  test: (message: string) => boolean;
  message: string;
};

const ERROR_RULES: ErrorRule[] = [
  {
    test: (m) => m.includes("invalid login credentials") || m.includes("invalid credentials"),
    message: "メールアドレスまたはパスワードが正しくありません",
  },
  {
    test: (m) =>
      m.includes("different from the old password") ||
      m.includes("same password") ||
      m.includes("should be different"),
    message: "新しいパスワードは現在のパスワードと異なるものを設定してください",
  },
  {
    test: (m) => m.includes("user already registered") || m.includes("already been registered") || m.includes("already exists"),
    message: "このメールアドレスは既に登録されています。ログインしてください",
  },
  {
    test: (m) => (m.includes("password") && m.includes("least")) || m.includes("weak password"),
    message: "パスワードは8文字以上で設定してください",
  },
  {
    test: (m) => m.includes("valid email") || m.includes("invalid email") || m.includes("unable to validate email"),
    message: "有効なメールアドレスを入力してください",
  },
  {
    test: (m) => m.includes("email not confirmed") || m.includes("email confirmation"),
    message: "メールアドレスの確認が完了していません。受信トレイをご確認ください",
  },
  {
    test: (m) => m.includes("reauthentication") || m.includes("re-auth"),
    message: "セキュリティのため、再度ログインしてから変更してください",
  },
  {
    test: (m) =>
      m.includes("rate limit") ||
      m.includes("too many requests") ||
      (m.includes("after") && m.includes("seconds")),
    message: "リクエストが多すぎます。しばらくしてから再度お試しください",
  },
  {
    test: (m) => m.includes("session") && (m.includes("missing") || m.includes("not found") || m.includes("expired")),
    message: "セッションの有効期限が切れました。再度ログインしてください",
  },
  {
    test: (m) => m.includes("user not found"),
    message: "ユーザーが見つかりません",
  },
  {
    test: (m) => m.includes("network") || m.includes("fetch"),
    message: "通信エラーが発生しました。接続を確認してください",
  },
  {
    test: (m) => m === "unauthorized" || m.startsWith("unauthorized"),
    message: "ログインが必要です",
  },
  {
    test: (m) => m.includes("not found"),
    message: "データが見つかりません",
  },
  {
    test: (m) => m.includes("invalid json"),
    message: "リクエストの形式が正しくありません",
  },
  {
    test: (m) => m.includes("account deletion failed") || m.includes("deletion failed"),
    message: "アカウントの削除に失敗しました",
  },
  {
    test: (m) => m.includes("upload failed"),
    message: "アップロードに失敗しました",
  },
  {
    test: (m) => m.includes("invalid request"),
    message: "リクエストが正しくありません",
  },
];

const GENERIC_JA = "処理に失敗しました。しばらくしてから再度お試しください";

/** Map Supabase / API / unknown errors to user-friendly Japanese messages. */
export function mapUserFacingError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return GENERIC_JA;
  if (hasJapanese(trimmed)) return trimmed;

  const normalized = trimmed.toLowerCase();

  for (const rule of ERROR_RULES) {
    if (rule.test(normalized)) return rule.message;
  }

  return GENERIC_JA;
}

/** @deprecated Use mapUserFacingError */
export const mapAuthError = mapUserFacingError;

/** @deprecated Use mapUserFacingError */
export const mapApiError = mapUserFacingError;
