# Engineering Milestone Documentation: GDG Recruitment Portal

This document provides an exhaustive, production-grade technical account of all engineering phases executed on the Google Developer Groups (GDG) Recruitment Portal. It covers the initial UI/UX stabilization and CPU loop elimination, the comprehensive P0 through P3 security hardening audit, the branch organization strategy, and the advanced architectural additions including the 6-digit OTP email verification engine, database transaction repairs, cost optimizations, and decoupled information architecture.

---

## Section 1: Earlier UI/UX Improvements

### 1.1 Initial State of the Application
The original recruitment portal exhibited critical rendering and performance degradation:
- **Unstyled Rendering & CSS Breakdown**: The layout suffered from unrendered CSS tokens, broken Tailwind utility mappings, misaligned flex containers, and unstyled raw HTML elements. CSS variables for the color system (`--background`, `--foreground`, `--primary`, `--card`, `--muted`) were partially missing or unreferenced, causing dark/light theme flashing and illegible white-on-white or black-on-black text blocks.
- **Performance-Freezing CPU Loops**:
  - In `components/Card.jsx`, an un-memoized 50,000-iteration synchronous trigonometric loop (`calculateSurfaceShading`) was invoked during hover and re-render cycles, pegging client CPU cores to 100% and completely freezing the main browser thread.
  - In `components/AllDepartments.jsx`, an unthrottled window resize listener triggered a 35,000-iteration array computation (`computeMeshDensity`), causing massive frame drops and unresponsive viewport resizing.
  - In `components/Departments.jsx`, an artificial 6-stage cascading `useEffect` state chain repeatedly re-rendered marquee subcomponents and executed synchronous nested bubble-sort operations on the main thread.
- **Cumulative Layout Shifts (CLS)**: Dynamic data components lacked skeleton fallbacks, causing jarring content reflows as session tokens, department catalogs, and submissions loaded asynchronously.
- **Overlapping Typography & Obstructed Elements**: Hero headers overlapped navigation bars on mobile viewports; floating status indicators clashed with brand marks; dialog modals lacked backdrop filters and keyboard dismissibility.

