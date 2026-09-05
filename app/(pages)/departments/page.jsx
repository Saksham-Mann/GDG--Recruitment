"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { reviews } from "@/constants";
import { Check, CheckCircle2, ArrowRight, Sparkles, Layers, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const departments = reviews;

const DepartmentsListPage = () => {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { submittedDepartments } = useSubmissions();

  const [selectedCount, setSelectedCount] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isContinueDisabled, setIsContinueDisabled] = useState(true);

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
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("You have already submitted the maximum allowed (2) applications.");
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);

      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }

      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }

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

      <main className="flex-1 py-10 sm:py-16">
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

          {/* Department Cards Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department, index) => {
              const isSelected = selectedDepartments.includes(department.name);
              const isSubmitted = submittedDepartments?.includes(department.name);
              const IconComponent = department.icon;

              return (
                <div
                  key={department.id || index}
                  onClick={() => !isSubmitted && toggleDepartment(department.name)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
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

export default DepartmentsListPage;
