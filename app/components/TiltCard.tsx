"use client";

import { useRef, useState, type HTMLAttributes } from "react";

type TiltCardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function TiltCard({ className = "", children, ...rest }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string | undefined>(undefined);

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const card = ref.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateY = ((x - midX) / midX) * 6;
        const rotateX = -((y - midY) / midY) * 6;
        setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      }}
      onMouseLeave={() => setTransform(undefined)}
      style={{ transform }}
      className={`relative rounded-2xl border border-slate-200/80 bg-white/80 shadow-lg transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70 ${className}`.trim()}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-sky-500/5 dark:from-slate-800/20 dark:via-transparent dark:to-purple-500/10" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
