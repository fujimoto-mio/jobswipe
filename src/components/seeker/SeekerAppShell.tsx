"use client";

import type { ReactNode } from "react";
import { SeekerThemeProvider } from "@/components/seeker/SeekerThemeProvider";
import { SeekerUserProvider } from "@/components/seeker/SeekerUserProvider";
import PwaProvider from "@/components/pwa/PwaProvider";

export default function SeekerAppShell({ children }: { children: ReactNode }) {
  return (
    <PwaProvider>
      <SeekerThemeProvider>
        <SeekerUserProvider>{children}</SeekerUserProvider>
      </SeekerThemeProvider>
    </PwaProvider>
  );
}
