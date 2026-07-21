import {
  EmploymentType,
  JobApprovalStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { getCompanyLogoUrl } from "../src/lib/job-image";

const DEMO_COMPANY_EMAIL = "company@jobswipe.app";
const DEMO_SEEKER_EMAILS = ["seeker@jobswipe.app", "webapp.superdev+1@gmail.com"] as const;

const DEMO_JOB_IDS = {
  fe: "demo-tech-job-fe",
  be: "demo-tech-job-be",
  design: "demo-tech-job-design",
} as const;

const DEMO_APPLICATION_IDS = {
  seekerFe: "demo-app-seeker-fe",
  test1Fe: "demo-app-test1-fe",
  seekerBe: "demo-app-seeker-be",
  test1Be: "demo-app-test1-be",
} as const;

const SAMPLE_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-a-laptop-in-an-office-4819-large.mp4";

type SeekerRef = {
  id: string;
  email: string;
  name: string;
  area: string;
  desiredJobType: string;
  birthday: Date;
};

async function requireCompany(prisma: PrismaClient) {
  const account = await prisma.account.findUnique({
    where: { email: DEMO_COMPANY_EMAIL },
    include: { company: true },
  });

  if (!account?.companyId || !account.company) {
    throw new Error(`Company account not found: ${DEMO_COMPANY_EMAIL}`);
  }

  return { account, company: account.company };
}

async function requireSeekers(prisma: PrismaClient) {
  const seekers: SeekerRef[] = [];

  for (const email of DEMO_SEEKER_EMAILS) {
    const row = await prisma.seekerProfile.findUnique({ where: { email } });
    if (!row) {
      throw new Error(`Seeker profile not found: ${email}`);
    }
    seekers.push({
      id: row.id,
      email: row.email,
      name: row.name,
      area: row.area,
      desiredJobType: row.desiredJobType,
      birthday: row.birthday,
    });
  }

  return {
    demo: seekers.find((s) => s.email === "seeker@jobswipe.app")!,
    test1: seekers.find((s) => s.email === "webapp.superdev+1@gmail.com")!,
  };
}

async function seedCompanyProfile(prisma: PrismaClient, companyId: string, companyName: string) {
  await prisma.company.update({
    where: { id: companyId },
    data: {
      logoUrl: getCompanyLogoUrl(companyName),
      description:
        "テックスタートは、動画で魅力を伝える次世代の採用体験を提供するスタートアップです。少人数のチームでプロダクト開発から採用ブランディングまで幅広く担当し、スピード感のある意思決定が特徴です。",
      website: "https://techstart.example.com",
      postalCode: "150-0001",
      address: "東京都渋谷区神宮前1-2-3 テックスタートビル 5F",
      links: {
        twitter: "https://twitter.com/techstart",
        linkedin: "https://linkedin.com/company/techstart",
        note: "https://note.com/techstart",
      },
      status: "Active",
    },
  });
}

function jobBase(companyId: string): Omit<Prisma.JobCreateInput, "id" | "title" | "approvalStatus" | "approvedAt"> {
  return {
    company: { connect: { id: companyId } },
    location: "東京都渋谷区（リモート可）",
    area: "東京都",
    category: "エンジニア",
    salaryDisplay: "年収 550万〜850万円",
    employmentType: EmploymentType.FullTime,
    description:
      "動画で魅力を伝える採用プラットフォームの開発に携わっていただきます。フロントエンドからバックエンドまで、プロダクト改善に直接関われる環境です。",
    requirements: ["Webアプリ開発の実務経験", "チームでの開発経験", "自走して課題解決できる方"],
    benefits: ["フルリモート可", "フレックスタイム", "書籍・勉強会支援"],
    tags: ["スタートアップ", "リモート可", "フレックス"],
    videoUrl: SAMPLE_VIDEO,
    thumbnailUrl: "/companies/job-001.jpg",
    links: {
      website: "https://techstart.example.com/careers",
      careersPage: "https://techstart.example.com/careers",
    },
    viewCount: 128,
    postedAt: new Date("2026-06-20T00:00:00.000Z"),
  };
}

async function seedJobs(prisma: PrismaClient, companyId: string) {
  const base = jobBase(companyId);
  const now = new Date();

  const jobs: Array<{
    id: string;
    title: string;
    approvalStatus: JobApprovalStatus;
    approvedAt: Date | null;
    category?: string;
  }> = [
    {
      id: DEMO_JOB_IDS.fe,
      title: "フロントエンドエンジニア（デモ）",
      approvalStatus: JobApprovalStatus.Active,
      approvedAt: now,
    },
    {
      id: DEMO_JOB_IDS.be,
      title: "バックエンドエンジニア（デモ）",
      approvalStatus: JobApprovalStatus.Active,
      approvedAt: now,
    },
    {
      id: DEMO_JOB_IDS.design,
      title: "プロダクトデザイナー（審査中デモ）",
      approvalStatus: JobApprovalStatus.Pending,
      approvedAt: null,
      category: "デザイナー",
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      create: {
        id: job.id,
        title: job.title,
        approvalStatus: job.approvalStatus,
        approvedAt: job.approvedAt,
        category: job.category ?? base.category,
        company: base.company,
        location: base.location,
        area: base.area,
        salaryDisplay: base.salaryDisplay,
        employmentType: base.employmentType,
        description: base.description,
        requirements: base.requirements,
        benefits: base.benefits,
        tags: base.tags,
        videoUrl: base.videoUrl,
        thumbnailUrl: base.thumbnailUrl,
        links: base.links,
        viewCount: base.viewCount,
        postedAt: base.postedAt,
      },
      update: {
        title: job.title,
        approvalStatus: job.approvalStatus,
        approvedAt: job.approvedAt,
        category: job.category ?? base.category,
        company: base.company,
        location: base.location,
        area: base.area,
        salaryDisplay: base.salaryDisplay,
        employmentType: base.employmentType,
        description: base.description,
        requirements: base.requirements,
        benefits: base.benefits,
        tags: base.tags,
        videoUrl: base.videoUrl,
        thumbnailUrl: base.thumbnailUrl,
        links: base.links,
      },
    });
  }

  return jobs.map((job) => job.id);
}