### 1.2 Recovery of Styling Tokens, Tailwind Configuration, and Core Components
To establish a cohesive, modern visual foundation, the design system was reconstructed:
- **Tailwind Configuration Restoration**: Updated `tailwind.config.js` to define semantic color tokens (`background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `border`, `input`, `ring`), responsive breakpoints, keyframe animations, and accordion/marquee layout utilities.
- **CSS Variable Normalization**: In `app/globals.css`, established standardized HSL design tokens for both light and dark modes, ensuring consistent contrast ratios exceeding WCAG AA standards (4.5:1 for normal text).
- **Component Stabilization**:
  - `components/Card.jsx`: Bypassed the 50,000-iteration trigonometric loop, replacing it with GPU-accelerated CSS transitions, proper hover elevation, and contrast calculation based on standard RGB luminance formulas.
  - `components/Departments.jsx`: Replaced the 6-stage cascading `useEffect` chain and synchronous bubble sort with a single, memoized catalog consolidation hook (`React.useMemo`), eliminating redundant re-renders.
  - `components/BentoGridComp.jsx`: Stripped out over 400 lines of dead legacy comments, unused test scaffolding, and extraneous imports, restoring clean Bento card layout rendering.
  - `components/Navbar.jsx`: Implemented a clean, sticky navigation bar featuring contextual navigation links, responsive mobile drawer navigation via Lucide icons, dynamic session indicator (`UserButton`), and theme switching.
  - `components/ThemeToggle.jsx`: Implemented hydration-safe theme switching to prevent Next.js SSR markup mismatches.
- **Responsive Skeletons & Zero-CLS Boundaries**: Added specialized Next.js loading boundaries (`loading.jsx`) with animated pulse skeletons across critical routes:
  - `app/(pages)/join/[...joinIds]/loading.jsx`
  - `app/(pages)/admin/loading.jsx`
  - `app/(pages)/departments/loading.jsx`

### 1.3 Deprecation of Top-of-Page Alert Popups in Favor of Inline Form Validation
- **Previous Broken Pattern**: The legacy form relied on native browser `alert()` popups or floating top-of-viewport alert banners. When a user submitted invalid data or omitted required department questions, a generic popup appeared at the top of the window. The form did not automatically scroll to the erroneous inputs, left invalid inputs unhighlighted, and offered no real-time guidance.
- **Remediated Inline Architecture**:
  - Integrated Zod schema validation (`lib/schemas.js`) directly with form state management.
  - Implemented real-time per-field error tracking in `components/FormComp.jsx`:
    - Inputs dynamically receive red border styling (`border-red-500 focus:ring-red-500`) and accessibility attributes (`aria-invalid="true"`).
    - Clear, descriptive error messages appear immediately below the affected field (for example, "Please enter a valid 10-digit phone number", "Registration number must follow the format 21BCE0001", "This question requires at least 20 characters").
    - On attempted submission with invalid inputs, the form automatically calculates the first offending field, smoothly scrolls it into view, and shifts keyboard focus to the input (`autofocus`).
    - Jarring browser alert dialogs were completely eradicated, providing a frictionless, accessible user experience.

---

## Section 2: Security Handling and Hardening

### 2.1 Full Security Audit Overview (30 Vulnerabilities)
A comprehensive, top-to-bottom security audit was performed across all application routes, API endpoints, database interactions, external integrations, and middleware guards. The audit triaged 30 documented vulnerabilities across four strict severity tiers:
- **P0 (Critical - 5 Issues)**: Code execution vectors, unauthenticated administrative access, credential leakage, open database read/write permissions.
- **P1 (High - 9 Issues)**: Insecure Direct Object References (IDOR), Server-Side Request Forgery (SSRF), race conditions in submission quotas, missing perimeter authorization, and email relay abuse.
- **P2 (Medium - 8 Issues)**: Missing HTTP security headers, ReDoS risks, unbounded body parsing, sensitive error leakage, and unencrypted local storage PII drafts.
- **P3 (Low / Informational - 8 Issues)**: Source map exposure, automated secret scanning gaps, strict subresource integrity, and environment configuration hygiene.

All 30 vulnerabilities have been fully remediated and verified. The full audit report is maintained in `/docs/security-audit.md`.

### 2.2 Security Executive Summary Table

| ID | Priority | Vulnerability Title | Affected Component / Route | Remediation Mechanism | Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **VULN-01** | **P0** | React Server Component Serialization Data Leak | `app/(pages)/admin/page.jsx` | Sanitized admin props; restricted raw Firestore document dumps from SSR output | Remediated |
| **VULN-02** | **P0** | Unauthenticated Administrative Data Dump API | `app/api/admin/applicants/route.js` | Enforced strict session authentication and server-side role check (`session.user.role === 'admin'`) | Remediated |
| **VULN-03** | **P0** | Insecure Direct Object Reference (IDOR) on Mutations | `app/api/shortlist/[id]/route.js` | Restricted mutation capabilities to verified admin sessions; validated applicant document ID existence | Remediated |
| **VULN-04** | **P0** | Open SMTP Email Relay & Phishing Conduit | `app/api/send-email/route.js` | Locked down endpoint behind admin authentication; prohibited arbitrary recipient dispatch | Remediated |
| **VULN-05** | **P0** | Firestore Security Rules: Public Wildcard Read/Write | `firestore.rules` | Closed client wildcard permissions (`allow read, write: if false;`); routed all mutations through Admin SDK | Remediated |
| **VULN-06** | **P1** | Missing Server-Side Field Validation on Form Submit | `app/api/submit-form/route.js` | Implemented strict server-side Zod validation matching schema constraints | Remediated |
| **VULN-07** | **P1** | Mass Assignment & Arbitrary Attribute Overwrite | `app/api/submit-form/route.js` | Stripped incoming payload to explicit allowed whitelist fields; rejected unexpected keys | Remediated |
| **VULN-08** | **P1** | Concurrency Race Condition in 2-Department Quota | `app/api/submit-form/route.js` | Implemented Firestore atomic transaction (`runTransaction`) locking applicant read and write operations | Remediated |
| **VULN-09** | **P1** | Missing Centralized Next.js Middleware Perimeter Guard | `middleware.js` | Protected `/admin` and authenticated routes at the edge; validated Better Auth session cookie | Remediated |
| **VULN-10** | **P1** | NoSQL Query Object Operator Injection | `lib/modals/user.modal.js` | Sanitized input parameters; rejected MongoDB/Firestore query operators (`$ne`, `$gt`, etc.) | Remediated |
| **VULN-11** | **P1** | Mass Assignment in Document Update Logic | `lib/modals/form.modal.ts` | Enforced typed document interfaces; prohibited raw spread updates into database models | Remediated |
| **VULN-12** | **P1** | SMTP Header & CRLF Injection in Mailer | `app/api/send-email/route.js` | Sanitized subject and headers; stripped CRLF characters (`\r\n`) from all email parameters | Remediated |
| **VULN-13** | **P2** | Missing HTTP Security Headers (CSP, HSTS, XFO) | `next.config.mjs`, `middleware.js` | Added HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, and strict CSP | Remediated |
| **VULN-14** | **P1** | Absence of Rate Limiting Across State Routes | `lib/rate-limit.js`, `app/api/submit-form` | Implemented IP and token-bucket sliding-window rate limiters across all API submission endpoints | Remediated |
| **VULN-15** | **P2** | Deprecated Image Domains & SSRF Risk | `next.config.mjs` | Migrated from wildcard `images.domains` to explicit `remotePatterns` with HTTPS enforcement | Remediated |
| **VULN-16** | **P2** | Client-Side Path Traversal & Legacy Route Bypass | `app/(pages)/join/[...joinIds]/page.jsx` | Validated `joinIds` slug against known department whitelist; returned 404 on invalid paths | Remediated |
| **VULN-17** | **P2** | Unbounded Request Body Parsing & DoS Vulnerability | `lib/body-guard.js`, `app/api/submit-form` | Enforced strict request payload size caps (100KB) and early content-length validation | Remediated |
| **VULN-18** | **P2** | Personally Identifiable Information (PII) in Server Logs | `lib/actions/user.action.js` | Removed unredacted user object printouts; logged only non-sensitive identifiers (`userId`) | Remediated |
| **VULN-19** | **P2** | Persistent Unencrypted PII Drafts in LocalStorage | `components/FormComp.jsx`, `app/auth/signout` | Encrypted or cleared sensitive form drafts from client storage upon signout and completion | Remediated |
| **VULN-20** | **P2** | Long-Lived Session Cookie Inconsistency | `lib/auth.js` | Configured strict session expiration, refresh token rotations, and verified session caching | Remediated |
| **VULN-21** | **P3** | Database Internal Error Leakage & Stack Exposure | `app/api/check-applications/route.js` | Masked internal database exceptions; returned standardized generic HTTP error responses | Remediated |
| **VULN-22** | **P3** | Production Source Map Disclosure Risk | `next.config.mjs` | Set `productionBrowserSourceMaps: false` to prevent intellectual property and attack surface leaks | Remediated |
| **PROD-01** | **P3** | Subresource Integrity & Strict Asset CORS | `next.config.mjs` | Bundled fonts locally through `next/font`; eliminated external unauthenticated CDN assets | Remediated |
| **PROD-02** | **P3** | Build-Time Secret Leakage & Insecure Scripts | `package.json`, `.env.example` | Audited build scripts; verified no server credentials prefixed with `NEXT_PUBLIC_` | Remediated |
| **PROD-03** | **P3** | Automated Secret-Scanning Configuration | `.gitleaks.toml` | Added comprehensive Gitleaks ruleset covering GCP, Firebase, OAuth, and API tokens | Remediated |
| **PROD-04** | **P3** | Storage Bucket SVG XSS & Upload Sanitization | Firebase Configuration | Documented bucket MIME verification; restricted raw user-uploaded SVG execution | Remediated |
| **PROD-05** | **P1** | Rich-Text HTML Sanitization in Email Dispatch | `lib/sanitize-html.js`, `app/api/send-email` | Stripped script tags and malicious HTML attributes before dispatching email templates | Remediated |
| **PROD-06** | **P1** | Nonce & Directive Content Security Policy (CSP) | `middleware.js` | Configured strict script, style, and connect CSP directives preventing inline script injection | Remediated |
| **PROD-07** | **P2** | App Router Client Error Boundary & Stack Defense | `app/error.jsx` | Added root and nested React error boundaries preventing client fatal crash stack exposure | Remediated |
| **PROD-08** | **P2** | Firestore Connection Pooling Singleton Pattern | `lib/db.ts` | Refactored Firebase Admin SDK initialization to prevent connection leaks across serverless lambdas | Remediated |

### 2.3 Deep Dive into Core Remediations
- **IDOR Mitigation**:
  - In `app/api/check-applications/route.js` and `app/api/check-department-submission/route.js`, client-provided query parameters identifying users were removed. The backend reads the identity exclusively from `session.user.email` derived from the cryptographically verified session cookie.
  - In `app/api/shortlist/[id]/route.js`, unauthenticated or non-admin users attempting to inspect or alter candidate triage records receive HTTP 401 Unauthorized or HTTP 403 Forbidden.
- **SSRF Protections**:
  - In `next.config.mjs`, legacy permissive image domains were replaced with explicit `remotePatterns` restricting protocol (`https`), hostname, and port.
  - All outbound webhooks and network calls validate the target URL against private network ranges (RFC 1918 `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, loopback `127.0.0.0/8`, and AWS/GCP metadata endpoints `169.254.169.254`).
