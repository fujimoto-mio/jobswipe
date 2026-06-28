import type { JobLinks } from "@/lib/types";

export function asJobLinks(value: unknown): JobLinks {
  if (!value || typeof value !== "object") return {};
  return value as JobLinks;
}

export function companyLinkFormValues(links: unknown) {
  const parsed = asJobLinks(links);
  return {
    careersPage: parsed.careersPage ?? "",
    twitter: parsed.twitter ?? "",
    instagram: parsed.instagram ?? "",
    linkedin: parsed.linkedin ?? "",
  };
}

export function companyLinksFromForm(values: {
  careersPage?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}): JobLinks {
  const links: JobLinks = {};
  const careersPage = values.careersPage?.trim();
  const twitter = values.twitter?.trim();
  const instagram = values.instagram?.trim();
  const linkedin = values.linkedin?.trim();
  if (careersPage) links.careersPage = careersPage;
  if (twitter) links.twitter = twitter;
  if (instagram) links.instagram = instagram;
  if (linkedin) links.linkedin = linkedin;
  return links;
}

export function resolveJobLinks(company: { website: string | null; links: unknown }, jobLinks: unknown): JobLinks {
  const fromCompany = asJobLinks(company.links);
  const fromJob = asJobLinks(jobLinks);
  return {
    website: company.website ?? fromCompany.website ?? fromJob.website,
    careersPage: fromCompany.careersPage ?? fromJob.careersPage,
    twitter: fromCompany.twitter ?? fromJob.twitter,
    instagram: fromCompany.instagram ?? fromJob.instagram,
    linkedin: fromCompany.linkedin ?? fromJob.linkedin,
  };
}

export function hasAnyJobLinks(links: JobLinks): boolean {
  return Boolean(
    links.careersPage ||
      links.twitter ||
      links.instagram ||
      links.linkedin
  );
}
