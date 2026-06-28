"use client";

import { useParams } from "next/navigation";
import JobStaffFormPage from "@/components/staff/JobStaffFormPage";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  return <JobStaffFormPage jobId={jobId} />;
}
