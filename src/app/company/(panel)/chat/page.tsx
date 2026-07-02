"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Briefcase, ClipboardList, MessageCircle, User, Users } from "lucide-react";
import ApplicationChatView from "@/components/chat/ApplicationChatView";
import ChatColumnSearch from "@/components/chat/ChatColumnSearch";
import ColumnResizeHandle from "@/components/chat/ColumnResizeHandle";
import ApplicationSeekerInfoModal from "@/components/staff/ApplicationSeekerInfoModal";
import JobThumbnail from "@/components/JobThumbnail";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useResizableChatColumns } from "@/hooks/useResizableChatColumns";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import type { ApplicationStatus, ApplicationWithSeeker } from "@/lib/types";
import type { JobApplicationGroupRow } from "@/lib/db/staff-applications";

function syncChatUrl(jobId: string | null, applicationId: string | null) {
  const params = new URLSearchParams();
  if (jobId) params.set("jobId", jobId);
  if (applicationId) params.set("applicationId", applicationId);
  const qs = params.toString();
  const next = qs ? `/company/chat?${qs}` : "/company/chat";
  window.history.replaceState(window.history.state, "", next);
}

function CompanyChatContent() {
  const searchParams = useSearchParams();
  const initialParamsRef = useRef({
    jobId: searchParams.get("jobId"),
    applicationId: searchParams.get("applicationId"),
  });
  const applicationsCacheRef = useRef<Map<string, ApplicationWithSeeker[]>>(new Map());

  const [jobGroups, setJobGroups] = useState<JobApplicationGroupRow[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithSeeker[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [jobFilter, setJobFilter] = useState("");
  const [seekerFilter, setSeekerFilter] = useState("");
  const [infoModalApplicationId, setInfoModalApplicationId] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<{
    name: string | null;
    avatarUrl: string | null;
    companyLogoUrl: string | null;
  }>({ name: null, avatarUrl: null, companyLogoUrl: null });

  const panelRef = useRef<HTMLDivElement>(null);
  const { jobsPercent, seekersPercent, startJobsResize, startSeekersResize } =
    useResizableChatColumns(panelRef);

  const jobsColumnClass = selectedApplicationId
    ? "hidden md:flex"
    : selectedJobId
      ? "hidden lg:flex"
      : "flex";
  const seekersColumnClass = selectedApplicationId
    ? "hidden md:flex"
    : selectedJobId
      ? "flex"
      : "hidden md:flex";
  const jobsResizeHandleClass = selectedJobId && !selectedApplicationId ? "chat-column-resize-handle--lg-only" : "";

  useEffect(() => {
    void apiFetch("/api/admin/me")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setStaffProfile({
          name: typeof data.name === "string" ? data.name : null,
          avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : null,
          companyLogoUrl: typeof data.companyLogoUrl === "string" ? data.companyLogoUrl : null,
        });
      });
  }, []);

  const loadApplicationsForJob = useCallback(async (jobId: string) => {
    const cached = applicationsCacheRef.current.get(jobId);
    if (cached) {
      setApplications(cached);
      return cached;
    }

    setApplicationsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/applications?jobId=${encodeURIComponent(jobId)}`);
      const data = await res.json().catch(() => ({}));
      const list = res.ok && Array.isArray(data.applications) ? data.applications : [];
      applicationsCacheRef.current.set(jobId, list);
      setApplications(list);
      return list;
    } catch {
      setApplications([]);
      return [];
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const { jobId: presetJobId, applicationId: presetApplicationId } = initialParamsRef.current;

    void (async () => {
      setLoading(true);
      try {
        const jobsRes = await apiFetch(
          "/api/admin/applications?view=jobs&approvalStatus=Active&limit=100&sort=postedAt&order=desc"
        );

        const jobsData = await jobsRes.json().catch(() => ({}));

        if (cancelled) return;

        const groups = Array.isArray(jobsData.items) ? (jobsData.items as JobApplicationGroupRow[]) : [];
        setJobGroups(groups);

        let jobId = presetJobId;
        let applicationId = presetApplicationId;

        if (applicationId && !jobId) {
          const appRes = await apiFetch(
            `/api/admin/applications?id=${encodeURIComponent(applicationId)}`
          );
          const appData = await appRes.json().catch(() => ({}));
          if (!cancelled && appRes.ok && appData.application?.jobId) {
            jobId = appData.application.jobId as string;
          }
        }

        if (jobId && !groups.some((group) => group.jobId === jobId)) {
          jobId = null;
          applicationId = null;
        }

        let list: ApplicationWithSeeker[] = [];
        if (jobId) {
          const res = await apiFetch(`/api/admin/applications?jobId=${encodeURIComponent(jobId)}`);
          const appData = await res.json().catch(() => ({}));
          list = Array.isArray(appData.applications) ? appData.applications : [];
          applicationsCacheRef.current.set(jobId, list);
        }

        if (cancelled) return;

        if (applicationId && !list.some((app) => app.id === applicationId)) {
          applicationId = null;
        }

        setSelectedJobId(jobId);
        setApplications(list);
        setSelectedApplicationId(applicationId);
        syncChatUrl(jobId, applicationId);
      } catch (error) {
        console.error("[CompanyChatContent] init failed", error);
        if (!cancelled) {
          setJobGroups([]);
          setApplications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectJob = useCallback(
    (jobId: string) => {
      if (jobId === selectedJobId) return;
      setSelectedJobId(jobId);
      setSelectedApplicationId(null);
      setSeekerFilter("");
      syncChatUrl(jobId, null);
      void loadApplicationsForJob(jobId);
    },
    [loadApplicationsForJob, selectedJobId]
  );

  const selectApplication = useCallback(
    (applicationId: string) => {
      if (applicationId === selectedApplicationId) return;
      setSelectedApplicationId(applicationId);
      syncChatUrl(selectedJobId, applicationId);
    },
    [selectedApplicationId, selectedJobId]
  );

  const clearJobSelection = useCallback(() => {
    setSelectedJobId(null);
    setSelectedApplicationId(null);
    setApplications([]);
    setSeekerFilter("");
    syncChatUrl(null, null);
  }, []);

  const clearApplicationSelection = useCallback(() => {
    setSelectedApplicationId(null);
    syncChatUrl(selectedJobId, null);
  }, [selectedJobId]);

  const filteredJobs = useMemo(() => {
    const q = jobFilter.trim().toLowerCase();
    if (!q) return jobGroups;
    return jobGroups.filter(
      (group) =>
        group.job.title.toLowerCase().includes(q) ||
        group.job.category.toLowerCase().includes(q) ||
        (group.job.area || group.job.location).toLowerCase().includes(q)
    );
  }, [jobGroups, jobFilter]);

  const filteredApplications = useMemo(() => {
    const q = seekerFilter.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(q) ||
        app.applicantEmail.toLowerCase().includes(q) ||
        APPLICATION_STATUS_LABELS[app.status].toLowerCase().includes(q)
    );
  }, [applications, seekerFilter]);

  const selectedJob = jobGroups.find((group) => group.jobId === selectedJobId);
  const selectedApplication = applications.find((app) => app.id === selectedApplicationId);
  const infoModalApplication = applications.find((app) => app.id === infoModalApplicationId);

  const updateApplicationInCache = useCallback(
    (applicationId: string, patch: Partial<ApplicationWithSeeker>) => {
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, ...patch } : app)));
      if (selectedJobId) {
        const cached = applicationsCacheRef.current.get(selectedJobId);
        if (cached) {
          applicationsCacheRef.current.set(
            selectedJobId,
            cached.map((app) => (app.id === applicationId ? { ...app, ...patch } : app))
          );
        }
      }
    },
    [selectedJobId]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      await apiFetch("/api/admin/applications", {
        method: "PATCH",
        body: JSON.stringify({ id: applicationId, status }),
      });
      updateApplicationInCache(applicationId, { status });
    },
    [updateApplicationInCache]
  );

  if (!loading && jobGroups.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="承認済みの求人がありません"
        description="求人が承認されると、応募者とのチャットがここに表示されます"
        action={
          <Link href="/company/jobs" className="btn-primary flex items-center gap-2 px-6">
            求人管理へ
          </Link>
        }
      />
    );
  }

  return (
    <div className="company-chat-page flex min-h-0 w-full flex-1 flex-col">
      <div className="mb-6 shrink-0 md:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">チャット</h1>
        <p className="mt-1 text-sm text-slate-500">求人を選び、応募者とメッセージのやり取り</p>
      </div>

      <div
        ref={panelRef}
        className="company-chat-panel company-chat-panel--resizable staff-ui flex min-h-0 flex-1 overflow-hidden"
        style={
          {
            "--chat-jobs-percent": `${jobsPercent}%`,
            "--chat-seekers-percent": `${seekersPercent}%`,
          } as CSSProperties
        }
      >
        {/* Jobs column */}
        <aside
          className={`company-chat-column company-chat-column--jobs flex min-h-0 flex-col ${jobsColumnClass}`}
        >
          <div className="chat-column-header">
            <div className="chat-column-header-top">
              <div className="chat-column-header-title">
                <Briefcase className="chat-column-header-icon" strokeWidth={2} aria-hidden />
                <p className="chat-column-header-label">承認済み求人</p>
              </div>
            </div>
            <ChatColumnSearch
              value={jobFilter}
              onChange={setJobFilter}
              placeholder="求人を検索..."
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {loading ? (
              <li className="flex items-center justify-center py-12">
                <PageLoading message="求人を読み込み中..." minHeight="min-h-[120px]" staff />
              </li>
            ) : filteredJobs.length === 0 ? (
              <li className="company-chat-empty company-chat-empty--inline">条件に一致する求人がありません</li>
            ) : (
              filteredJobs.map((group) => {
              const active = group.jobId === selectedJobId;
              return (
                <li key={group.jobId}>
                  <button
                    type="button"
                    onClick={() => selectJob(group.jobId)}
                    className={`company-chat-list-item ${active ? "company-chat-list-item--active" : ""}`}
                  >
                    <JobThumbnail job={group.job} className="company-chat-list-thumb" showLogoBadge={false} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`chat-list-item-title company-chat-list-item-title text-sm ${
                          active ? "company-chat-list-item-title--active" : ""
                        }`}
                        title={group.job.title}
                      >
                        {group.job.title}
                      </p>
                      <p className="chat-list-item-meta text-xs text-slate-500">
                        {group.job.category} · {group.job.area || group.job.location}
                      </p>
                    </div>
                    <span className="data-table-count-pill shrink-0">{group.applicantCount}</span>
                  </button>
                </li>
              );
            })
            )}
          </ul>
        </aside>

        <ColumnResizeHandle
          onPointerDown={startJobsResize}
          className={jobsResizeHandleClass}
        />

        {/* Seekers column */}
        <aside
          className={`company-chat-column company-chat-column--seekers flex min-h-0 flex-col ${seekersColumnClass}`}
        >
          <div className="chat-column-header">
            <div className="chat-column-header-top">
              <button
                type="button"
                onClick={clearJobSelection}
                className={`btn-icon btn-icon-muted h-8 w-8 shrink-0 ${
                  selectedApplicationId
                    ? "!hidden max-md:!inline-flex"
                    : "!hidden max-md:!inline-flex md:!inline-flex lg:!hidden"
                }`}
                aria-label="求人一覧に戻る"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <div className="chat-column-header-title">
                <Users className="chat-column-header-icon" strokeWidth={2} aria-hidden />
                <p className="chat-column-header-label">応募者</p>
              </div>
            </div>
            <ChatColumnSearch
              value={seekerFilter}
              onChange={setSeekerFilter}
              placeholder="検索..."
              disabled={!selectedJobId}
            />
          </div>

          {!selectedJobId ? (
            <div className="company-chat-empty">
              <Briefcase className="company-chat-empty-icon" strokeWidth={1.75} aria-hidden />
              <p>左の求人を選択してください</p>
            </div>
          ) : applicationsLoading ? (
            <PageLoading message="応募者を読み込み中..." minHeight="min-h-[240px]" staff />
          ) : filteredApplications.length === 0 ? (
            <div className="company-chat-empty">
              <User className="company-chat-empty-icon" strokeWidth={1.75} aria-hidden />
              <p>{applications.length === 0 ? "この求人への応募はまだありません" : "条件に一致する応募者がいません"}</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {filteredApplications.map((app) => {
                const active = app.id === selectedApplicationId;
                return (
                  <li key={app.id}>
                    <div
                      className={`company-chat-seeker-item ${active ? "company-chat-seeker-item--active" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => selectApplication(app.id)}
                        title={app.applicantName}
                        className="company-chat-seeker-select"
                      >
                        <span
                          className={`company-chat-seeker-avatar ${
                            active ? "company-chat-seeker-avatar--active" : ""
                          }`}
                          aria-hidden
                        >
                          {app.applicantName.charAt(0)}
                        </span>
                        <span
                          className={`company-chat-seeker-name ${
                            active ? "company-chat-seeker-name--active" : ""
                          }`}
                        >
                          {app.applicantName}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInfoModalApplicationId(app.id)}
                        className="btn-icon btn-icon-muted mr-2 h-8 w-8 shrink-0"
                        aria-label={`${app.applicantName}の応募情報を見る`}
                      >
                        <ClipboardList className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <ColumnResizeHandle onPointerDown={startSeekersResize} />

        {/* Chat column */}
        <section
          className={`company-chat-column company-chat-column--chat flex min-h-0 min-w-0 flex-col ${selectedApplicationId ? "flex" : "hidden md:flex"}`}
        >
          {selectedApplication && selectedJob ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="company-chat-thread-bar shrink-0 md:hidden">
                <div className="company-chat-thread-bar-inner">
                  <button
                    type="button"
                    onClick={clearApplicationSelection}
                    className="btn-icon btn-icon-muted h-9 w-9 shrink-0 !inline-flex"
                    aria-label="応募者一覧に戻る"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="chat-thread-applicant-name" title={selectedApplication.applicantName}>
                      {selectedApplication.applicantName}
                    </p>
                    <p className="chat-thread-email mt-0.5" title={selectedApplication.applicantEmail}>
                      {selectedApplication.applicantEmail}
                    </p>
                  </div>
                </div>
              </div>
              <ApplicationChatView
                key={selectedApplication.id}
                applicationId={selectedApplication.id}
                sender="company"
                seekerName={selectedApplication.applicantName}
                companyName={selectedJob.job.company}
                companyStaffName={staffProfile.name}
                companyStaffAvatarUrl={staffProfile.avatarUrl}
                emptyHint="求職者にメッセージを送って、選考や面談について連絡しましょう"
                className="min-h-0 flex-1"
                staffStyle
              />
            </div>
          ) : (
            <div className="company-chat-empty">
              <MessageCircle className="company-chat-empty-icon" strokeWidth={1.75} aria-hidden />
              <p>{selectedJobId ? "応募者を選択してチャットを開始" : "求人と応募者を選択してください"}</p>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {infoModalApplication && (
          <ApplicationSeekerInfoModal
            key={infoModalApplication.id}
            application={infoModalApplication}
            onClose={() => setInfoModalApplicationId(null)}
            onUpdateStatus={updateApplicationStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CompanyChatPage() {
  return (
    <Suspense
      fallback={
        <div className="company-chat-page flex min-h-0 w-full flex-1 flex-col">
          <div className="mb-6 shrink-0 md:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">チャット</h1>
            <p className="mt-1 text-sm text-slate-500">求人を選び、応募者とメッセージのやり取り</p>
          </div>
          <div className="company-chat-panel staff-ui flex min-h-0 flex-1 overflow-hidden">
            <PageLoading message="チャットを読み込み中..." minHeight="min-h-[480px]" staff />
          </div>
        </div>
      }
    >
      <CompanyChatContent />
    </Suspense>
  );
}
