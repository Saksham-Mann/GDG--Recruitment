"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Departments from "@/components/Departments";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { authClient } from "@/lib/auth-client";
import CandidateStatusCard from "@/components/CandidateStatusCard";

const popupConfig = {
  header: "Recruitment Notice",
  description: "Welcome to the GDG Recruitment portal.",
  message: [
    "Sign in with your student email address to begin your application.",
    "You can apply to up to two departments.",
    "Ensure you submit your answers before the deadline.",
  ],
};

const NOTICE_STORAGE_KEY = "gdg_recruitment_notice_dismissed";

const Home = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Session hook from Better Auth
  const { data: session, isPending } = authClient.useSession();

  // Check sessionStorage on client mount to prevent re-prompting within the same session
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const hasDismissed = sessionStorage.getItem(NOTICE_STORAGE_KEY);
        if (!hasDismissed) {
          setIsDialogOpen(true);
        }
      }
    } catch {
      setIsDialogOpen(true);
    }
  }, []);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(NOTICE_STORAGE_KEY, "true");
      }
    } catch {
      // In case browser restricts sessionStorage in incognito/third-party contexts
    }
  };

  const user = session?.user;
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [candidateOverallStatus, setCandidateOverallStatus] = useState("waitlisted");

  // Fetch candidate applications if logged in
  useEffect(() => {
    if (!user?.email) return;
    let isActive = true;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/check-applications?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isActive) return;
          if (data.applications && data.applications.length > 0) {
            setCandidateApplications(data.applications);
            setCandidateOverallStatus(data.overallStatus || "waitlisted");
          }
        }
      } catch (err) {
        console.error("Failed to load user status:", err);
      }
    }

    fetchStatus();
    return () => { isActive = false; };
  }, [user?.email]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main id="main-content" className="flex-1">
        {!isPending && !user && (
          <PopupComp
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            PopupData={popupConfig}
          />
        )}
        <Hero />

        {/* Candidate Review Status Card */}
        {candidateApplications.length > 0 && (
          <section className="py-8 border-t border-border/40 bg-muted/5">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <CandidateStatusCard
                status={candidateOverallStatus}
                applications={candidateApplications}
                candidateName={user?.name || ""}
              />
            </div>
          </section>
        )}
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