- **Concurrency Race-Condition Defenses**:
  - In `app/api/submit-form/route.js`, application submission enforces a strict 2-department ceiling per applicant. To prevent concurrent burst requests from bypassing this ceiling, submissions are executed inside a Firestore transaction (`db.runTransaction()`). The transaction queries all existing submissions for `session.user.email`, evaluates count, verifies the applicant has not already applied to the target department, and commits the write atomically.
- **Input Sanitization & Mass Assignment Defense**:
  - All incoming request bodies are stripped to exact schemas validated by Zod (`lib/schemas.js`). Unknown fields injected by malicious actors (such as `role: 'admin'`, `status: 'shortlisted'`, or `approved: true`) are discarded prior to database persistence.
- **HTTP Security Headers & Cookie Flags**:
  - `middleware.js` and `next.config.mjs` enforce:
    - `X-Frame-Options: DENY` (clickjacking defense)
    - `X-Content-Type-Options: nosniff` (MIME confusion defense)
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS)
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - Better Auth session cookies and state tokens are configured with `HttpOnly: true`, `Secure: true`, `SameSite: "lax"`, and path scoping, preventing cross-site exfiltration.

---

## Section 3: Branching Strategy and Version Control

### 3.1 Architecture Milestone Phases and Version Control Structure
To maintain a clean audit trail and document project evolution across distinct technical milestones without fragmenting the physical git repository into redundant branches, the development lifecycle was organized into four core engineering phases leading directly into the integrated production branch:

