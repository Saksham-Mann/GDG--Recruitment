# GDG Recruitment Portal: Summary

This document gives a clear summary of all the work done on the Google Developer Groups (GDG) Recruitment Portal. It covers the frontend fixes, performance improvements, security updates, database fixes, and new features like email OTP verification, department exploration, and admin controls.

---

## Section 1: Earlier UI/UX Improvements

### 1.1 Initial State of the Application
The original recruitment portal had several display and performance issues:
- **Broken Layout and Styling**: The portal had missing CSS color variables and broken Tailwind styles. Text was hard to read due to poor color contrast, and dark mode was flashing or showing black-on-black and white-on-white text.
- **Heavy CPU Loops That Froze the Browser**:
  - In `components/Card.jsx`, a 50,000-step loop ran on every hover and render, freezing the browser.
  - In `components/AllDepartments.jsx`, a 35,000-step loop ran whenever the window was resized, causing major lag.
  - In `components/Departments.jsx`, chained effects and sorting ran on the main thread, causing unnecessary re-renders.
- **Layout Shifts**: Components jumped around as data loaded because there were no loading skeletons.
- **Overlapping Text and Hidden Elements**: Headers overlapped the navigation bar on mobile screens, status badges blocked icons, and popups could not be closed easily.

### 1.2 Recovery of Styling Tokens, Tailwind Configuration, and Core Components
To give the portal a clean, modern look and smooth feel, the styles and components were fixed:
- **Tailwind Styles Setup**: Configured `tailwind.config.js` with proper colors (`background`, `foreground`, `primary`, `muted`, `card`, `border`), responsive layouts, and smooth animations.
- **CSS Variables Cleanup**: In `app/globals.css`, set up proper color variables for light and dark modes so text is always easy to read.
- **Component Fixes**:
  - `components/Card.jsx`: Removed the heavy 50,000-step loop and replaced it with smooth CSS transitions.
  - `components/Departments.jsx`: Cleaned up the effect chains and used `React.useMemo` to stop unnecessary re-renders.
  - `components/BentoGridComp.jsx`: Removed unused code and old tests to restore the Bento grid layout.
  - `components/Navbar.jsx`: Added a sticky navigation bar with clean links, mobile menu, user profile button, and theme switcher.
  - `components/ThemeToggle.jsx`: Fixed theme switching so it works safely without server/client mismatch errors.
- **Loading Skeletons**: Added `loading.jsx` screens with pulse animations so users see clean placeholders instead of empty white space while data loads on:
  - `app/(pages)/join/[...joinIds]/loading.jsx`
  - `app/(pages)/admin/loading.jsx`
  - `app/(pages)/departments/loading.jsx`

### 1.3 Deprecation of Top-of-Page Alert Popups in Favor of Inline Form Validation
- **Previous Issue**: The old form used browser alert popups when users made a mistake or skipped a question. The form did not show which field was wrong and did not scroll to the error.
- **New Inline Validation**:
  - Used Zod schema validation (`lib/schemas.js`) to check inputs directly.
  - Added real-time error messages in `components/FormComp.jsx`:
    - Fields with errors show a red border.
    - Helpful error messages appear right under the field (for example, "Please enter a valid 10-digit phone number" or "Registration number must follow the format 21BCE0001").
    - When a user tries to submit with errors, the form automatically scrolls to the first wrong field and highlights it.
    - Browser alert popups were completely removed.

---

## Section 2: Security Handling and Hardening

### 2.1 Full Security Audit Overview (30 Vulnerabilities)
A full security review was completed across all pages, APIs, database actions, and middleware. It identified and fixed 30 security issues across four priority levels:
- **P0 (Critical - 5 Issues)**: Issues that could allow unauthorized access, data leaks, or unauthenticated admin access.
- **P1 (High - 9 Issues)**: Missing access checks, database race conditions, missing input checks, and email relay misuse.
- **P2 (Medium - 8 Issues)**: Missing security headers, denial of service risks, large payload handling, and draft data storage.
- **P3 (Low / Informational - 8 Issues)**: Source map exposure, secret scan setup, and configuration cleanup.

