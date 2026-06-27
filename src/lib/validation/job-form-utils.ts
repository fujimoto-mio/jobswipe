import type { Job } from "@/lib/types";
import type { JobFormValues } from "@/lib/validation/schemas";
import { EMPLOYMENT_TYPES } from "@/lib/constants";

export const emptyJobFormValues: JobFormValues = {
  title: "",
  company: "",
  location: "",
  area: "東京都",
  category: "エンジニア",
  salary: "",
  employmentType: EMPLOYMENT_TYPES[0],
  description: "",
  requirements: "",
  benefits: "",
  tags: "",
  website: "",
  careersPage: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  jobPdf: "",
  videoUrl: "",
};

export function jobToFormValues(job: Job): JobFormValues {
  const links = job.links ?? {};
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    area: job.area as JobFormValues["area"],
    category: job.category as JobFormValues["category"],
    salary: job.salary,
    employmentType: job.employmentType as JobFormValues["employmentType"],
    description: job.description,
    requirements: job.requirements.join("\n"),
    benefits: job.benefits.join("\n"),
    tags: job.tags.join(", "),
    website: links.website ?? "",
    careersPage: links.careersPage ?? "",
    twitter: links.twitter ?? "",
    instagram: links.instagram ?? "",
    linkedin: links.linkedin ?? "",
    jobPdf: links.jobPdf ?? "",
    videoUrl: job.videoUrl,
  };
}

export function jobFormValuesToBody(values: JobFormValues, videoUrl: string, thumbnailUrl?: string) {
  return {
    title: values.title,
    company: values.company,
    location: values.location,
    area: values.area,
    category: values.category,
    salary: values.salary,
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
    videoUrl,
    thumbnailUrl,
    tags: (values.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    links: {
      website: values.website || undefined,
      careersPage: values.careersPage || undefined,
      twitter: values.twitter || undefined,
      instagram: values.instagram || undefined,
      linkedin: values.linkedin || undefined,
      jobPdf: values.jobPdf || undefined,
    },
  };
}