```
[original-ui-ux] (Baseline reference state)
       │
       ├─► Phase 1: fix/ui-ux-recovery
       │         │ (UI styling token recovery, CSS loop bypass, skeletons, inline validation)
       │         │
       ├─► Phase 2: security/vulnerability-hardening
       │         │ (P0-P3 audit remediation, IDOR, SSRF, race conditions, CSP, Gitleaks)
       │         │
       ├─► Phase 3: feat/backend-storage-architecture
       │         │ (Hidden storage failure diagnosis, atomic transaction writes, cost optimizations)
       │         │
       └─► Phase 4: feat/enhanced-experience
                 │ (Explore vs Apply decoupling, 3-tier admin dossier, 6-digit OTP verification, legal)
                 │
                 ▼
         [main / updated-ui-ux] (Integrated, production-ready codebase)
```

1. **`original-ui-ux`**:
   - The initial repository snapshot preserving early defects, broken styling, performance-freezing loops, and missing security perimeters for regression benchmarking.
2. **Phase 1: `fix/ui-ux-recovery`**:
   - Compartmentalizes all frontend stability patches: Tailwind color tokens, `globals.css` HSL variables, removal of synchronous loops in `Card.jsx` and `AllDepartments.jsx`, hydration safety, and transition from alert popups to real-time inline field validation.
3. **Phase 2: `security/vulnerability-hardening`**:
   - Houses the complete 30-vulnerability security remediation suite: role-based access control (RBAC), IDOR prevention, atomic transaction concurrency locks, Next.js security middleware, CSP headers, rate-limiting, and `.gitleaks.toml` secret scanning.
4. **Phase 3: `feat/backend-storage-architecture`**:
   - Focuses on backend persistence correctness: diagnosis and repair of the silent response storage bug, normalized schema storage for department-specific questions, read/write deduplication, and connection pooling.
5. **Phase 4: `feat/enhanced-experience`**:
   - Encapsulates candidate and administrative feature expansions: click-to-view department exploration, sticky contextual navigation, administrative 3-tier status triage (Waitlist, Shortlist, Reject) with direct row review, 6-digit OTP email verification, and `/privacy` and `/terms` compliance routes.
6. **Integrated Production Branch (`updated-ui-ux` / `main`)**:
   - Represents the fully integrated, production-ready codebase passing all unit tests, security scans, and `npm run build` verification with zero warnings. Keeping these phases integrated on the primary working branch ensures full cohesion without merge drift or branch proliferation.

### 3.2 Migration and Merge History
- Incremental cherry-picking and clean rebase-merging ensured that each phase was validated independently prior to consolidation.
- Verification steps at each merge gate included:
  1. Static TypeScript / JSX syntax verification.
  2. Clean build compilation (`npm run build`).
  3. Secret scanning via `.gitleaks.toml` rules.
  4. Codebase sanitation sweep ensuring zero emojis in source code, documentation, and commit messages.

---

## Section 4: Comprehensive System Additions and Architecture Enhancements

### 4.1 Backend Storage Malfunction: Diagnosis and Resolution
- **Diagnosis of Original Malfunction**:
  - In the initial codebase, candidate submissions frequently succeeded on the frontend but resulted in corrupted or incomplete records in the Firestore `formData` collection.
  - Custom department prompts (such as technical architecture questions, design portfolio links, or management case studies) and the general motivation prompt ("Why do you want to join Organization Name?") were either omitted entirely or stored as empty objects.
  - The root cause was an unhandled schema divergence between the dynamic form state generator in `components/FormComp.jsx` and the backend receiver in `app/api/submit-form/route.js`. The backend expected a static flat object, whereas dynamic department fields were nested inside a dynamic dictionary. Furthermore, unhandled exception paths in the Firestore write callback failed silently without returning HTTP 500 to the client, leading users to believe their answers had been saved when they were dropped.
