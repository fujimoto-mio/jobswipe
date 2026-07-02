const PROFILE_INFO_LABELS = ["社名", "コーポレートサイト", "郵便番号", "所在地"] as const;

const TEXT_LINE_WIDTHS = ["100%", "92%", "78%"] as const;

function ProfileTextSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="company-profile-skeleton-text-group" aria-hidden>
      {TEXT_LINE_WIDTHS.map((width, index) => (
        <div
          key={index}
          className="dashboard-skeleton-line company-profile-skeleton-text"
          style={{ width, animationDelay: `${delay + index * 70}ms` }}
        />
      ))}
    </div>
  );
}

function ProfileInfoTableSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="company-profile-info-table">
      {PROFILE_INFO_LABELS.map((label, index) => (
        <div key={label} className="company-profile-info-row">
          <div className="company-profile-info-label">{label}</div>
          <div className="company-profile-info-value">
            <div
              className="dashboard-skeleton-line company-profile-skeleton-info-value"
              style={{ animationDelay: `${delay + index * 80}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompanyProfilePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="プロフィールを読み込み中">
      <section className="company-profile-hero" aria-hidden>
        <div className="dashboard-skeleton-line company-profile-skeleton-banner" />
        <div className="company-profile-hero-body">
          <div className="dashboard-skeleton-line company-profile-skeleton-logo shrink-0" />
          <div className="company-profile-hero-meta min-w-0 flex-1">
            <div className="dashboard-skeleton-line company-profile-skeleton-hero-title" />
            <div className="dashboard-skeleton-line company-profile-skeleton-hero-link" />
          </div>
        </div>
      </section>

      <div className="company-profile-layout">
        <main>
          <section className="company-profile-section">
            <div className="company-profile-section-header">
              <h2 className="company-profile-section-title">企業概要</h2>
            </div>
            <div className="company-profile-section-body">
              <ProfileTextSkeleton delay={0} />
            </div>
          </section>

          <section className="company-profile-section">
            <div className="company-profile-section-header">
              <h2 className="company-profile-section-title">事業内容</h2>
            </div>
            <div className="company-profile-section-body">
              <ProfileTextSkeleton delay={210} />
            </div>
          </section>

          <section className="company-profile-section">
            <div className="company-profile-section-header">
              <h2 className="company-profile-section-title">会社情報</h2>
            </div>
            <div className="company-profile-section-body">
              <ProfileInfoTableSkeleton delay={420} />
            </div>
          </section>
        </main>

        <aside className="company-profile-sidebar">
          <div className="company-profile-side-card">
            <h3 className="company-profile-side-card-title">担当者（チャット）</h3>
            <div className="company-profile-staff-row">
              <div className="dashboard-skeleton-line company-profile-skeleton-avatar shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="dashboard-skeleton-line company-profile-skeleton-staff-name" />
                <div className="dashboard-skeleton-line company-profile-skeleton-staff-note" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="dashboard-skeleton-line company-profile-skeleton-email-label" />
              <div className="dashboard-skeleton-line company-profile-skeleton-email-value" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
