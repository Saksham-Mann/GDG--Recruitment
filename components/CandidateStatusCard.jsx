"use client";

import React from "react";
import { CheckCircle2, Clock, Sparkles, HeartHandshake, ArrowRight, Layers, Mail, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/**
 * CandidateStatusCard
 * Displays the real-time application review status of a candidate.
 * Supports 3 statuses: "waitlisted" (in review), "shortlisted", and "rejected".
 *
 * @param {Object} props
 * @param {string} [props.status="waitlisted"] - "waitlisted" | "shortlisted" | "rejected"
 * @param {Array} [props.applications=[]] - List of application objects { department, status, createdAt }
 * @param {boolean} [props.isPostSubmission=false] - True if displayed immediately after submission
 * @param {string} [props.candidateName=""]
 */
export default function CandidateStatusCard({
  status = "waitlisted",
  applications = [],
  isPostSubmission = false,
  candidateName = "",
}) {
  const normalizedStatus = status?.toLowerCase() || "waitlisted";

  // Configuration for each review state
  const config = {
    shortlisted: {
      badgeText: "Shortlisted for Next Round",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      cardBorder: "border-emerald-500/40 dark:border-emerald-500/30",
      glowBg: "bg-emerald-500/10",
      icon: Sparkles,
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      title: "Congratulations! You have been shortlisted!",
      primaryMessage:
        "Congratulations! You have been shortlisted for the next round. Check your email for further instructions!",
      subMessage:
        "Our team was impressed by your submission. Please monitor your student inbox for interview scheduling and round-two details.",
      headerStyle: "from-emerald-500/10 to-teal-500/5",
    },
    rejected: {
      badgeText: "Decision Announced",
      badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      cardBorder: "border-rose-500/30 dark:border-rose-500/20",
      glowBg: "bg-rose-500/5",
      icon: HeartHandshake,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      title: "Recruitment Update",
      primaryMessage:
        "Thank you for applying to GDG. Unfortunately, we will not be moving forward with your application for this round. We wish you the best in your upcoming journey!",
      subMessage:
        "The selection process was exceptionally competitive. We deeply appreciate the time and creativity you put into your responses, and we welcome you to participate in all open GDG workshops and hackathons.",
      headerStyle: "from-rose-500/5 to-amber-500/5",
    },
    waitlisted: {
      badgeText: "Application Under Review",
      badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      cardBorder: "border-blue-500/30 dark:border-blue-500/20",
      glowBg: "bg-blue-500/5",
      icon: Clock,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      title: isPostSubmission
        ? "Application Submitted Successfully"
        : "Application Under Review",
      primaryMessage: isPostSubmission
        ? "Application Submitted Successfully. Please wait for the recruitment results to be declared."
        : "Your application is currently under review. Please wait for the results.",
      subMessage:
        "Our domain leads are reviewing submissions. Shortlists and next-round invitations will be notified via email and updated on this dashboard.",
      headerStyle: "from-blue-500/5 to-indigo-500/5",
    },
  };

  const currentConfig = config[normalizedStatus] || config.waitlisted;
  const IconComponent = currentConfig.icon;

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border ${currentConfig.cardBorder} bg-card/80 backdrop-blur-md shadow-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none`}
    >
      {/* Subtle Background Glow */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full ${currentConfig.glowBg} blur-3xl`}
      />

      <CardHeader className={`space-y-3 pb-4 bg-gradient-to-b ${currentConfig.headerStyle}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${currentConfig.badgeClass}`}
          >
            {currentConfig.badgeText}
          </Badge>
          {applications.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>
                {applications.length} Department{applications.length > 1 ? "s" : ""} Applied
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 pt-1">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentConfig.iconBg} shadow-sm`}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className={`text-xl sm:text-2xl font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
              {currentConfig.title}
            </CardTitle>
            {candidateName && (
              <p className="text-xs text-muted-foreground font-medium">
                Applicant: <span className="text-foreground">{candidateName}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Main Status Message Banner */}
        <div
          role="status"
          className={`rounded-xl border p-4 sm:p-5 text-sm sm:text-base font-medium leading-relaxed ${
            normalizedStatus === "shortlisted"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
              : normalizedStatus === "rejected"
              ? "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100"
              : "border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-100"
          }`}
        >
          <p className="font-semibold">{currentConfig.primaryMessage}</p>
          <p className="mt-2 text-xs sm:text-sm opacity-90 leading-normal">{currentConfig.subMessage}</p>
        </div>

        {/* Per-Department Submission Breakdown */}
        {applications.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted Domains
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {applications.map((app, idx) => {
                const appStatus = (app.status || "waitlisted").toLowerCase();
                const isShort = appStatus === "shortlisted";
                const isRej = appStatus === "rejected";

                return (
                  <div
                    key={app.id || idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground font-semibold text-[11px]">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{app.department}</p>
                        {app.createdAt && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 ${
                        isShort
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : isRej
                          ? "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {isShort ? "Shortlisted" : isRej ? "Not Selected" : "In Review"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-6 border-t border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-primary" />
          <span>Official announcements are mirrored to your registered student email.</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/explore-departments">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-medium">
              View All Domains
            </Button>
          </Link>
          <Link href="/">
            <Button size="sm" className="rounded-full text-xs font-semibold shadow-xs">
              <span>Back to Home</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
