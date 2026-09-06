"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { reviews } from "@/constants";
import { Check, CheckCircle2, ArrowRight, Sparkles, Layers, Info, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { authClient } from "@/lib/auth-client";
import CandidateStatusCard from "@/components/CandidateStatusCard";
import DepartmentGridSkeleton from "@/components/skeletons/DepartmentGridSkeleton";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const departments = reviews;

const DepartmentsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments } = useSubmissions();
  const [selectionNotice, setSelectionNotice] = useState(null);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [candidateOverallStatus, setCandidateOverallStatus] = useState("waitlisted");

  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);

  // Ingest pre-selected departments from exploration query parameters
  useEffect(() => {
    const preselected = searchParams?.get("selected") || searchParams?.get("select");
    if (preselected) {
      const requested = preselected
        .split(",")
        .map((d) => decodeURIComponent(d).trim().toLowerCase());

      const matched = departments
        .filter((dept) => requested.includes(dept.name.toLowerCase()))
        .map((dept) => dept.name)
        .slice(0, 2);

      if (matched.length > 0) {
        setSelectedDepartments(matched);
        toast.success(
          `Pre-selected ${matched.join(" and ")} from your domain exploration!`,
          {
            description: "Review your selection and click Continue to proceed to the application form.",
          }
        );
      }
    }
  }, [searchParams]);

  // Fetch candidate applications and review status
  useEffect(() => {
    if (!user?.email) return;
    let isActive = true;

    async function fetchCandidateStatus() {
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
        console.error("Failed to load candidate status:", err);
      }
    }

    fetchCandidateStatus();
    return () => { isActive = false; };
  }, [user?.email, submittedDepartments]);

  // Synchronize count and remaining slots
  useEffect(() => {
    setSelectedCount(selectedDepartments.length);
  }, [selectedDepartments]);

  useEffect(() => {
    setRemainingSlots(Math.max(0, 2 - (submittedDepartments?.length || 0)));
  }, [submittedDepartments]);

  useEffect(() => {
    const ids = departments
      .filter((dept) => selectedDepartments.includes(dept.name))
      .map((dept) => dept.id);
    setSelectedIds(ids);
  }, [selectedDepartments]);

  useEffect(() => {
    setIsContinueDisabled(selectedIds.length === 0);
  }, [selectedIds]);

  const toggleDepartment = (departmentName) => {
    if (submittedDepartments?.includes(departmentName)) {
      setSelectionNotice({
        type: "info",
        message: `You have already submitted an application for ${departmentName}.`,
      });
      return;
    }

    if (remainingSlots <= 0) {
      setSelectionNotice({
        type: "error",
        message: "You have already submitted the maximum allowed (2) applications for this cycle.",
      });
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        setSelectionNotice(null);
        return current.filter((name) => name !== departmentName);
      }

      if (current.length >= remainingSlots) {
        setSelectionNotice({
          type: "error",
          message: `Department Limit Reached: You can select at most ${remainingSlots} department${remainingSlots > 1 ? "s" : ""}. Deselect a selected domain to pick another.`,
        });
        return current;
      }

      setSelectionNotice(null);
      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main id="main-content" className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-border/40">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
                <Layers className="h-3.5 w-3.5" />
                <span>Step 01 · Department Selection</span>
              </div>
              <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground ${spaceGrotesk.className}`}>
                Pick Your Domains
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                Select up to <strong>two</strong> departments you would like to apply for. You will answer tailored questions for each selected domain in the next step.
              </p>
            </div>

            {/* Selection Counter & CTA Button */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Selected</span>
                <span className="text-lg font-bold text-foreground">
                  <span className="text-primary">{selectedCount}</span> / 2
                </span>
              </div>
              <Button
                size="lg"
                onClick={goToApplication}
                disabled={isContinueDisabled}
                className="rounded-full px-6 font-semibold shadow-md transition-all hover:shadow-primary/25 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Candidate Application Review Status Card */}
          {candidateApplications.length > 0 && (
            <div className="mt-6">
              <CandidateStatusCard
                status={candidateOverallStatus}
                applications={candidateApplications}
                candidateName={user?.name || ""}
              />
            </div>
          )}

          {/* Inline Department Limit Warning / Feedback Banner */}
          {selectionNotice && (
            <div
              id="department-limit-notice"
              role="alert"
              aria-live="assertive"
              className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-medium animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none ${
                selectionNotice.type === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-500 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
                  : "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-current" />
                <span>{selectionNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectionNotice(null)}
                className="p-1 rounded-md text-current hover:bg-current/10 transition-colors"
                aria-label="Dismiss limit warning"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Department Cards Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none">
            {departments.map((department, index) => {
              const isSelected = selectedDepartments.includes(department.name);
              const isSubmitted = submittedDepartments?.includes(department.name);
              const IconComponent = department.icon;

              return (
                <div
                  key={department.id || index}
                  style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
                  onClick={() => !isSubmitted && toggleDepartment(department.name)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1 ease-out motion-reduce:animate-none motion-reduce:transition-none ${
                    isSubmitted
                      ? "opacity-50 cursor-not-allowed border-border/40 bg-muted/20"
                      : isSelected
                      ? "cursor-pointer border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]"
                      : "cursor-pointer border-border/60 bg-card/60 hover:border-primary/50 hover:bg-card hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Header Row: Icon & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
                        style={{
                          backgroundColor: department.tone ? `${department.tone}20` : "rgba(59, 130, 246, 0.1)",
                          color: department.tone || "#3b82f6",
                        }}
                      >
                        {IconComponent ? (
                          <IconComponent className="h-6 w-6" />
                        ) : (
                          <Layers className="h-6 w-6" />
                        )}
                      </div>

                      {isSubmitted ? (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          Submitted
                        </Badge>
                      ) : (
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>

                    {/* Department Title */}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {department.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {department.description || "Contribute to impactful projects with passionate peers."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {isSelected ? (
                        <span className="font-semibold text-primary">Selected</span>
                      ) : isSubmitted ? (
                        "Already Applied"
                      ) : (
                        "Click to Select"
                      )}
                    </span>
                    <span className="text-[11px] font-mono opacity-50">#{index + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Notice */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/20 p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <span>
                Need help deciding? You can review all domain requirements and portfolios before proceeding.
              </span>
            </div>
            <Button
              size="default"
              onClick={goToApplication}
              disabled={isContinueDisabled}
              className="rounded-full px-6 shrink-0 font-medium shadow-sm disabled:opacity-50"
            >
              <span>Continue to Application</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default function DepartmentsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <NavBar />
          <main className="flex-1 py-10 sm:py-16">
            <DepartmentGridSkeleton count={6} showHeader={true} />
          </main>
          <Footer />
        </div>
      }
    >
      <DepartmentsContent />
    </Suspense>
  );
}
