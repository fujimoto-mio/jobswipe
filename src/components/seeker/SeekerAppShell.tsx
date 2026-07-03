"use client";

import type { ReactNode } from "react";
import { SeekerThemeProvider } from "@/components/seeker/SeekerThemeProvider";
import { SeekerUserProvider } from "@/components/seeker/SeekerUserProvider";

export default function SeekerAppShell({ children }: { children: ReactNode }) {
  return (
    <SeekerThemeProvider>
      <SeekerUserProvider>{children}</SeekerUserProvider>
    </SeekerThemeProvider>
  );
}
