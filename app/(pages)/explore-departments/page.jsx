"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { reviews } from "@/constants";
import { departmentDetailsMap } from "@/constants/departmentDetails";
import DepartmentDetailModal from "@/components/DepartmentDetailModal";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
  Code2,
  Maximize2,
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ExploreDepartmentsPage() {
  const [activeModalDepartment, setActiveModalDepartment] = useState(null);

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
              <Link href="/departments">
                <Button
                  size="lg"
                  className="rounded-full px-6 font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Department Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none">
            {reviews.map((department, index) => {
              const details = departmentDetailsMap[department.name] || {};
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
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

                    {/* Top Floating Badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg backdrop-blur-xl border border-white/30 bg-neutral-950/80 dark:bg-neutral-900/90"
                        style={{
                          color: toneColor || "#3b82f6",
                          boxShadow: toneColor ? `0 4px 14px ${toneColor}40` : "0 4px 14px rgba(0,0,0,0.4)",
                        }}
                      >
                        <IconComponent className="h-6 w-6 stroke-[2.2] drop-shadow-md" style={{ opacity: 1 }} />
                      </div>
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
                      <span className="inline-flex items-center gap-1.5 font-medium text-primary group-hover:underline">
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>View Department Details</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
        <div className="mx-auto max-w-lg rounded-full border border-border/80 bg-background/90 backdrop-blur-xl shadow-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 pointer-events-auto transition-all">
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

          {/* Right Anchor: Apply Now */}
          <Link href="/departments">
            <Button
              size="sm"
              className="rounded-full px-5 sm:px-6 text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 h-10"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Department Detail Modal (Radix Dialog in Portal - Zero CLS) */}
      <DepartmentDetailModal
        department={activeModalDepartment}
        isOpen={!!activeModalDepartment}
        onClose={() => setActiveModalDepartment(null)}
      />

      <Footer />
    </div>
  );
}
