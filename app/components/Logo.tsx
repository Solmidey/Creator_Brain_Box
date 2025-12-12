// Placeholder logo assets for Creator Brain Inbox; replace the SVGs in /public without changing this component.
import Image from "next/image";
import type { FC } from "react";

export type LogoProps = {
  mode?: "light" | "dark";
  className?: string;
  size?: number;
};

const Logo: FC<LogoProps> = ({ mode = "dark", className = "", size = 32 }) => {
  const src = mode === "light" ? "/creator-brain-logo-light.svg" : "/creator-brain-logo-dark.svg";

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-transparent ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="Creator Brain logo" width={size} height={size} className="h-full w-full object-cover" />
    </div>
  );
};

export default Logo;
