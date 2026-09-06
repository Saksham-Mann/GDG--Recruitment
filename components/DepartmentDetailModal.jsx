"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Layers,
  Sparkles,
  Rocket,
  Users,
  Code2,
  X,
  Target,
} from "lucide-react";
import { getDepartmentDetails } from "@/constants/departmentDetails";

/**
 * DepartmentDetailModal
 * Accessible, zero-CLS modal displaying complete informational details about a department.
 * Features banner photography, active projects, team culture, tech stack chips,
 * and informational CTAs.
 */
export default function DepartmentDetailModal({
  department,
  isOpen,
  onClose,
}) {
  if (!department) return null;

  const details = getDepartmentDetails(department.name);
  const IconComponent = department.icon || Layers;
  const toneColor = department.tone || "#3b82f6";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[55vw] xl:max-w-[48vw] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border border-border/70 shadow-2xl">
        {/* Banner Image Container */}
        <div className="relative w-full h-48 sm:h-60 overflow-hidden bg-muted">
          <Image
            src={details.image}
            alt={`${department.name} department showcase banner`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Department Icon Pill */}
          <div className="absolute bottom-4 left-6 sm:left-8 flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg backdrop-blur-md border border-white/20"
              style={{
                backgroundColor: toneColor ? `${toneColor}30` : "rgba(59, 130, 246, 0.2)",
                color: toneColor || "#3b82f6",
              }}
            >
              <IconComponent className="h-7 w-7" />
            </div>
            <div>
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm border-border/60 text-xs font-semibold px-3 py-1"
              >
                GDG Domain Showcase
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 drop-shadow-xs">
                {department.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Tagline / Charter */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm font-medium text-primary flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>{details.tagline}</span>
          </div>

          {/* In-Depth Department Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span>Team Mission & Scope</span>
            </h3>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              {details.longDescription}
            </p>
          </div>

          <Separator className="opacity-50" />

          {/* Active Projects & Culture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Active Projects */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                <span>Flagship Projects</span>
              </h4>
              <ul className="space-y-2">
                {details.activeProjects.map((project, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{project}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Team Culture */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Team Culture & Dynamics</span>
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {details.culture}
              </p>
              <div className="pt-2 border-t border-border/30">
                <span className="text-[11px] font-semibold text-foreground block mb-1">
                  Ideal Candidate Profile:
                </span>
                <p className="text-xs text-muted-foreground leading-normal">
                  {details.idealCandidate}
                </p>
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Tech Stack & Preferred Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <span>Tech Stacks, Frameworks & Preferred Skills</span>
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {details.techStack.map((tool, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-xl border border-border/70 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 shadow-xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 p-6 sm:p-8 pt-0 border-t border-border/30 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full px-5 text-xs font-medium w-full sm:w-auto"
          >
            Close Overview
          </Button>

          <Link href="/departments" className="w-full sm:w-auto">
            <Button
              type="button"
              className="rounded-full px-6 text-xs font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 w-full sm:w-auto"
            >
              <span>Apply to this Domain</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
