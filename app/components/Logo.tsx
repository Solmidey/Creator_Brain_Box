"use client";

import Image from "next/image";

export type LogoProps = {
  mode?: "light" | "dark";
  size?: number;
  className?: string;
};

export function Logo({ mode = "dark", size = 40, className = "" }: LogoProps) {
  const src =
    mode === "light"
      ? "/creator-brain-logo-light.png"
      : "/creator-brain-logo-dark.png";

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="Creator Brain Inbox logo"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}

export default Logo;
