import Image from "next/image";
import type { FC } from "react";

export type LogoProps = {
  mode?: "light" | "dark";
  size?: number; // px, default 32
  className?: string; // extra Tailwind classes
};

const Logo: FC<LogoProps> = ({ mode = "dark", className = "", size = 32 }) => {
  const src = mode === "light" ? "/creator-brain-logo-light.png" : "/creator-brain-logo-dark.png";

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white/80 shadow-lg transition-transform duration-300 hover:rotate-[0.5deg] hover:scale-[1.03] dark:bg-slate-900/70 ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/20 via-transparent to-purple-500/10" />
      <Image
        src={src}
        alt="Creator Brain logo"
        width={size}
        height={size}
        className="relative h-full w-full object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
