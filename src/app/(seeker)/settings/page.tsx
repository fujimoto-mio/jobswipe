"use client";

import { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { AnimatePresence } from "framer-motion";
import {
  Briefcase,
  FileText,
  KeyRound,
  Mail,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Trash2,
  User,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import SettingsFormModal from "@/components/seeker/SettingsFormModal";
import {
  SettingsButtonRow,
  SettingsLinkRow,
  SettingsPanel,
  SettingsSection,
  SettingsToggleRow,
} from "@/components/seeker/SettingsRows";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import { PageLoading, ButtonSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";
import { mapUserFacingError } from "@/lib/auth/errors";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import { saveProfile } from "@/lib/profile";
import { useSeekerUser } from "@/components/seeker/SeekerUserProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { emailChangeSchema, passwordChangeSchema } from "@/lib/validation/schemas";

type ActiveModal = "email" | "password" | null;

export default function SettingsPage() {
  const { profile, ready } = useSeekerUser();
  const email = profile?.email ?? "";
  const [saveCount, setSaveCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const closeModal = () => {
    setActiveModal(null);
    setEmailError("");
    setEmailMessage("");
    setPasswordError("");
    setPasswordMessage("");
  };

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      apiFetch("/api/saves")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setSaveCount(data.count ?? 0);
        }),
      fetchSeekerUnreadTotal().then((count) => {
        if (!cancelled) setUnreadChatCount(count);
      }),
    ]);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <AppPage>
        <AppHeader title="設定" backHref="/profile" />
        <PageLoading message="設定を読み込み中..." minHeight="min-h-[60vh]" />
        <BottomNav saveCount={0} chatCount={0} />
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppHeader title="設定" backHref="/profile" />

      <main className="min-h-0 flex-1 overflow-y-auto pb-[4.5rem]">
        <SettingsPanel>
          <SettingsSection title="アカウント" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsButtonRow
                icon={Mail}
                label="メールアドレス"
                detail={email}
                onClick={() => setActiveModal("email")}
              />
            </li>
          </ul>
        </SettingsPanel>

        <SettingsPanel>
          <SettingsSection title="セキュリティ" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsButtonRow
                icon={KeyRound}
                label="パスワード"
                detail="変更する"
                onClick={() => setActiveModal("password")}
              />
            </li>
          </ul>
        </SettingsPanel>

        <SettingsPanel disabled>
          <SettingsSection title="通知" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsToggleRow
                label="採用決定メール"
                description="採用が決まったときにメールでお知らせ"
                checked={true}
                comingSoon
                disabled
                onChange={() => {}}
              />
            </li>
            <li>
              <SettingsToggleRow
                label="チャット通知メール"
                description="新着メッセージのメール通知"
                checked={false}
                comingSoon
                disabled
                onChange={() => {}}
              />
            </li>
          </ul>
        </SettingsPanel>

        <SettingsPanel disabled>
          <SettingsSection title="求人" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsLinkRow href="/profile" icon={User} label="プロフィールを編集" disabled comingSoon />
            </li>
            <li>
              <SettingsButtonRow icon={SlidersHorizontal} label="求人条件を変更" disabled comingSoon />
            </li>
            <li>
              <SettingsButtonRow icon={RotateCcw} label="条件をリセット" disabled comingSoon />
            </li>
            <li>
              <SettingsLinkRow href="/liked" icon={Briefcase} label="保存した求人" disabled comingSoon />
            </li>
          </ul>
        </SettingsPanel>

        <SettingsPanel disabled>
          <SettingsSection title="サポート" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsLinkRow href="#" icon={Mail} label="お問い合わせ" disabled comingSoon />
            </li>
            <li>
              <SettingsLinkRow href="/terms" icon={FileText} label="利用規約" disabled comingSoon />
            </li>
            <li>
              <SettingsLinkRow href="/privacy" icon={Shield} label="プライバシーポリシー" disabled comingSoon />
            </li>
          </ul>
        </SettingsPanel>

        <SettingsPanel disabled>
          <SettingsSection title="その他" />
          <ul className="divide-y divide-slate-100">
            <li>
              <SettingsButtonRow icon={Trash2} label="アカウントを削除" destructive disabled comingSoon />
            </li>
          </ul>
        </SettingsPanel>
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadChatCount} />

      <AnimatePresence>
        {activeModal === "email" && (
          <SettingsFormModal title="メールアドレスを変更" onClose={closeModal}>
            <Formik
              initialValues={{ email }}
              validationSchema={emailChangeSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                setEmailError("");
                setEmailMessage("");
                const supabase = createSupabaseBrowserClient();
                if (!supabase) {
                  setEmailError("認証サービスが設定されていません");
                  setSubmitting(false);
                  return;
                }

                const { error } = await supabase.auth.updateUser({ email: values.email.trim() });
                if (error) {
                  setEmailError(mapUserFacingError(error.message));
                  setSubmitting(false);
                  return;
                }

                const res = await apiFetch("/api/profile/email", { method: "PATCH" });
                if (res.ok) {
                  const data = await res.json();
                  if (data.profile) saveProfile(data.profile);
                  setEmailMessage("メールアドレスを更新しました");
                  setTimeout(closeModal, 1200);
                } else {
                  const data = await res.json().catch(() => ({}));
                  setEmailError(
                    typeof data.error === "string"
                      ? mapUserFacingError(data.error)
                      : "プロフィールの更新に失敗しました"
                  );
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <FormTextInput name="email" label="メールアドレス" type="email" autoComplete="email" />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                  {emailMessage && <p className="text-sm text-emerald-600">{emailMessage}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex w-full items-center justify-center gap-2"
                  >
                    {isSubmitting && <ButtonSpinner />}
                    {isSubmitting ? "保存中..." : "保存する"}
                  </button>
                </Form>
              )}
            </Formik>
          </SettingsFormModal>
        )}

        {activeModal === "password" && (
          <SettingsFormModal title="パスワードを変更" onClose={closeModal}>
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={passwordChangeSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setPasswordError("");
                setPasswordMessage("");
                const supabase = createSupabaseBrowserClient();
                if (!supabase) {
                  setPasswordError("認証サービスが設定されていません");
                  setSubmitting(false);
                  return;
                }

                const { error } = await supabase.auth.updateUser({ password: values.password });
                if (error) {
                  setPasswordError(mapUserFacingError(error.message));
                  setSubmitting(false);
                  return;
                }

                resetForm();
                setPasswordMessage("パスワードを変更しました");
                setTimeout(closeModal, 1200);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <FormPassword name="password" label="新しいパスワード" autoComplete="new-password" />
                  <FormPassword name="confirmPassword" label="新しいパスワード（確認）" autoComplete="new-password" />
                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                  {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex w-full items-center justify-center gap-2"
                  >
                    {isSubmitting && <ButtonSpinner />}
                    {isSubmitting ? "保存中..." : "保存する"}
                  </button>
                </Form>
              )}
            </Formik>
          </SettingsFormModal>
        )}
      </AnimatePresence>
    </AppPage>
  );
}
