"use client";

import React from "react";
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
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
} from "lucide-react";

/**
 * ApplicantDetailsModal
 * Responsive modal displaying an applicant's complete profile, personal details,
 * questionnaire responses, and 3-tier status management controls.
 */
export default function ApplicantDetailsModal({
  applicant,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating = false,
}) {
  if (!applicant) return null;

  const currentStatus = applicant.status || (applicant.shortlisted ? "shortlisted" : "waitlisted");

  // Format questions and answers into an array
  const getQuestions = () => {
    if (!applicant?.Questions) return [];
    if (Array.isArray(applicant.Questions)) {
      return applicant.Questions.map((q, idx) => {
        if (typeof q === "string") return { question: `Question ${idx + 1}`, answer: q };
        if (Array.isArray(q)) return { question: q[0], answer: q[1] };
        if (q && typeof q === "object") {
          const entries = Object.entries(q);
          if (entries.length > 0) return { question: entries[0][0], answer: entries[0][1] };
        }
        return { question: `Question ${idx + 1}`, answer: String(q ?? "") };
      });
    }

    if (typeof applicant.Questions === "object") {
      return Object.entries(applicant.Questions).map(([question, answer]) => ({
        question,
        answer: answer !== undefined && answer !== null && answer !== "" ? String(answer) : "No answer provided",
      }));
    }

    return [{ question: "Responses", answer: String(applicant.Questions) }];
  };

  const questionsList = getQuestions();
  const whyJoin =
    applicant["Why do you want to join Organization Name?"] ||
    applicant["Why do you want to join DWASFW?"] ||
    applicant["Why do you want to join GDG?"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8">
        <DialogHeader className="space-y-3 pb-4 border-b border-border/40 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 font-semibold text-xs border-primary/30 bg-primary/10 text-primary"
              >
                {applicant.Department || "General Track"}
              </Badge>
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 font-semibold text-xs ${
                  currentStatus === "shortlisted"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : currentStatus === "rejected"
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                }`}
              >
                {currentStatus === "shortlisted"
                  ? "Shortlisted"
                  : currentStatus === "rejected"
                  ? "Rejected"
                  : "Waitlisted / Under Review"}
              </Badge>
            </div>
            {applicant.createdAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" />
                {new Date(applicant.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              {applicant.Name || "Unnamed Applicant"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Applicant Review Dossier · Application ID: <span className="font-mono text-foreground">{applicant._id || applicant.id}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Candidate Metadata Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 bg-muted/20 p-4 rounded-xl border border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
              Registration
            </span>
            <span className="font-mono font-semibold text-foreground text-sm">
              {applicant.RegistrationNumber || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
              Year of Study
            </span>
            <span className="font-medium text-foreground text-sm">
              {applicant["Year of Study"] || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
              Phone
            </span>
            <span className="font-mono text-foreground text-sm">
              {applicant.Phone || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
              Gender
            </span>
            <span className="font-medium text-foreground text-sm capitalize">
              {applicant.Gender || "N/A"}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-4 pt-1 border-t border-border/30">
            <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
              Email
            </span>
            <span className="font-mono text-foreground text-xs select-all">
              {applicant.Email || "N/A"}
            </span>
          </div>
        </div>

        {/* Questionnaire Answers Body */}
        <div className="space-y-6 pt-2">
          {/* Motivation Question */}
          {whyJoin && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2 shadow-xs">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>Why do you want to join Google Developer Groups?</span>
              </h4>
              <Separator />
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pt-1">
                {whyJoin}
              </p>
            </div>
          )}

          {/* Department Questions */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{applicant.Department} Questionnaire Answers ({questionsList.length})</span>
            </h4>

            {questionsList.length > 0 ? (
              <div className="space-y-3">
                {questionsList.map(({ question, answer }, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2 transition-all hover:bg-card/70"
                  >
                    <h5 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      <span className="text-primary mr-1.5 font-bold">Q{idx + 1}.</span>
                      {question}
                    </h5>
                    <Separator className="opacity-60" />
                    <p className="text-xs sm:text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed pt-1">
                      {answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/40 p-6 text-center text-xs text-muted-foreground">
                No track questions answered for this submission.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with 3-Tier Status Controls */}
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-border/40">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Change Status:
            </span>
            <Button
              type="button"
              size="sm"
              variant={currentStatus === "waitlisted" ? "default" : "outline"}
              disabled={isUpdating}
              onClick={() => onStatusChange(applicant._id || applicant.id, "waitlisted")}
              className={`rounded-full text-xs font-medium ${
                currentStatus === "waitlisted"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "hover:border-blue-500/50 hover:text-blue-600"
              }`}
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              <span>Waitlist</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentStatus === "shortlisted" ? "default" : "outline"}
              disabled={isUpdating}
              onClick={() => onStatusChange(applicant._id || applicant.id, "shortlisted")}
              className={`rounded-full text-xs font-medium ${
                currentStatus === "shortlisted"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : "hover:border-emerald-500/50 hover:text-emerald-600"
              }`}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              <span>Shortlist</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentStatus === "rejected" ? "default" : "outline"}
              disabled={isUpdating}
              onClick={() => onStatusChange(applicant._id || applicant.id, "rejected")}
              className={`rounded-full text-xs font-medium ${
                currentStatus === "rejected"
                  ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                  : "hover:border-rose-500/50 hover:text-rose-600"
              }`}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              <span>Reject</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full px-5 text-xs font-medium ml-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
