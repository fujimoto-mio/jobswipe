import Image from "next/image";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  theme?: "light" | "dark";
  inTopbar?: boolean;
};

const sizes = {
  sm: { img: "h-14", title: "text-base sm:text-lg", tagline: "hidden sm:block text-[11px]" },
  md: { img: "h-16", title: "text-xl", tagline: "text-xs" },
  lg: { img: "h-24", title: "text-2xl", tagline: "text-sm" },
};

const topbarSizes = {
  img: "h-10",
  title: "text-sm",
  tagline: "hidden",
};

export default function Logo({
  size = "md",
  showText = true,
  theme = "light",
  inTopbar = false,
}: LogoProps) {
  const s = inTopbar ? topbarSizes : sizes[size];
  const textClass = theme === "dark" ? "text-white" : "text-slate-900";
  const subClass = theme === "dark" ? "text-white/70" : "text-slate-500";

  return (
    <div className={`flex items-center ${inTopbar ? "gap-2" : "gap-3"}`}>
      <Image
        src="/logo1.png"
        alt="#JobSwipe!"
        width={1181}
        height={1181}
        unoptimized
        className={`${s.img} w-auto shrink-0 object-contain object-left`}
        priority={size === "lg" && !inTopbar}
      />
      {showText && (
        <div className="min-w-0">
          <p className={`${s.title} font-bold leading-tight tracking-normal ${textClass}`}>
            Job<span className="text-[var(--accent)]">Swipe</span>
          </p>
          <p className={`${s.tagline} mt-0.5 font-medium leading-snug ${subClass}`}>
            動画で探す、新しい就活
          </p>
        </div>
      )}
    </div>
  );
}
