"use client";

import { useParams } from "next/navigation";
import JobStaffViewPage from "@/components/staff/JobStaffViewPage";

export default function ViewJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  return <JobStaffViewPage jobId={jobId} />;
}
