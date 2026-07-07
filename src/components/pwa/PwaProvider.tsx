"use client";

import type { ReactNode } from "react";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";

export default function PwaProvider({
  children,
  alwaysShowInstallUi = false,
}: {
  children: ReactNode;
  alwaysShowInstallUi?: boolean;
}) {
  return <PwaInstallProvider alwaysShowInstallUi={alwaysShowInstallUi}>{children}</PwaInstallProvider>;
}
