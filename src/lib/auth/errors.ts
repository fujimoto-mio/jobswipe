/** Map Supabase / API errors to user-friendly Japanese messages */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "このメールアドレスは既に登録されています。ログインしてください";
  }
  if (m.includes("password") && m.includes("least")) {
    return "パスワードは8文字以上で設定してください";
  }
  if (m.includes("valid email") || m.includes("invalid email")) {
    return "有効なメールアドレスを入力してください";
  }
  if (m.includes("email not confirmed")) {
    return "メールアドレスの確認が完了していません。受信トレイをご確認ください";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "リクエストが多すぎます。しばらくしてから再度お試しください";
  }

  return message;
}