async function seedApplications(
  prisma: PrismaClient,
  seekers: Awaited<ReturnType<typeof requireSeekers>>
) {
  const applications = [
    {
      id: DEMO_APPLICATION_IDS.seekerFe,
      seeker: seekers.demo,
      jobId: DEMO_JOB_IDS.fe,
      status: "scheduling",
      message: "御社のプロダクトに興味があり、フロントエンド開発で貢献したいです。",
    },
    {
      id: DEMO_APPLICATION_IDS.test1Fe,
      seeker: seekers.test1,
      jobId: DEMO_JOB_IDS.fe,
      status: "new",
      message: "React/Next.jsの経験があります。ぜひお話しできれば嬉しいです。",
    },
    {
      id: DEMO_APPLICATION_IDS.seekerBe,
      seeker: seekers.demo,
      jobId: DEMO_JOB_IDS.be,
      status: "new",
      message: "バックエンド/API設計の経験があります。",
    },
    {
      id: DEMO_APPLICATION_IDS.test1Be,
      seeker: seekers.test1,
      jobId: DEMO_JOB_IDS.be,
      status: "interview_done",
      message: "面談まで進めていただきありがとうございます。",
    },
  ] as const;

  for (const app of applications) {
    await prisma.application.upsert({
      where: { id: app.id },
      create: {
        id: app.id,
        seekerId: app.seeker.id,
        jobId: app.jobId,
        applicantName: app.seeker.name,
        applicantEmail: app.seeker.email,
        applicantBirthday: app.seeker.birthday,
        applicantArea: app.seeker.area,
        applicantJobType: app.seeker.desiredJobType,
        message: app.message,
        status: app.status,
        companyReadAt: app.status === "new" ? null : new Date(),
      },
      update: {
        applicantName: app.seeker.name,
        applicantEmail: app.seeker.email,
        applicantBirthday: app.seeker.birthday,
        applicantArea: app.seeker.area,
        applicantJobType: app.seeker.desiredJobType,
        message: app.message,
        status: app.status,
      },
    });
  }
}