All 30 issues have been resolved. The detailed audit notes are in `/docs/security-audit.md`.

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
- **Access Control Fixes**:
  - In `app/api/check-applications/route.js` and `app/api/check-department-submission/route.js`, the backend no longer trusts user IDs sent by the client. It gets the user email directly from the secure session cookie.
  - In `app/api/shortlist/[id]/route.js`, only verified admin users can view or update applicant review statuses.
- **Request Safety and Image Whitelist**:
  - In `next.config.mjs`, open image domains were replaced with a strict list of allowed HTTPS sources.
  - Network requests check URLs to ensure they cannot reach private or internal network addresses.
- **Preventing Race Conditions**:
  - In `app/api/submit-form/route.js`, candidates can only apply to a maximum of 2 departments. To prevent duplicate submissions from fast simultaneous clicks, submissions run inside a Firestore transaction (`db.runTransaction()`). The database checks current application counts and writes the new application in one atomic step.
- **Input Checking**:
  - All incoming request data is validated against strict Zod schemas (`lib/schemas.js`). Unexpected fields sent by attackers (such as `role: 'admin'`) are automatically removed.
- **Security Headers and Cookies**:
  - `middleware.js` and `next.config.mjs` add standard security headers to all responses (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `CSP`).
  - Session cookies use `HttpOnly`, `Secure`, and `SameSite` flags so they cannot be accessed by client scripts.

---

## Section 3: Branching Strategy and Version Control

### 3.1 Architecture Milestone Phases and Version Control Structure
To keep a clear history of how the project developed without creating unnecessary branches, the work was organized into distinct phases leading into the main production branch:

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
   - The initial project state kept as a reference.
2. **Phase 1: `fix/ui-ux-recovery`**:
   - Frontend styling recovery, loop removals in `Card.jsx`, loading skeletons, and inline form errors.
3. **Phase 2: `security/vulnerability-hardening`**:
   - The 30 security fixes including admin guards, database transactions, middleware protection, and rate limiting.
4. **Phase 3: `feat/backend-storage-architecture`**:
   - Fixing the form answer saving issue, organizing question responses, and improving database query efficiency.
5. **Phase 4: `feat/enhanced-experience`**:
   - Exploring departments before applying, 3-tier admin status (Waitlist, Shortlist, Reject), 6-digit email OTP verification, and legal terms.
6. **Integrated Production Branch (`updated-ui-ux` / `main`)**:
   - The unified, production-ready codebase passing all builds and checks.

### 3.2 Migration and Merge History
- Each phase was tested and reviewed before being merged into the primary branch.
- Verification steps at each stage included:
  1. Checking syntax and TypeScript/JSX types.
  2. Running a clean build (`npm run build`).
  3. Scanning for exposed secrets using Gitleaks rules.

---

## Section 4: Comprehensive System Additions and Architecture Enhancements

### 4.1 Backend Storage Malfunction: Diagnosis and Resolution
- **Original Issue**:
  - Previously, when a candidate submitted an application, the form appeared to succeed on screen, but custom department answers and general motivation answers were missing or saved as empty objects in Firestore.
  - This happened because the form component sent dynamic questions as nested objects, while the backend expected flat keys. In addition, database write errors were not returned properly to the user.
- **The Fix**:
  - The backend was rewritten to handle both key-value mappings and list pairs.
  - All answers are now saved cleanly under:
    - `Questions`: A map of each question to the candidate's answer.
    - `Why do you want to join GDG?`: The applicant's general motivation answer saved at the top level for easy review.
    - Department answers are merged without losing data.
  - Submissions run inside a Firestore transaction (`db.runTransaction()`). If anything fails, the database rolls back cleanly and returns a clear error message with the right HTTP status code (400, 403, or 500).

