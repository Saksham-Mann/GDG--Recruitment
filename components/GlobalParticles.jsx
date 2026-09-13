"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Particles from "@/components/magicui/particles";

export default function GlobalParticles() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particleColor = mounted && resolvedTheme === "light" ? "#3b82f6" : "#ffffff";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 size-full overflow-hidden" aria-hidden="true">
      <Particles
        className="pointer-events-none absolute inset-0 size-full"
        quantity={80}
        staticity={35}
        ease={50}
        size={0.65}
        vx={0.12}
        vy={-0.08}
        color={particleColor}
        refresh={mounted}
      />
    </div>
  );
}
