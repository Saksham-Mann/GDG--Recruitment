"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollTopProgress() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
        setScrollPercentage(percentage);
      }
      setShowScrollTop(currentScroll > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Scroll Progress Bar at very top of viewport */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none transition-all duration-150"
        style={{
          width: `${scrollPercentage}%`,
          background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%)",
        }}
      />

      {/* Floating Scroll Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top of page"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:shadow-primary/25 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary animate-in fade-in zoom-in-75 duration-200"
        >
          <ArrowUp className="h-5 w-5 text-primary" />
        </button>
      )}
    </>
  );
}
