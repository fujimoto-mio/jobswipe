"use client";

import type { ReactNode } from "react";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

export default function PwaProvider({ children }: { children: ReactNode }) {
  return <PwaInstallProvider>{children}</PwaInstallProvider>;
}
