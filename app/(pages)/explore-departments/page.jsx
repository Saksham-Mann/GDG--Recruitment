"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { reviews } from "@/constants";
import { departmentDetailsMap } from "@/constants/departmentDetails";
import DepartmentDetailModal from "@/components/DepartmentDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  Compass,
  Code2,
  Maximize2,
  ExternalLink,
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ExploreDepartmentsPage() {
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [activeModalDepartment, setActiveModalDepartment] = useState(null);

  const toggleDepartmentSelect = (deptName) => {
    setSelectedDepartments((current) => {
      if (current.includes(deptName)) {
        toast.info(`Deselected ${deptName}`);
        return current.filter((name) => name !== deptName);
      }
      if (current.length >= 2) {
        toast.warning(
          "Selection Limit: You can select at most 2 domains for your recruitment application.",
          {
            description: "Deselect an existing domain to add another.",
          }
        );
        return current;
      }
      toast.success(`Selected ${deptName} for application!`, {
        description: "You can proceed to apply or continue exploring other teams.",
      });
      return [...current, deptName];
    });
  };

  const handleApplyDirect = (deptName) => {
    const list = selectedDepartments.includes(deptName)
      ? selectedDepartments
      : [...selectedDepartments.slice(0, 1), deptName];

    setActiveModalDepartment(null);
    router.push(`/departments?selected=${encodeURIComponent(list.join(","))}`);
  };

  const handleProceedToApply = () => {
    if (selectedDepartments.length > 0) {
      router.push(
        `/departments?selected=${encodeURIComponent(selectedDepartments.join(","))}`
      );
    } else {
      router.push("/departments");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <NavBar />

      <main id="main-content" className="flex-1 pb-32 pt-8 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Return Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border/40">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary mb-3">
                <Compass className="h-3.5 w-3.5" />
                <span>Informational Discovery Hub · GDG Chapters</span>
              </div>
              <h1
                className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground ${spaceGrotesk.className}`}
              >
                Explore Our Departments
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Take your time to browse all 12 specialized domains. Click or tap any card to view projects, tech stacks, and team culture without any premature commitment.
              </p>
            </div>

            {/* Quick Action to Proceed */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                size="lg"
                onClick={handleProceedToApply}
                className="rounded-full px-6 font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30"
              >
                <span>
                  {selectedDepartments.length > 0
                    ? `Proceed with (${selectedDepartments.length})`
                    : "Proceed to Apply"}
                </span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Department Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none">
            {reviews.map((department, index) => {
              const details = departmentDetailsMap[department.name] || {};
              const isSelected = selectedDepartments.includes(department.name);
              const IconComponent = department.icon || Layers;
              const toneColor = department.tone || "#3b82f6";

              return (
                <div
                  key={department.id || index}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`View full details for ${department.name} department`}
                  onClick={() => setActiveModalDepartment(department)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveModalDepartment(department);
                    }
                  }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary/70 bg-primary/[0.03] ring-1 ring-primary/40"
                      : "border-border/60"
                  }`}
                >
                  {/* Department Banner Image Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    {details.image ? (
                      <Image
                        src={details.image}
                        alt={`${department.name} team showcase`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md backdrop-blur-md border border-white/20"
                        style={{
                          backgroundColor: toneColor ? `${toneColor}30` : "rgba(59, 130, 246, 0.2)",
                          color: toneColor || "#3b82f6",
                        }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {isSelected && (
                        <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded-full text-[11px] shadow-sm flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Pre-Selected</span>
                        </Badge>
                      )}
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-bold tracking-tight text-foreground drop-shadow-xs group-hover:text-primary transition-colors">
                        {department.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {details.tagline || department.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {department.description || details.longDescription}
                    </p>

                    {/* Tech Stack Chips Preview */}
                    {details.techStack && details.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {details.techStack.slice(0, 4).map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                          >
                            {tech}
                          </span>
                        ))}
                        {details.techStack.length > 4 && (
                          <span className="rounded-lg border border-border/40 bg-muted/20 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            +{details.techStack.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Interactive Tap Prompt Footer */}
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Tap to view details</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDepartmentSelect(department.name);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {isSelected ? "Selected" : "+ Select"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Persistent Glassmorphic Floating Bottom Bar */}
      <div className="fixed bottom-5 inset-x-0 z-40 px-4 pointer-events-none">
        <div className="mx-auto max-w-2xl rounded-full border border-border/80 bg-background/90 backdrop-blur-xl shadow-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 pointer-events-auto transition-all">
          {/* Left Anchor: Back to Home */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 pl-3 pr-4 h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Home</span>
            </Button>
          </Link>

          {/* Center: Selection Counter */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Pre-Selected:</span>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {selectedDepartments.length} / 2 Domains
            </span>
          </div>

          {/* Right Anchor: Proceed to Apply */}
          <Button
            size="sm"
            onClick={handleProceedToApply}
            className="rounded-full px-5 sm:px-6 text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 h-10"
          >
            <span>Proceed to Apply</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Department Detail Modal (Radix Dialog in Portal - Zero CLS) */}
      <DepartmentDetailModal
        department={activeModalDepartment}
        isOpen={!!activeModalDepartment}
        onClose={() => setActiveModalDepartment(null)}
        isSelected={
          activeModalDepartment
            ? selectedDepartments.includes(activeModalDepartment.name)
            : false
        }
        onToggleSelect={toggleDepartmentSelect}
        onApplyDirect={handleApplyDirect}
      />

      <Footer />
    </div>
  );
}