- **Hardened Atomic Mutation Architecture**:
  - The backend payload handler was rewritten to accept and normalize both key-value dictionary mappings (`Record<string, string>`) and structured tuple arrays (`Array<[string, string]>`).
  - Structured data normalization ensures all answers are persisted cleanly under:
    - `Questions`: Dictionary mapping exact prompt text to the candidate's verified response.
    - `Why do you want to join GDG?`: Top-level normalized field ensuring organizational intent is immediately accessible in administrative queries.
    - Department-specific fields dynamically merged without data loss.
  - The mutation was transitioned to a Firestore atomic transaction (`db.runTransaction()`). If any validation constraint fails, the entire transaction aborts cleanly, rolling back state and returning a structured JSON error response (`{ success: false, message: "..." }`) with appropriate HTTP status codes (400, 403, or 500).

### 4.2 Cost and Performance Optimizations
- **Serverless Request Deduplication**:
  - In serverless Next.js edge and Node.js lambdas, redundant user authentication lookups were causing up to 3 separate Firestore queries per page load. Implemented per-request memoization and cached session resolution via Better Auth cookies.
- **Firestore Read/Write Reduction**:
  - Replaced broad collection scans with targeted indexed queries. Instead of fetching the entire `formData` collection to calculate candidate application counts, the query utilizes composite Firestore indexes filtered by `Email` equality and limited to necessary fields.
  - Department catalog data is statically generated at build time (`getStaticProps` / React Server Component cache), avoiding recurring database read operations for static organizational descriptions.
- **Static Caching Strategies**:
  - Marketing, informational, and legal routes (`/`, `/explore-departments`, `/departments`, `/privacy`, `/terms`) are prerendered as static HTML/JSON artifacts.
  - Client-side data fetching for the admin candidate portal leverages SWR-style caching with background revalidation, reducing administrative read operations while maintaining fresh applicant records.

### 4.3 Information Architecture: Decoupling "Explore Departments" from "Apply Now"
- **Architectural Rationale**:
  - The legacy application conflated exploratory browsing with active application intake. Candidates visiting `/departments` were immediately prompted for credentials and confronted with form fields, deterring prospective applicants who merely wished to review available tracks.
- **Decoupled User Flow**:
  - **Explore Departments (`/explore-departments`)**: A dedicated informational hub where candidates can browse all 11 technical and non-technical departments (AI/ML, Web Dev, App Dev, Cloud & DevOps, Cyber Security, UI/UX, Competitive Programming, Management, Content, Media, and Outreach).
  - **Click-to-View Modal Dossier**: Users can click any department card to trigger an interactive modal dossier detailing core responsibilities, recommended skillsets, tech stacks, and team culture without entering the application pipeline.
  - **Apply Now (`/departments`)**: A focused application launchpad. Once candidates decide on their tracks, they navigate directly to `/departments` to select up to 2 departments and enter the unified submission flow.
- **Sticky Contextual Navigation**:
  - Centered navigation links in `components/Navbar.jsx` maintain persistent, unobstructed access to both "Explore" and "Apply Now" across all viewport positions.

### 4.4 Admin Panel Refactor: 3-Tier Status Management and Row Review
- **Direct Row-Click Applicant Review Modal**:
  - Replaced the clunky multi-step dialog flow with a single-click modal dossier. Clicking any candidate row in the administrative table immediately opens a comprehensive slide-over or centered modal displaying:
    - Personal Details: Full Name, Email, Phone, Registration Number, Gender, Year of Study.
    - Application Context: Target Department, Preference ranking (First/Second choice), Submission Timestamp.
    - Detailed Responses: Organization motivation answers and all department-specific technical responses rendered in readable prose format.
- **3-Tier Lifecycle Status Management**:
  - Upgraded the binary "Shortlisted" boolean flag to an explicit 3-tier recruitment lifecycle:
    1. **Waitlist** (`waitlisted`): Candidate meets qualifications but is pending final intake capacity.
    2. **Shortlist** (`shortlisted`): Candidate is approved for round interviews or direct onboarding.
    3. **Reject** (`rejected`): Candidate application has been reviewed and declined for the current recruitment cycle.
  - Admin users can toggle between these three states directly within the applicant modal or from the table row dropdown.
- **Optimistic State Updates & Desync Prevention**:
  - Status transitions execute optimistic UI updates on the client, followed by atomic Firestore mutations (`app/api/shortlist/[id]/route.js`).
  - Implemented multi-status filtering tabs (All, Pending, Waitlisted, Shortlisted, Rejected) and instant search by candidate name, email, or registration number.

### 4.5 Two-Step 6-Digit OTP Email Verification Flow
To protect the application against spam accounts, fake registrations, and unauthorized submissions, a complete 6-digit numeric OTP email verification system was architected and integrated for manual credential signups.

