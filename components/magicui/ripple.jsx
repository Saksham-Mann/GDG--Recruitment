import React from "react";
import { cn } from "@/lib/utils";

const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 6,
  className,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [mask-image:radial-gradient(circle_at_center,white_35%,transparent_75%)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 75;
        const opacity = Math.max(0.04, mainCircleOpacity - i * 0.035);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 8 + i * 4;

        return (
          <div
            key={i}
            className="pointer-events-none absolute animate-ripple rounded-full bg-primary/5 shadow-md border"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1px",
              borderColor: `hsl(var(--primary) / ${borderOpacity}%)`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
            }}
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";

export default Ripple;
