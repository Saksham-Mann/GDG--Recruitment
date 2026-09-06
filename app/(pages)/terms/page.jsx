"use client";

import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ArrowLeft,
  Gavel,
  Bot,
  UserCheck,
} from "lucide-react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main id="main-content" className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-border/40 pb-8">
            <Link href="/" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Scale className="h-3.5 w-3.5" />
              <span>Candidate Code of Conduct & Rules</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground ${spaceGrotesk.className}`}>
              User Agreement & Terms
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Last updated: September 2026. This User Agreement governs your access to and use of the Google Developer Groups (GDG) recruitment portal. By creating an account or submitting an application, you agree to comply with these terms.
            </p>
          </div>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <UserCheck className="h-4 w-4" />
                <span>Original Work</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All submitted responses, code repositories, and design portfolios must represent your own authentic intellectual effort.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Bot className="h-4 w-4" />
                <span>No Automation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated bot submissions, web scraping, denial-of-service attempts, or form tampering are strictly forbidden.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Gavel className="h-4 w-4" />
                <span>Final Decision</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Submission does not guarantee selection. Evaluation decisions made by the GDG panel are conclusive and final.
              </p>
            </div>
          </div>

          {/* Full Agreement Terms */}
          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">01.</span>
                <span>Eligibility and Account Responsibility</span>
              </h2>
              <p>
                By registering for and utilizing this recruitment portal, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li>You are an actively enrolled student with valid collegiate credentials.</li>
                <li>The email address, student registration number, and contact details provided belong solely to you.</li>
                <li>You are responsible for maintaining the confidentiality of your authentication credentials and for all activities conducted under your registered account.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">02.</span>
                <span>Accuracy and Authenticity of Information</span>
              </h2>
              <p>
                Applicants explicitly certify that all statements, questionnaire answers, project links, portfolios, and experience descriptions submitted through this portal are truthful, accurate, and original:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li><strong>Prohibition of Plagiarism:</strong> Copying, plagiarizing, or claiming ownership of another individual&apos;s code, design files, or written responses is strictly forbidden.</li>
                <li><strong>Misrepresentation:</strong> Any misrepresentation of technical proficiency, identity, academic standing, or prior contributions constitutes grounds for immediate, non-appealable disqualification from the recruitment process.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">03.</span>
                <span>Portal Code of Conduct & Acceptable Use</span>
              </h2>
              <p>
                To safeguard the integrity of the recruitment platform and ensure an equitable experience for all applicants, candidates must not engage in any of the following prohibited actions:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li>Submitting repetitive, automated, scripted, or spam applications using bots, spiders, or automated runners.</li>
                <li>Interfering with, disrupting, or probing portal security vulnerabilities, server endpoints, or API infrastructure.</li>
                <li>Injecting malicious scripts, XSS payloads, SQL/NoSQL injection queries, or tampering with database requests.</li>
                <li>Circumventing application limits (such as the maximum limit of two departments per recruitment cycle).</li>
              </ul>
              <p>
                Violations of this Code of Conduct will result in immediate termination of portal access and disqualification from all GDG activities.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">04.</span>
                <span>Selection Discretion and Recruitment Decisions</span>
              </h2>
              <p>
                Candidates acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li>Submission of an application does not guarantee an interview, shortlisting, or acceptance into Google Developer Groups.</li>
                <li>The recruitment evaluation is competitive, subjective, and based on domain requirements, candidate problem-solving approaches, and organizational capacity.</li>
                <li>All recruitment decisions, shortlists, interview outcomes, and final member selections determined by the GDG evaluation committee and domain leads are conclusive, non-negotiable, and final.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">05.</span>
                <span>Official Communications</span>
              </h2>
              <p>
                Candidates are responsible for regularly checking their registered email address and portal dashboard for recruitment updates, interview invitations, and status notifications. GDG is not liable for missed opportunities arising from incorrect candidate contact information.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">06.</span>
                <span>Privacy & Data Handling</span>
              </h2>
              <p>
                Your submission and account data are handled in strict adherence to our{" "}
                <Link href="/privacy" className="text-primary underline hover:text-primary/80">
                  Privacy Policy
                </Link>
                , which details data retention, storage safeguards, and candidate rights.
              </p>
            </section>
          </div>

          {/* Bottom Navigation CTA */}
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/privacy" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5">
              <span>Review the Privacy Policy</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link href="/departments">
              <Button className="rounded-full px-6 text-xs font-semibold shadow-md">
                <span>Continue to Department Selection</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
