"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * ShineBorder
 * Animated gradient border effect with Google / custom color pulse animation.
 */
export default function ShineBorder({
  borderRadius = 9999,
  borderWidth = 1.5,
  duration = 10,
  color = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
  className,
  children,
}) {
  const gradientColors = color instanceof Array ? color.join(",") : color;

  return (
    <div
      style={{
        "--border-radius": `${borderRadius}px`,
        "--border-width": `${borderWidth}px`,
        "--shine-pulse-duration": `${duration}s`,
        "--mask-linear-gradient": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        "--background-radial-gradient": `radial-gradient(transparent, transparent, ${gradientColors}, transparent, transparent)`,
      }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-[--border-radius] p-[--border-width] overflow-hidden",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 size-full rounded-[--border-radius] p-[--border-width] will-change-[background-position] ![-webkit-mask-composite:xor] ![mask-composite:exclude] [background-image:var(--background-radial-gradient)] [background-size:300%_300%] [mask:var(--mask-linear-gradient)] [-webkit-mask:var(--mask-linear-gradient)] motion-safe:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]"
      />
      {children}
    </div>
  );
}
