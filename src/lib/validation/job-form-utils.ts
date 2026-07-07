import type { Job } from "@/lib/types";
import type { JobFormValues } from "@/lib/validation/schemas";
import { AREAS, EMPLOYMENT_TYPES, NEW_COMPANY_VALUE } from "@/lib/constants";
import { resolveJobTags } from "@/lib/job-tags";
import { formatJobSalary, parseJobSalary } from "@/lib/validation/job-salary";

function resolveJobLocation(job: Job): string {
  if ((AREAS as readonly string[]).includes(job.location)) return job.location;
  if ((AREAS as readonly string[]).includes(job.area)) return job.area;
  const prefixMatch = AREAS.find((area) => job.location.startsWith(area));
  return prefixMatch ?? "";
}

export const emptyJobFormValues: JobFormValues = {
  title: "",
  companyId: NEW_COMPANY_VALUE,
  company: "",
  location: "東京都",
  category: "エンジニア",
  salaryMin: "",
  salaryMax: "",
  employmentType: EMPLOYMENT_TYPES[0],
  description: "",
  requirements: "",
  benefits: "",
  tags: [],
  videoUrl: "",
};

export function jobToFormValues(job: Job): JobFormValues {
  const { salaryMin, salaryMax } = parseJobSalary(job.salary);
  return {
    title: job.title,
    companyId: job.companyId,
    company: job.company,
    location: resolveJobLocation(job),
    category: job.category as JobFormValues["category"],
    salaryMin,
    salaryMax,
    employmentType: job.employmentType as JobFormValues["employmentType"],
    description: job.description,
    requirements: job.requirements.join("\n"),
    benefits: job.benefits.join("\n"),
    tags: resolveJobTags(job.tags),
    videoUrl: job.videoUrl,
  };
}

export function jobFormValuesToBody(values: JobFormValues, videoUrl?: string) {
  return {
    title: values.title,
    ...(values.companyId && values.companyId !== NEW_COMPANY_VALUE
      ? { companyId: values.companyId }
      : { company: values.company }),
    location: values.location,
    area: values.location,
    category: values.category,
    salary: formatJobSalary(values.salaryMin ?? "", values.salaryMax ?? ""),
    employmentType: values.employmentType,
    description: values.description,
    requirements: (values.requirements ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean),
    benefits: (values.benefits ?? "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean),
    videoUrl: videoUrl?.trim() || undefined,
    tags: resolveJobTags((values.tags ?? []) as string[]),
  };
}
