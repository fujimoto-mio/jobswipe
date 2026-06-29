import { SeekerUserProvider } from "@/components/seeker/SeekerUserProvider";

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <div className="seeker-ui relative mx-auto flex h-[100dvh] min-h-0 w-full max-w-[1440px] flex-col overflow-hidden bg-white sm:border-x sm:border-slate-200 sm:shadow-[0_8px_30px_rgb(15_23_42/0.06)]">
        <SeekerUserProvider>{children}</SeekerUserProvider>
      </div>
    </div>
  );
}
