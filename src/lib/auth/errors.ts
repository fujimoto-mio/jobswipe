
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
    test: (m) => m === "wrong_role",
    message: "このアカウントではログインできません",
  },
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
    test: (m) => m.includes("session") && (m.includes("missing") || m.includes("not found") || m.includes("expired") || m.includes("有効期限")),
    message: "セッションの有効期限が切れました。再度ログインしてください",
  },
  {
    test: (m) => m.includes("求職者アカウント"),
    message: "応募には求職者アカウントでログインしてください",
  },
  {
    test: (m) => m === "unauthorized" || m.startsWith("unauthorized") || m === "ログインが必要です",
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
  {
    test: (m) => m === "forbidden",
    message: "この操作を行う権限がありません",
  },
  {
    test: (m) => m.includes("job not found"),
    message: "求人が見つかりません",
  },
  {
    test: (m) => m.includes("application not found"),
    message: "応募が見つかりません",
  },
  {
    test: (m) => m.includes("account not found"),
    message: "アカウントが見つかりません",
  },
  {
    test: (m) => m.includes("auth_jwt_secret is not configured"),
    message: "認証の設定が完了していません。管理者にお問い合わせください",
  },
  {
    test: (m) => m.includes("cloudflare r2 is not configured"),
    message: "ファイルストレージの設定が完了していません",
  },
  {
    test: (m) => m.includes("invalid birthday"),
    message: "生年月日が正しくありません",
  },
  {
    test: (m) => m.includes("invalid kind"),
    message: "アップロード種別が正しくありません",
  },
  {
    test: (m) => m.includes("invalid days parameter"),
    message: "日数の指定が正しくありません",
  },
  {
    test: (m) => m.includes("sign up first"),
    message: "先にアカウント登録を行ってください",
  },
  {
    test: (m) => m.includes("only admins can change approval status"),
    message: "承認ステータスの変更は管理者のみ可能です",
  },
  {
    test: (m) => m.includes("status must be active or suspended"),
    message: "ステータスはActiveまたはSuspendedを指定してください",
  },
  {
    test: (m) =>
      m.includes("email, password, companyname") ||
      m.includes("contactname are required"),
    message: "メールアドレス、パスワード、企業名、担当者名を入力してください",
  },
  {
    test: (m) => m.includes("jobid is required"),
    message: "求人IDが必要です",
  },
  {
    test: (m) => m.includes("applicationid is required"),
    message: "応募IDが必要です",
  },
  {
    test: (m) => m.includes("applicationid and content are required"),
    message: "応募IDとメッセージ内容が必要です",
  },
  {
    test: (m) => m.includes("id and status are required"),
    message: "IDとステータスが必要です",
  },
  {
    test: (m) => m.includes("id and approvalstatus are required"),
    message: "IDと承認ステータスが必要です",
  },
  {
    test: (m) => m.includes("id is required"),
    message: "IDが必要です",
  },
  {
    test: (m) => m.includes("companyid or company is required"),
    message: "企業IDまたは企業名が必要です",
  },
  {
    test: (m) => m.includes("file is required"),
    message: "ファイルを選択してください",
  },
  {
    test: (m) => m.includes("kind is required"),
    message: "アップロード種別を指定してください",
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

/** Extract and localize an API error payload for display in the UI. */
export function getApiErrorMessage(
  data: { error?: unknown; message?: unknown },
  fallback = GENERIC_JA
): string {
  const raw = data.error ?? data.message;
  if (typeof raw === "string" && raw.trim()) {
    return mapUserFacingError(raw);
  }
  return fallback;
}

/** @deprecated Use mapUserFacingError */
export const mapAuthError = mapUserFacingError;

/** @deprecated Use mapUserFacingError */
export const mapApiError = mapUserFacingError;
