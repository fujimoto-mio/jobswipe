"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Pencil } from "lucide-react";
import { PageLoading, ButtonSpinner } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import { saveProfile, isProfileComplete } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { useSeekerUser } from "@/components/seeker/SeekerUserProvider";
import { useSeekerBadges } from "@/components/seeker/SeekerBadgeProvider";
import SeekerProfileFormFields from "@/components/form/SeekerProfileFormFields";
import SeekerProfileHero from "@/components/seeker/SeekerProfileHero";
import { SeekerProfileCareerView } from "@/components/seeker/SeekerProfileSections";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { calcProfileCompletion, normalizeSeekerProfileFields } from "@/lib/profile-fields";
import { profileEditSchema } from "@/lib/validation/schemas";
import type { UserProfile } from "@/lib/types";

function normalizeProfile(p: UserProfile | null): UserProfile | null {
  if (!p) return null;
  return {
    ...p,
    ...normalizeSeekerProfileFields(p),
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile: storedProfile, ready } = useSeekerUser();
  const { saveCount, chatCount: unreadChatCount } = useSeekerBadges();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!ready) return;

    const normalized = normalizeProfile(storedProfile);
    if (!isProfileComplete(normalized)) {
      router.replace("/explore");
      return;
    }

    if (!editing) {
      setProfile(normalized);
    }
  }, [ready, storedProfile, editing, router]);

  if (!ready || !profile) {
    return (
      <AppPage>
        <AppHeader title="プロフィール" onBack={() => router.push("/explore")} />
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[60vh]" />
        <BottomNav saveCount={0} chatCount={0} />
      </AppPage>
    );
  }

  const profileFormValues = {
    ...profile,
  };

  const profileCompletion = calcProfileCompletion(profile);
  const profileBio = [profile.area, profile.desiredJobType].filter(Boolean).join(" · ");

  const registrationFields: { label: string; value: string; wide?: boolean }[] = [
    { label: "性別", value: profile.gender },
    { label: "生年月日", value: formatBirthdayDisplay(profile.birthday) },
    { label: "最終学歴", value: profile.education || "未設定" },
    { label: "電話番号", value: profile.phone || "未設定" },
    { label: "住所", value: profile.address || "未設定", wide: true },
    { label: "メール", value: profile.email },
  ];

  return (
    <AppPage>
      <AppHeader
        title="プロフィール"
        onBack={() => router.push("/explore")}
      />

      <main className="profile-page min-h-0 flex-1 overflow-y-auto pb-[4.5rem]">
        <SeekerProfileHero
          profile={profile}
          onProfileUpdate={setProfile}
          name={profile.name}
          bio={profileBio || undefined}
          editable={!editing}
          nameAction={
            !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="profile-edit-btn"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                編集
              </button>
            ) : undefined
          }
        >
          {!editing && (
            <>
              <div className="profile-stats">
                <div className="profile-stat-item">
                  <span className="profile-stat-value">{profileCompletion}%</span>
                  <span className="profile-stat-label">完成度</span>
                </div>
              </div>

              <div className="profile-completion">
                <div className="profile-completion-track">
                  <div
                    className="profile-completion-fill"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </SeekerProfileHero>

        {!editing && <SeekerProfileCareerView profile={profile} />}

        {/* Profile info / edit */}
        <section className="profile-panel">
          <div className="profile-panel-header">
            <p className="profile-panel-title">登録情報</p>
          </div>

          {editing ? (
            <div className="profile-panel-body">
              <Formik
                initialValues={profileFormValues}
                validationSchema={profileEditSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                  setSaveError("");
                  const payload = {
                    ...values,
                    workHistory: values.workHistory.filter(
                      (entry) => entry.company.trim() || entry.role.trim()
                    ),
                    skills: values.skills.filter(
                      (skill) => skill.name.trim() && skill.years.trim()
                    ),
                  };
                  const res = await apiFetch("/api/profile", {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    saveProfile(data.profile);
                    setProfile(data.profile);
                    setEditing(false);
                  } else {
                    const data = await res.json().catch(() => ({}));
                    setSaveError(typeof data.error === "string" ? data.error : "保存に失敗しました");
                  }
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, submitForm, resetForm }) => (
                  <Form className="profile-form seeker-auth-form">
                    <SeekerProfileFormFields showEmail showCareerProfile emailReadOnly stackedLayout />
                    {saveError ? (
                      <p className="seeker-auth-alert seeker-auth-alert--error">{saveError}</p>
                    ) : null}
                    <div className="profile-form-actions">
                      <button
                        type="button"
                        onClick={() => submitForm()}
                        disabled={isSubmitting}
                        className="profile-form-submit seeker-auth-submit btn-primary flex w-full items-center justify-center gap-2"
                      >
                        {isSubmitting && <ButtonSpinner />}
                        {isSubmitting ? "保存中..." : "保存する"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setEditing(false);
                        }}
                        disabled={isSubmitting}
                        className="profile-form-submit btn-secondary flex w-full items-center justify-center"
                      >
                        キャンセル
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div className="profile-panel-body profile-panel-body--flush">
              <div className="profile-info-list">
              {registrationFields.map(({ label, value, wide }) => (
                  <div key={label} className="profile-info-row">
                    <p className="profile-field-label">{label}</p>
                    <p className={`profile-info-value ${wide ? "whitespace-pre-wrap break-words text-right" : "truncate"}`}>
                      {value || "未設定"}
                    </p>
                  </div>
              ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadChatCount} />
    </AppPage>
  );
}