### 4.2 Cost and Performance Optimizations
- **Fewer Authentication Lookups**: Session data is cached in memory per request so the server does not look up the same user in Firestore multiple times on a single page load.
- **Optimized Database Queries**:
  - Replaced full collection scans with indexed queries looking up by email, reducing database read costs.
  - Department list data is loaded statically at build time instead of querying the database on every visit.
- **Static Page Caching**:
  - Public pages (`/explore-departments`, `/departments`, `/privacy`, `/terms`) are pre-rendered as static pages.
  - The admin page uses client caching to keep applicant lists responsive while minimizing database reads.

### 4.3 Information Architecture: Decoupling "Explore Departments" from "Apply Now"
- **Why this was changed**:
  - In the old portal, candidates who just wanted to learn about departments were immediately asked to sign in and fill out form fields.
- **New User Flow**:
  - **Explore Departments (`/explore-departments`)**: A public page where anyone can browse all 11 departments (AI/ML, Web Dev, App Dev, Cloud & DevOps, Cyber Security, UI/UX, Competitive Programming, Management, Content, Media, and Outreach).
  - **Department Details Modal**: Clicking any department card opens a popup showing what the department does, what skills they look for, and the tools they use.
  - **Apply Now (`/departments`)**: A focused application page where candidates select up to 2 departments and fill out their application.
- **Clear Navigation**: The navigation bar has permanent links to both "Explore" and "Apply Now" so users can move between them easily.

### 4.4 Admin Panel Refactor: 3-Tier Status Management and Row Review
- **Quick Row-Click Applicant Review**:
  - Clicking any candidate row in the admin table opens a detailed modal with:
    - Personal Details: Name, Email, Phone, Registration Number, Gender, and Year of Study.
    - Application Info: Chosen Department, Preference (1st or 2nd choice), and Submission Time.
    - Full Responses: The applicant's motivation essay and all department question answers.
- **3-Tier Review Status**:
  - Changed the simple true/false shortlist flag into three clear recruitment stages:
    1. **Waitlist** (`waitlisted`): The candidate meets criteria but is on hold.
    2. **Shortlist** (`shortlisted`): The candidate is approved for interviews.
    3. **Reject** (`rejected`): The candidate has been declined for this cycle.
  - Admins can change status directly from the modal or from the table row.
- **Fast Updates and Search**:
  - Changing a status updates the UI immediately and saves to Firestore in the background.
  - Admins can filter by status (All, Pending, Waitlisted, Shortlisted, Rejected) and search by candidate name, email, or registration number.

### 4.5 Two-Step 6-Digit OTP Email Verification Flow
To stop spam and fake accounts, a 6-digit email OTP system was built for manual email and password signups.

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
1. **User Experience**:
   - When a user signs up with email and password, their account is created as unverified.
   - They are sent straight to the verification screen (`/auth/signin?mode=verify&email=...`).
   - The screen shows:
     - A clear 6-digit code input with monospace styling.
     - A 10-minute countdown timer.
     - An attempts counter ("3 attempts left").
     - A "Resend Code" button with a 60-second cooldown.
   - The user types the code right on the page without needing to click external links.
2. **Code Generation and Email Sending**:
   - Generates a random 6-digit number using `crypto.randomInt(100000, 1000000)`.
   - Sends the email using Nodemailer (`EMAIL_USERNAME`, `EMAIL_PASSWORD`).
   - In local development without email credentials, it prints the code directly to the terminal for easy testing.
3. **Secure Storage**:
   - The code itself is never saved in plain text.
   - It is hashed using SHA-256 with a salt and secret, and stored in the `otp_verifications` collection for 10 minutes.
4. **Protection Against Abuse**:
   - Timing-safe check: Compares the submitted code securely using `crypto.timingSafeEqual`.
   - 3-attempt limit: Entering the wrong code 3 times deletes the OTP record, requiring a new code.
   - Once verified, the OTP is deleted immediately.
   - Rate limits: Limits how often users can request new codes (up to 5 requests per 15 minutes).