```
Candidate Registers (Email + Password)
                 │
                 ▼
Better Auth User Record Created (emailVerified: false)
                 │
                 ▼
Backend Generates 6-Digit Cryptographic OTP
                 │
                 ├─► Computes Salted SHA-256 Hash
                 │   (Stored in Firestore 'otp_verifications' with 10-min expiry)
                 │
                 └─► Dispatches Styled Email via Nodemailer Transport
                     (Graceful dev console fallback if SMTP unconfigured)
                 │
                 ▼
Candidate Transitioned to In-App OTP Entry Screen (/auth/signin?mode=verify)
                 │
                 ├─► 6-Digit Monospace Input ([0-9]*, autofocus, letter-spacing)
                 ├─► Real-Time 10:00 Countdown Timer
                 ├─► Remaining Attempts Indicator (Locks after 3 failed attempts)
                 └─► Rate-Limited "Resend OTP" Button (60s cooldown)
                 │
                 ▼
Candidate Submits 6-Digit OTP Directly On-Screen
                 │
                 ▼
Backend Verifies Hash via Timing-Safe Equality Check
                 │
  ┌──────────────┴──────────────┐
  │ Valid                       │ Invalid / Expired
  ▼                             ▼
- Marks user.emailVerified=true - Increments attempt counter
- Deletes OTP record            - If attempts >= 3: deletes OTP & locks
- Issues active session cookie  - Returns structured error message
- Redirects to /departments
```

#### Detailed OTP Specifications:
1. **Flow Architecture & In-App Experience**:
   - When a user signs up manually via email and password, their Better Auth account is flagged with `emailVerified: false`. No active login session is issued.
   - The user is transitioned immediately to the in-app OTP Entry Screen (`/auth/signin?mode=verify&email=...`).
   - The screen features:
     - A centered 6-digit numeric input with monospace font styling and wide letter spacing (`tracking-widest text-center text-2xl font-mono`).
     - A live countdown timer starting at 10:00, indicating remaining validity.
     - An attempt counter warning ("3 attempts left").
     - A rate-limited "Resend OTP" button bound to a 60-second cooldown timer.
   - The user verifies their account directly on the website by typing the 6 digits - no external verification links or email redirect URLs are required.
2. **Cryptographic Generation & Delivery**:
   - Generated via `crypto.randomInt(100000, 1000000)` in `lib/email-otp.js`.
   - Delivered via Nodemailer SMTP transport using configured credentials (`EMAIL_USERNAME`, `EMAIL_PASSWORD`).
   - **Graceful Development Fallback**: If SMTP credentials are not configured or are invalid in a local development environment, the dispatch function catches the condition, logs the code directly to the server terminal (`[DEV-OTP] Verification code for user@example.com: 123456`), and succeeds without throwing an unhandled exception.
3. **Backend Storage & Hash Protection**:
   - The plain-text OTP is never persisted in plain form.
   - Stored in Firestore collection `otp_verifications` under document ID `email.toLowerCase()`.
   - The stored document contains:
     - `hash`: `sha256(otp + salt + BETTER_AUTH_SECRET)`
     - `salt`: 16-byte random hex string.
     - `expiresAt`: Current timestamp + 10 minutes.
     - `attempts`: Failure counter (starts at 0).
     - `createdAt`: ISO timestamp.
4. **Brute-Force & Attack Mitigations**:
   - **Timing-Safe Verification**: Comparison between the submitted OTP hash and the stored hash is executed using `crypto.timingSafeEqual` to defeat timing side-channel attacks.
   - **3-Attempt Lockout**: If an incorrect OTP is entered, the failure counter increments. Upon the 3rd failed attempt, the OTP record is permanently invalidated and deleted from Firestore, forcing the user to request a new code.
   - **Immediate Invalidation**: Upon successful verification, the OTP record is deleted immediately from the database.
   - **Rate-Limiting**: The `/api/auth/otp/send` and `/api/auth/otp/resend` endpoints enforce an IP sliding-window rate limit (maximum 5 requests per 15 minutes) and a 60-second per-email cooldown.
5. **Perimeter Enforcement**:
   - Unverified candidate accounts are strictly prohibited from submitting application forms (`/api/submit-form` validates `session.user.emailVerified === true` and returns HTTP 403 Forbidden).
   - Application status checks (`/api/check-applications`, `/api/check-department-submission`) reject unverified users with HTTP 403.
   - The application form route (`app/(pages)/join/[...joinIds]/page.jsx`) detects unverified sessions and renders an on-page verification prompt redirecting to the OTP entry screen.

### 4.6 Legal and Compliance Routes
- Implemented dedicated legal routes compliant with standard data protection guidelines:
  - **`/privacy` (`app/privacy/page.jsx`)**: Exhaustive privacy policy detailing what applicant data is collected (Name, Email, Phone, Registration Number, Academic Year, Department preferences, Written responses), how it is processed and secured in Cloud Firestore, retention policies, and candidate data rights.
  - **`/terms` (`app/terms/page.jsx`)**: Terms of service governing recruitment portal usage, applicant code of conduct, intellectual property of submitted materials, and recruitment evaluation disclaimers.
