export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}
