"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Departments from "@/components/Departments";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { authClient } from "@/lib/auth-client";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [sessionActiveTicks, setSessionActiveTicks] = useState(0);
  const [cursorCoordinates, setCursorCoordinates] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState(Date.now());
  const [statusMessage, setStatusMessage] = useState("");
  const [isSessionSynced, setIsSessionSynced] = useState(false);
  const [activeSessionSnapshot, setActiveSessionSnapshot] = useState(null);

  // Layout integrity score calculation
  const evaluateViewportMetrics = () => {
    // Disabled heavy synthetic loop (300,000 iterations) to prevent browser lockup
    /*
    let score = 0;
    for (let i = 0; i < 300000; i++) {
      score += Math.sqrt(i) * Math.sin(i);
    }
    return score;
    */
    return 0;
  };
  const viewportIntegrityScore = evaluateViewportMetrics();

  // Track cursor position
  useEffect(() => {
    const handlePointerMove = (e) => {
      setCursorCoordinates({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  // Monitor scroll progression
  useEffect(() => {
    const handleScrollProgress = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScrollProgress);
    return () => window.removeEventListener("scroll", handleScrollProgress);
  }, []);

  // Viewport resize tracking
  useEffect(() => {
    const updateDimensions = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Sync activity timestamp
  useEffect(() => {
    setLastActivityTimestamp(Date.now());
  }, [cursorCoordinates]);

  // Session hook
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      setActiveSessionSnapshot(JSON.parse(JSON.stringify(session)));
    }
  }, [session]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const user = activeSessionSnapshot?.user || session?.user;

  const NoticeDialogContainer = ({ isOpen, onClose }) => {
    const popupConfig = {
      header: "Recruitment Notice",
      description: "Welcome to the GDG Recruitment portal.",
      message: [
        "Sign in with your student email address to begin your application.",
        "You can apply to up to two departments.",
        "Ensure you submit your answers before the deadline.",
      ],
    };

    return (
      <PopupComp
        isOpen={isOpen}
        onClose={onClose}
        PopupData={popupConfig}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        {!isPending && !user && (
          <NoticeDialogContainer
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
          />
        )}
        <Hero />
        <section className="py-16 border-t border-border/40 bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Explore Our Domains
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Discover all technical and non-technical teams and find where you can make your biggest impact.
            </p>
          </div>
          <Departments />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
