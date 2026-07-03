import Image from "next/image";
import {
  APP_LOGO_FULL,
  APP_LOGO_MARK,
  APP_NAME_HEAD,
  APP_NAME_TAIL,
  APP_TAGLINE,
  APP_TOPBAR_NAME,
} from "@/lib/brand";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  theme?: "light" | "dark";
  inTopbar?: boolean;
};

const sizes = {
  sm: { img: "h-[4.5rem] sm:h-20", title: "text-2xl sm:text-3xl", tagline: "text-sm sm:text-base" },
  md: { img: "h-24 sm:h-28", title: "text-3xl sm:text-4xl", tagline: "text-base sm:text-lg" },
  lg: { img: "h-32 sm:h-36", title: "text-4xl sm:text-5xl", tagline: "text-lg sm:text-xl" },
};

const topbarSizes = {
  img: "h-10 w-auto sm:h-11",
  title: "text-lg sm:text-xl",
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
  const useMarkLogo = inTopbar || !showText;

  return (
    <div className={`flex items-center ${inTopbar ? "gap-2.5" : "gap-3.5 sm:gap-4"}`}>
      <Image
        src={useMarkLogo ? APP_LOGO_MARK : APP_LOGO_FULL}
        alt={APP_TOPBAR_NAME}
        width={1181}
        height={1181}
        unoptimized
        className={`${s.img} w-auto shrink-0 object-contain object-left`}
        priority={size === "lg" && !inTopbar}
      />
      {showText && (
        <div className="min-w-0">
          {inTopbar ? (
            <p className={`${s.title} font-bold leading-tight tracking-normal ${textClass}`}>
              {APP_TOPBAR_NAME}
            </p>
          ) : (
            <>
              <p className={`${s.title} font-bold leading-tight tracking-normal ${textClass}`}>
                {APP_NAME_HEAD}
                <span className="text-[var(--accent)]">{APP_NAME_TAIL}</span>
              </p>
              <p className={`${s.tagline} mt-0.5 font-medium leading-snug ${subClass}`}>
                {APP_TAGLINE}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
