"use client";

import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  FileCheck,
  ArrowLeft,
  Mail,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main id="main-content" className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="flex flex-col items-start gap-4 border-b border-border/40 pb-8">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>GDG Recruitment Data Protection</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground ${spaceGrotesk.className}`}>
              Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Last updated: September 2026. This Privacy Policy details how the Google Developer Groups (GDG) student chapter collects, handles, stores, and protects candidate information submitted through our official recruitment portal.
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <FileCheck className="h-4 w-4" />
                <span>Purpose-Driven Collection</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your submitted responses, registration details, and contact information are used exclusively for internal recruitment evaluation. We never sell, monetize, or disclose candidate data to external commercial entities.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Server className="h-4 w-4" />
                <span>Secure Cloud Infrastructure</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All records are securely encrypted in transit and stored in Firebase Firestore with strict role-based authorization rules safeguarding applicant records from unauthorized access.
              </p>
            </div>
          </div>

          {/* Full Policy Content */}
          <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">01.</span>
                <span>Candidate Information We Collect</span>
              </h2>
              <p>
                To conduct a fair, holistic evaluation of candidates applying to join Google Developer Groups, the recruitment portal collects the following categories of personal and academic information:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li><strong>Identity & Academic Credentials:</strong> Full legal name, official student registration number, year of study, and gender.</li>
                <li><strong>Contact Information:</strong> Student email address and active mobile/WhatsApp contact number for interview scheduling and recruitment updates.</li>
                <li><strong>Department Selections:</strong> Up to two chosen technical, creative, or operational domains (e.g., Development, Design, AI/Data Science, Outreach).</li>
                <li><strong>Application Responses & Portfolios:</strong> General organizational motivation responses, track-specific questionnaires, GitHub repositories, Figma portfolios, live project URLs, and written answers.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">02.</span>
                <span>Purpose and Scope of Collection</span>
              </h2>
              <p>
                The information collected through this portal is processed strictly on the basis of candidate consent and is utilized exclusively for:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li>Evaluating candidate suitability and technical/creative aptitude for the chosen GDG departments.</li>
                <li>Facilitating task reviews, coding assessments, design appraisals, and domain-specific interviews.</li>
                <li>Communicating interview invitations, shortlist announcements, and final recruitment decisions directly to candidates via email or WhatsApp.</li>
                <li>Preventing duplicate submissions, spamming, and maintaining organizational transparency.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">03.</span>
                <span>Data Retention and Security Safeguards</span>
              </h2>
              <p>
                We implement robust administrative, technical, and operational safeguards to protect candidate information against loss, unauthorized access, alteration, or disclosure:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li><strong>Encrypted Transport:</strong> All data transmissions between the client application and server infrastructure occur over TLS 1.3/HTTPS encrypted protocols.</li>
                <li><strong>Access Control:</strong> Access to the candidate review dashboard is restricted strictly to verified GDG chapter leads and authenticated domain coordinators with signed credentials.</li>
                <li><strong>Data Retention Period:</strong> Applicant records are preserved only for the duration of the current academic recruitment cycle (typically 30–60 days). Once interview rounds conclude and new member onboarding completes, sensitive candidate questionnaire responses are safely purged or anonymized.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">04.</span>
                <span>Third-Party Providers and Infrastructure</span>
              </h2>
              <p>
                The recruitment portal integrates selected enterprise-grade service providers to guarantee performance, uptime, and identity security:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-foreground/90">
                <li><strong>Google Identity & OAuth:</strong> Facilitates student authentication and secure sign-in via Google accounts.</li>
                <li><strong>Firebase & Google Cloud Platform:</strong> Provides managed database hosting (Cloud Firestore) and authentication state management in compliant data centers.</li>
                <li><strong>Transactional Email Services:</strong> Utilized strictly for automated confirmation receipts, interview scheduling invitations, and status notifications.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-sm">05.</span>
                <span>Candidate Rights & Inquiries</span>
              </h2>
              <p>
                Candidates retain the right to review their application status, correct typographical errors prior to final evaluation, or request the early withdrawal and deletion of their submitted application.
              </p>
              <p>
                If you have questions regarding this Privacy Policy, your submitted candidate data, or wish to exercise data rights, please contact the Google Developer Groups lead team at our registered chapter email or through official club communication channels.
              </p>
            </section>
          </div>

          {/* Bottom Navigation CTA */}
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/terms" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5">
              <span>Read the User Agreement & Terms of Service</span>
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