async function seedChatMessages(prisma: PrismaClient, companyAccountName: string | null) {
  const threads = [
    {
      applicationId: DEMO_APPLICATION_IDS.seekerFe,
      messages: [
        {
          id: "demo-chat-seeker-fe-1",
          sender: "seeker",
          content: "こんにちは。フロントエンドエンジニア（デモ）の求人に応募しました。",
        },
        {
          id: "demo-chat-seeker-fe-2",
          sender: "company",
          senderName: companyAccountName ?? "採用担当者",
          content: "ご応募ありがとうございます。まずは30分ほどカジュアル面談をご案内できますか？",
        },
        {
          id: "demo-chat-seeker-fe-3",
          sender: "seeker",
          content: "はい、来週の平日午後であれば調整可能です。よろしくお願いします。",
        },
      ],
    },
    {
      applicationId: DEMO_APPLICATION_IDS.test1Be,
      messages: [
        {
          id: "demo-chat-test1-be-1",
          sender: "company",
          senderName: companyAccountName ?? "採用担当者",
          content: "先日は面談ありがとうございました。選考結果は近日中にご連絡します。",
        },
        {
          id: "demo-chat-test1-be-2",
          sender: "seeker",
          content: "こちらこそありがとうございました。結果をお待ちしております。",
        },
      ],
    },
  ] as const;

  for (const thread of threads) {
    for (const message of thread.messages) {
      await prisma.chatMessage.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          applicationId: thread.applicationId,
          sender: message.sender,
          senderName: "senderName" in message ? message.senderName : null,
          content: message.content,
          createdAt: new Date(),
        },
        update: {
          content: message.content,
          senderName: "senderName" in message ? message.senderName : null,
        },
      });
    }
  }
}

async function seedSavedJobs(prisma: PrismaClient, seekers: Awaited<ReturnType<typeof requireSeekers>>) {
  const pairs = [
    { seekerId: seekers.demo.id, jobId: DEMO_JOB_IDS.fe },
    { seekerId: seekers.demo.id, jobId: DEMO_JOB_IDS.design },
    { seekerId: seekers.test1.id, jobId: DEMO_JOB_IDS.fe },
    { seekerId: seekers.test1.id, jobId: DEMO_JOB_IDS.be },
  ];

  for (const pair of pairs) {
    await prisma.savedJob.upsert({
      where: {
        seekerId_jobId: {
          seekerId: pair.seekerId,
          jobId: pair.jobId,
        },
      },
      create: {
        seekerId: pair.seekerId,
        jobId: pair.jobId,
        message: "デモ用に保存した求人です。",
      },
      update: {
        message: "デモ用に保存した求人です。",
      },
    });
  }
}

export async function seedDemoWorkflowData(prisma: PrismaClient) {
  const { account, company } = await requireCompany(prisma);
  const seekers = await requireSeekers(prisma);

  await seedCompanyProfile(prisma, company.id, company.name);
  const jobIds = await seedJobs(prisma, company.id);
  await seedApplications(prisma, seekers);
  await seedChatMessages(prisma, account.name);
  await seedSavedJobs(prisma, seekers);

  console.log("Seeded demo workflow data for existing users:");
  console.log(`  Company: ${company.name} (${DEMO_COMPANY_EMAIL})`);
  console.log(`  Seekers: ${DEMO_SEEKER_EMAILS.join(", ")}`);
  console.log(`  Jobs: ${jobIds.join(", ")}`);
  console.log(`  Applications: ${Object.values(DEMO_APPLICATION_IDS).join(", ")}`);
}