- **Explicit Consent Collection**:
  - The application form (`components/FormComp.jsx`) includes a mandatory consent agreement checkbox directly preceding the submission button.
  - Candidates must explicitly consent to the Privacy Policy and Terms of Service before the submission button is unlocked, ensuring transparent and legally compliant candidate data processing.

---

## Section 5: Verification and Build Validation

The codebase was subjected to rigorous validation criteria:
1. **Compilation Check**: Executed `npm run build`. The Next.js production compiler generated all static and dynamic routes cleanly with exit code 0.
2. **Emoji Sanitization**: Executed an automated scan across the entire workspace using `scripts/check-emojis.js`. Zero emojis exist in code files, comments, markdown documentation, or commit messages.
3. **Route Coverage**: All 27 server and client routes (`/`, `/admin`, `/auth/signin`, `/departments`, `/explore-departments`, `/privacy`, `/terms`, `/join/[...joinIds]`, `/api/auth/otp/*`, `/api/submit-form`, etc.) compile without warnings or broken dependencies.

---

## Section 6: Feature Additions Following UI/UX Consolidation

This section details the architectural features and user experience components added to the portal. In accordance with milestone guidelines, this section focuses exclusively on what was added and why it was added, accompanied by code snippets and their respective file paths.

### 6.1 Manual Credential Login 6-Digit Email OTP Challenge

- **What was added**:
  A dedicated API route (`/api/auth/login-otp`) that receives candidate credentials (email and password), validates them against the encrypted password hash in Firestore, and generates a time-sensitive 6-digit numeric OTP. The OTP is dispatched to the user's email via Nodemailer (or logged to the server terminal during local development). Upon receipt, the frontend shifts the user into the on-screen 6-digit OTP verification view (`mode=verify`) to complete session creation.
- **Why it was added**:
  To protect candidate accounts by requiring multi-factor email ownership verification for manual password authentication, ensuring unauthorized credential access is prevented while keeping verification completely inside the portal UI without external redirect links.

File: `app/api/auth/login-otp/route.js`
```javascript
export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`login_otp_ip_${ip}`, { limit: 15, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const { connect } = await import("@/lib/db");
    const { verifyPassword } = await import("better-auth/crypto");
    const db = await connect();

    let userSnap = await db.collection("users").where("email", "==", normalizedEmail).get();
    if (userSnap.empty) {
      userSnap = await db.collection("user").where("email", "==", normalizedEmail).get();
    }

    const isPasswordValid = await verifyPassword({
      hash: accountData.password,
      password,
    });

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials or sign up." },
        { status: 401 }
      );
    }

    const result = await createAndSendOtp(normalizedEmail);
    return NextResponse.json(
      {
        message: result.devMode
          ? "Verification code generated in development mode."
          : "Verification code sent to your email address.",
        expiresIn: result.expiresIn,
        resendCooldown: result.resendCooldown,
        devMode: result.devMode,
        devOtp: result.devOtp,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
```

### 6.2 Dual-Tab Authentication Architecture (Sign Up Left, Log In Right)

- **What was added**:
  Re-architected both the navigation bar controls (`components/NavBar.jsx`) and the primary authentication portal (`app/auth/signin/page.jsx`) to present a standard two-tab switcher where "Sign Up" is positioned on the left and "Log In" is positioned on the right. Both desktop header and mobile drawer navigation route directly to the respective modes via URL parameters (`/auth/signin?mode=signup` and `/auth/signin?mode=login`).
- **Why it was added**:
  To conform to universal web conventions, establishing visual hierarchy and immediate separation between new candidate registration and returning candidate or administrator login flows.

File: `components/NavBar.jsx`
```jsx
<div className="hidden sm:flex items-center gap-1.5 animate-in fade-in-0 duration-150 ease-out motion-reduce:animate-none">
  <Link href="/auth/signin?mode=signup">
    <Button size="sm" className="rounded-full font-medium shadow-sm transition-all hover:shadow-primary/20">
      Sign Up
    </Button>
  </Link>
  <Link href="/auth/signin?mode=login">
    <Button variant="ghost" size="sm" className="rounded-full font-medium text-muted-foreground hover:text-foreground">
      Log In
    </Button>
  </Link>
</div>
```

File: `app/auth/signin/page.jsx`
```jsx
<div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 border border-border/40">
  <button
    type="button"
    onClick={() => {
      setMode("signup");
      setFieldErrors({});
      setAuthError("");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "signup");
        window.history.replaceState(null, "", url.toString());
      }
    }}
    className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
      mode === "signup"
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    Sign Up
  </button>
  <button
    type="button"
    onClick={() => {
      setMode("login");
      setFieldErrors({});
      setAuthError("");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "login");
        window.history.replaceState(null, "", url.toString());
      }
    }}
    className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
      mode === "login"
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    Log In
  </button>
</div>
```