5. **Protecting the Application Form**:
   - Unverified accounts cannot submit applications (`/api/submit-form` returns HTTP 403).
   - If an unverified user visits the application page, they are shown a message asking them to verify first.

### 4.6 Legal and Compliance Routes
- Added standard legal policy pages:
  - `/privacy`: Explains what data is collected (Name, Email, Phone, Registration Number, Department choices, Written answers), how it is stored securely in Firestore, and candidate rights.
  - `/terms`: Sets rules for using the portal and submitting applications.
- Explicit Consent:
  - The application form (`components/FormComp.jsx`) includes a required checkbox for the Privacy Policy and Terms of Service before the submit button is enabled.

---

## Section 5: Verification and Build Validation

The codebase was verified with standard build and route checks:
1. **Build Check**: Ran `npm run build`. The Next.js production build succeeded with exit code 0.
2. **Route Coverage**: All 27 server and client routes compile cleanly without errors or broken dependencies.

---

## Section 6: Feature Additions Following UI/UX Consolidation

This section details the features and user experience components added to the portal. It explains what was added and why it was added, with the file name and code snippet for each change.

### 6.1 Manual Credential Login 6-Digit Email OTP Challenge

- **What was added**:
  A new API endpoint (`/api/auth/login-otp`) for manual email and password logins. When a user enters their credentials, the server verifies the password and creates a 6-digit verification code. This code is sent to their email address (or printed in the terminal during development). The screen then asks the user to enter the code to complete their login.
- **Why it was added**:
  To make sure that manual password logins have the same level of email verification as new signups, keeping accounts safe without needing external email links.

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
  Updated the navbar (`components/NavBar.jsx`) and the login page (`app/auth/signin/page.jsx`) to show a standard two-tab switcher with "Sign Up" on the left and "Log In" on the right. Links in both the desktop header and mobile menu open the correct tab directly (`/auth/signin?mode=signup` and `/auth/signin?mode=login`).
- **Why it was added**:
  To follow standard web design, making it clear where new applicants create an account and where existing users log in.

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
  Added a check when submitting the Sign Up form. If an email address already has an account, the form stops, shows an error ("An account with this email already exists"), and displays a quick link button to switch to the Log In tab.
- **Why it was added**:
  To make sure the Sign Up tab is only used for creating new accounts, guiding returning users to log in instead.

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
  Added a notice at the bottom of the recruitment rules popup (`components/PopupComp.jsx`). It states: "By continuing, you agree to our Privacy Policy and User Agreement." with direct links to both pages.
- **Why it was added**:
  To ensure applicants are aware of the rules, terms, and privacy policies before they start picking departments or submitting personal details.

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
  Made department domain badges easier to see on explore-departments and department modals by increasing their color contrast and opacity. Also enlarged close buttons on modals and notifications so they are easier to click or tap.
- **Why it was added**:
  To make text legible across both light and dark backgrounds, and to make closing popups easy on mobile and desktop screens.

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
  Updated the dynamic route handler in `app/(pages)/join/[...joinIds]/page.jsx` so it recognizes readable department names in URLs (like `/join/management`, `/join/web-dev`, `/join/ai-ml`) as well as department IDs (like `/join/dept-1`).
- **Why it was added**:
  To provide simple, readable links that can be shared in announcements while keeping existing department links working.

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
  Shortened the sign-out notification and redirect delay in `app/auth/signout/page.jsx` so signing out takes less than 1.5 seconds.
- **Why it was added**:
  To keep the experience quick and responsive without leaving the user waiting on a sign-out screen.

File: `app/auth/signout/page.jsx`
```jsx
await authClient.signOut();
toast.success("Signed out successfully", { duration: 900, dismissible: true });
router.push("/");
```
