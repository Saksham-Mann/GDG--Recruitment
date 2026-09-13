"use client";
import React, { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate = "2026-12-31T23:59:59+05:30", className = "" }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-8 select-none pointer-events-none ${className}`}>
      {/* Column 1: Days */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none">Days</span>
        <span className="font-mono text-xl sm:text-3xl font-bold text-foreground mt-1.5 leading-none">{timeLeft.days}</span>
      </div>

      {/* Column 2: Hours */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none">Hours</span>
        <span className="font-mono text-xl sm:text-3xl font-bold text-foreground mt-1.5 leading-none">{timeLeft.hours.toString().padStart(2, "0")}</span>
      </div>

      {/* Column 3: Minutes */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none">Minutes</span>
        <span className="font-mono text-xl sm:text-3xl font-bold text-foreground mt-1.5 leading-none">{timeLeft.minutes.toString().padStart(2, "0")}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