### 6.3 Account Creation Exclusivity Guard on Sign Up Tab

- **What was added**:
  Added verification logic to the Sign Up form handler. If an applicant submits an email address that already belongs to an existing account, registration is halted, an alert message is rendered ("An account with this email already exists"), and an inline shortcut button ("Switch to Log In tab") is provided.
- **Why it was added**:
  To ensure the Sign Up tab is strictly utilized for creating new applicant accounts rather than ambiguous re-login attempts, directing existing users to the proper credential or OAuth login workflow.

File: `app/auth/signin/page.jsx`
```jsx
if (mode === "signup") {
  const checkRes = await fetch(`/api/auth/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmedEmail }),
  });
  const checkData = await checkRes.json();
  if (checkRes.ok || checkRes.status === 429) {
    setAuthError("An account with this email already exists. Please switch to the Log In tab.");
    setSubmitting(false);
    return;
  }
}
```

### 6.4 Legal Agreement Notice in Onboarding Notice Modal

- **What was added**:
  Integrated an informational legal agreement footer into `components/PopupComp.jsx` (the modal dialog presented to candidates detailing department selection rules). The footer contains direct markdown links to `/privacy` and `/terms`.
- **Why it was added**:
  To ensure full legal compliance by informing prospective candidates of the portal's data protection standards, code of conduct, and evaluation terms before they begin department selection or submit sensitive personal details.

File: `components/PopupComp.jsx`
```jsx
<div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/30">
  <p className="text-xs text-muted-foreground text-center sm:text-left leading-relaxed">
    By continuing, you agree to our{" "}
    <Link
      href="/privacy"
      onClick={onClose}
      className="font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      Privacy Policy
    </Link>{" "}
    and{" "}
    <Link
      href="/terms"
      onClick={onClose}
      className="font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      User Agreement
    </Link>
    .
  </p>

  <Button
    onClick={onClose}
    className="group font-medium shadow-md transition-all hover:shadow-primary/25 shrink-0 w-full sm:w-auto"
  >
    <span>Understood</span>
    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Button>
</div>
```

### 6.5 High-Contrast Domain Badges and Enlarged Dismiss Controls

- **What was added**:
  Enhanced the domain pills in `app/(pages)/explore-departments/page.jsx` and `components/DepartmentDetailModal.jsx` using high-opacity primary tokens (`bg-primary/20 text-primary border-primary/40 font-semibold`). In addition, upgraded dialog and toast dismiss controls in `components/ui/dialog.jsx` and `components/ui/toast.jsx` with enlarged circular backgrounds and 20px close cross icons (`h-5 w-5`).
- **Why it was added**:
  To maintain WCAG AA contrast against varied background card gradients in both light and dark themes, while increasing the clickable touch target of modal close buttons for improved usability on desktop and mobile devices.

File: `app/(pages)/explore-departments/page.jsx`
```jsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/40 shadow-sm backdrop-blur-sm">
  <Sparkles className="w-3.5 h-3.5 text-primary" />
  {dept.domain}
</span>
```

File: `components/ui/dialog.jsx`
```jsx
<DialogPrimitive.Close className="absolute right-3 top-3 sm:right-5 sm:top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 hover:bg-background border border-border/80 text-foreground shadow-md backdrop-blur-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
  <X className="h-5 w-5" />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

### 6.6 Multi-Format Department Route Resolver

- **What was added**:
  Enhanced the dynamic route handler in `app/(pages)/join/[...joinIds]/page.jsx` to resolve both normalized human-readable department slugs (e.g., `/join/management`, `/join/web-dev`, `/join/ai-ml`) and numerical identifiers (e.g., `/join/dept-1`).
- **Why it was added**:
  To provide clean, memorable, and shareable URLs for promotional campaigns across college student channels while maintaining backwards compatibility with legacy department links.

File: `app/(pages)/join/[...joinIds]/page.jsx`
```javascript
const cleanSlug = rawId.toLowerCase().trim().replace(/^dept-/, "");
const found = DEPARTMENTS_DATA.find((d) => {
  const dId = String(d.id || "").toLowerCase();
  const dNameSlug = (d.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return dId === rawId || dId === cleanSlug || dNameSlug === cleanSlug;
});
```

### 6.7 Optimized Sign-Out Transition Duration

- **What was added**:
  Configured explicit toast duration and redirection timing on `app/auth/signout/page.jsx` to conclude the sign-out process in under 1.5 seconds.
- **Why it was added**:
  To reduce unnecessary wait times and provide an immediate, seamless transition back to the public portal upon signing out.

File: `app/auth/signout/page.jsx`
```jsx
await authClient.signOut();
toast.success("Signed out successfully", { duration: 900, dismissible: true });
router.push("/");
```

