# System Architecture & Recruitment Workflow Enhancements

## 1. Executive Summary
This document provides a comprehensive technical overview of the recruitment lifecycle and admin management improvements implemented in the Google Developer Groups (GDG) recruitment platform.

Key enhancements include:
- **Mandatory Question Validation**: Dynamic Zod schema enforcement ensuring every department-specific prompt and organization motivation response is thoroughly validated before submission.
- **Submission Confirmation UX**: A pre-flight confirmation modal safeguarding candidates against accidental submissions.
- **Dynamic Candidate Status Hub**: Transparent recruitment status tracking across candidate touchpoints (`/` user portal and `/departments`), with dedicated visual states for Waitlisted, Shortlisted, and Rejected candidates.
- **Admin Review Dossier & 3-Tier Status Controls**: Single-click modal review replacing multi-step dialogs, direct table-row status triage (Waitlist, Shortlist, Reject), and updated multi-status filtering.

---

## 2. Firestore Schema Specifications

### `formData` Collection Updates
Each applicant submission document stored in the `formData` collection now persists an explicit 3-tier lifecycle state while maintaining backwards compatibility with legacy boolean flags.

```typescript
interface ApplicantDocument {
  _id?: string;
  Name: string;
  Email: string;
  Phone: string;
  RegistrationNumber: string;
  Department: string;
  Gender: string;
  Pref: string;
  "Year of Study": string;
  "Why do you want to join Organization Name?"?: string;
  "Why do you want to join GDG?"?: string;
  Questions: Record<string, string> | Array<string | [string, string]>;
  
  // Recruitment Status Schema (New)
  status: "waitlisted" | "shortlisted" | "rejected";
  
  // Legacy Backwards Compatibility Flag
  shortlisted: boolean; // true when status === "shortlisted", false otherwise
  
  createdAt: string; // ISO 8601 Timestamp
}
```

### Status Hierarchy & Aggregation
When a candidate applies to multiple departments (up to the system maximum of 2):
1. If **any** department application is marked `"shortlisted"`, the candidate's `overallStatus` resolves to `"shortlisted"`.
2. If **all** department applications are marked `"rejected"`, the candidate's `overallStatus` resolves to `"rejected"`.
3. Otherwise, the candidate's `overallStatus` resolves to `"waitlisted"` (Under Review).

---

## 3. API Route Enhancements

### 1. `POST /api/submit-form`
- **File**: `app/api/submit-form/route.js`
- **Description**: Handles candidate application form submissions with JWT-verified user session.
- **Schema Mutation**:
  - Automatically initializes `status: "waitlisted"`.
  - Initializes `shortlisted: false`.
  - Enforces application limit (maximum 2 departments per user).
  - Sanitizes user input and logs structured audit traces.

### 2. `PATCH /api/shortlist/[id]`
- **File**: `app/api/shortlist/[id]/route.js`
- **Description**: Admin-restricted endpoint for updating candidate recruitment review states.
- **Request Body Options**:
  ```json
  { "status": "waitlisted" | "shortlisted" | "rejected" }
  ```
  *or legacy backward-compatible body:*
  ```json
  { "shortlisted": true | false }
  ```
- **Backend Logic**:
  - Validates `status` against accepted enum values (`waitlisted`, `shortlisted`, `rejected`).
  - Sets `shortlisted = (status === "shortlisted")`.
  - Simultaneously commits `{ status, shortlisted, updatedAt }` to Firestore.

### 3. `GET /api/check-applications`
- **File**: `app/api/check-applications/route.js`
- **Description**: Authenticated candidate status query endpoint called by dashboard and department views.
- **Response Format**:
  ```json
  {
    "count": 1,
    "submittedDepartments": ["Technical", "Design"],
    "overallStatus": "waitlisted" | "shortlisted" | "rejected",
    "applications": [
      {
        "id": "doc_id_123",
        "department": "Technical",
        "status": "waitlisted",
        "shortlisted": false,
        "createdAt": "2026-09-06T15:00:00.000Z"
      }
    ]
  }
  ```

### 4. `GET /api/admin/applicants` & `app/(pages)/admin/page.jsx`
- **Files**: `app/api/admin/applicants/route.js`, `app/(pages)/admin/page.jsx`
- **Description**: Delivers applicant records to the admin dashboard.
- **Mapping Logic**:
  ```javascript
  status: doc.data().status || (doc.data().shortlisted ? "shortlisted" : "waitlisted")
  ```
  Guarantees consistent 3-tier status strings even for legacy records lacking the new `status` attribute.

---

## 4. Frontend Component Architecture

### 1. `CandidateStatusCard.jsx`
- **Location**: `components/CandidateStatusCard.jsx`
- **Purpose**: A self-contained, accessible card displaying recruitment outcome states.
- **Design & States**:
  - **Waitlisted / In Review (`waitlisted`)**:
    - Subtle blue/neutral card with `Clock` icon.
    - Calm, informative messaging: *"Your application is currently under review. Please wait for the recruitment results to be declared."*
    - Badges for all submitted tracks.
  - **Shortlisted (`shortlisted`)**:
    - Celebratory emerald/gold card with confetti styling, `Trophy` and `Sparkles` icons.
    - Prominent banner: *"Congratulations! You have been shortlisted for the next round. Check your email for further instructions!"*
  - **Rejected (`rejected`)**:
    - Encouraging, respectful neutral/rose card with `HeartHandshake` icon.
    - Warm feedback: *"Thank you for applying to GDG. Unfortunately, we will not be moving forward with your application for this round. We wish you the best in your upcoming journey!"*

### 2. `FormComp.jsx`
- **Location**: `components/FormComp.jsx`
- **Validation Refactoring**:
  - Dynamic Zod schema maps over all active department questions and requires non-empty strings:
    ```javascript
    departmentQuestions.forEach((q) => {
      schemaObj[q] = z.string().min(1, `This question requires a response.`);
    });
    ```
  - "Why do you want to join GDG?" explicitly validated with minimum character threshold.
  - Form labels display visual required asterisks (`*`).
  - Pre-submission validation autofocuses the first invalid field and renders inline error text (`aria-invalid="true"`).
- **Confirmation Modal**:
  - Clean dialog appears upon valid form submission: *"Are you sure you want to submit your application? You won't be able to edit your answers after this."*
  - Provides "Confirm & Submit" and "Cancel / Review Answers" controls.
- **Post-Submission State**:
  - Replaces form view with `CandidateStatusCard` upon successful response.

### 3. `ApplicantDetailsModal.jsx`
- **Location**: `components/ApplicantDetailsModal.jsx`
- **Purpose**: Comprehensive modal dossier displaying full applicant details on row click.
- **Features**:
  - Candidate metadata grid: Name, Registration Number, Year of Study, Gender, Phone, Email.
  - Formatted Questionnaire Answers: Renders both standard questions and track-specific prompts with question numbering and clean typography.
  - In-Modal Status Controls: Allows administrators to switch candidate between Waitlist, Shortlist, and Reject with instant optimistic UI update.

### 4. `DataTable.jsx` & `FilterShortlisted.jsx`
- **Location**: `components/DataTable.jsx`, `components/FilterShortlisted.jsx`
- **Table Row Interactions**:
  - Entire table row is clickable (`cursor-pointer hover:bg-muted/40`), opening `ApplicantDetailsModal`.
  - Status control button group on each row allows rapid triage without opening the modal.
  - `e.stopPropagation()` placed on status buttons and row checkboxes to prevent accidental modal triggers.
- **Filter Updates**:
  - Select options: "All Statuses", "Waitlisted", "Shortlisted", "Rejected".
  - Dynamic filtering checks both new `status` and legacy `shortlisted` properties.
- **Toolbar Streamlining**:
  - Legacy "View Responses" dialog button removed in favor of direct row selection.

---

## 5. Security & Verification Strategy
- **Role Verification**: Admin routes enforce Firebase admin claim checks or email whitelist validation.
- **Client/Server Integrity**: All status mutations are sanitized and verified server-side.
- **No Cumulative Layout Shift (CLS)**: Skeleton loaders mirror final component proportions during authentication and data fetching cycles.

---

## 6. Decoupled Department Discovery & Application Architecture

### The UX Problem: Premature Commitment & Cognitive Friction
In the previous architecture, clicking "Explore Departments" on the homepage funnelled visitors directly into the transactional application flow (`/departments`), where users were immediately confronted with selection limits, domain checkboxes, and questionnaire submission prompts.

This created significant user experience friction:
1. **Premature Commitment**: Visitors seeking to simply learn what GDG does (e.g. what kind of web projects they build, what game engines they use, or what the culture is like) were forced into an application context before feeling ready or informed.
2. **Cognitive Overload**: Candidates had to make binding department choices without visibility into team charters, tech stacks, or project scopes.
3. **Loss of Browsing Context**: Without a dedicated informational showcase, users had no low-friction mechanism to evaluate all 12 domains side-by-side.

### The Architectural Solution: Decoupled Discovery from Transactional Submission
To eliminate this friction, the architecture decouples informational browsing from transactional submission into two dedicated, cooperative paths:

```
                          [ Homepage Hero ]
                         /                 \
       (Left: Secondary) /                   \ (Right: Primary)
    "Explore Departments"                     "Apply Now"
             v                                     v
   [/explore-departments]                     [/departments]
   - Informational showcase                   - Active domain selection
   - 12 department cards + stock photos       - Up to 2 domains
   - In-depth modal dossier                   - Direct path to questionnaire
   - Low-commitment exploration               - Step 01 of transaction
             |
             +---> "Select Domain" / "Proceed to Apply"
                         |
                         v
              [/departments?selected=...]
              - Carries over pre-selected domains
              - Smooth, uninterrupted onboarding
```

1. **Informational Route (`/explore-departments`)**:
   - Focuses purely on discovery, education, and inspiration.
   - Features rich local stock photography (`public/assets/images/departments/*.png`) for all 12 club domains.
   - Each card provides a high-level overview, tone accents, and tech stack chips.
   - Includes a persistent, floating glassmorphic navigation pill with two permanent anchors:
     - **Left Anchor**: "Back to Home" (clear arrow icon + return navigation).
     - **Right Anchor**: "Proceed to Apply" (primary CTA carrying over pre-selected domains to `/departments?selected=...`).
2. **Transactional Route (`/departments`)**:
   - Preserves the fast, direct application flow for returning or decisive applicants.
   - Automatically ingests pre-selected domains from `searchParams` (`?selected=Web Dev,Design`), initializing candidate selections without requiring redundant clicks.
   - Encapsulated within a React `<Suspense>` boundary backed by `DepartmentGridSkeleton` to guarantee zero SSR de-optimizations and instant perceived load times.

### Accessibility & Interaction Design Decisions: Click-to-View vs. Hover States
1. **Mobile Touch Parity**: Hover triggers fail on mobile devices and touch screens, resulting in awkward double-tap behavior, erratic tooltips, or completely inaccessible secondary content. Explicit click-to-view (`onClick` / `onTouchEnd`) guarantees an identical, predictable experience across mobile, tablet, and desktop viewports.
2. **Keyboard Accessibility & Screen Readers**:
   - Every department card is configured with `role="button"`, `tabIndex={0}`, descriptive `aria-label`, and `aria-haspopup="dialog"`.
   - Card expansion is triggered via `Enter` and `Space` keyboard events.
   - The detailed dossier is rendered inside a Radix UI `Dialog` portal. This provides automated focus trapping, `Escape` key dismissal, ARIA modal attributes (`role="dialog"`, `aria-modal="true"`), and automatic focus restoration upon closing.
3. **Zero Cumulative Layout Shift (CLS)**:
   - Rather than expanding cards in-place (which pushes neighboring grid items down and triggers noticeable layout shifts), clicking a card opens an overlay modal dialog outside the document flow.
   - Surrounding cards maintain fixed geometry, aspect ratios, and padding, maintaining a 0.00 CLS score.

---

## 7. Favicon, Iconography & Brand Asset Configuration

### Audit & Verification Findings
A thorough audit of existing icon assets revealed:
- `app/favicon.ico` previously contained a 269-byte generic circular dot placeholder.
- `app/icon.svg` contained a basic white dot on a black square.
- No `public/favicon.ico` or SVG favicon was present in `public/`.
- `metadata` in `app/layout.js` lacked an explicit `icons` configuration object.

### Brand Asset Overhaul
All favicon and brand assets have been replaced with the authentic Google Developer Groups `< >` bracket identity rendered in Google's core brand palette on a sleek dark rounded squircle badge:
- **Top-Left Chevron Arm**: Google Blue (`#4285F4`)
- **Bottom-Left Chevron Arm**: Google Red (`#EA4335`)
- **Top-Right Chevron Arm**: Google Yellow (`#FBBC05`)
- **Bottom-Right Chevron Arm**: Google Green (`#34A853`)
- **Squircle Badge**: `#131314` with subtle border `rgba(255,255,255,0.14)` and `rx="16"`, ensuring high contrast across both light and dark browser tab chrome.

### Asset Paths & Formats
1. **`app/icon.svg`** (`image/svg+xml`):
   - Vector SVG automatically served by Next.js App Router at `/icon.svg`.
   - Scalable to any device pixel density (16x16, 32x32, 64x64, 180x180, 512x512).
2. **`app/favicon.ico` & `public/favicon.ico`** (`image/x-icon`):
   - Valid multi-resolution ICO file embedding a 32x32 RGBA PNG of the official GDG icon.
3. **`public/favicon.svg`** (`image/svg+xml`):
   - Static vector favicon accessible directly from `/favicon.svg`.
4. **`public/icon-32x32.png`** (`image/png`):
   - Dedicated 32x32 rasterized PNG for legacy browser fallbacks.
5. **`public/assets/gdg.svg`**:
   - Replaced generic dot placeholder with the authentic GDG logo, elevating brand consistency across the navbar, footer, and loading components.

### Next.js Metadata Declaration (`app/layout.js`)
```javascript
export const metadata = {
  // ...
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  },
};
```
This configuration guarantees full compliance across modern browsers (Chrome, Safari, Firefox, Edge), iOS Safari home screen bookmarking, and legacy Windows/desktop shortcut handlers with zero default Next.js/Vercel triangle placeholders.

---

## 10. Legal Infrastructure, Privacy Governance & Data Transparency

To align with modern data privacy principles, fair candidate recruitment practices, and institutional accountability, dedicated legal routes and explicit applicant consent mechanisms have been implemented across the portal.

### 1. Dedicated Legal Routes
- **Privacy Policy (`/privacy`)**:
  - **File**: `app/(pages)/privacy/page.jsx`
  - **Scope**: Explicitly enumerates candidate data collected (Registration Number, Full Legal Name, Email Address, WhatsApp Contact Number, Year of Study, Gender Preference, Department Preferences, and Written Questionnaire Answers).
  - **Recruitment Purpose**: Clarifies that all candidate information is collected solely for internal evaluation, task review, and interview scheduling by verified Google Developer Groups (GDG) chapter leads. Data is never sold, licensed, or exposed to third-party advertisers.
  - **Data Retention & Safeguards**: Specifies that records are encrypted in transit via TLS 1.3/HTTPS, stored in Google Cloud Firestore with role-based security rules, and purged or anonymized once the recruitment onboarding cycle concludes.
  - **Third-Party Infrastructure**: Documents third-party dependencies, including Google OAuth for identity management and Firebase/GCP for database operations.

- **User Agreement & Code of Conduct (`/terms`)**:
  - **File**: `app/(pages)/terms/page.jsx`
  - **Scope**: Establishes applicant terms of participation, eligibility, and submission integrity.
  - **Originality & Accuracy**: Applicants certify that all submitted project links, design portfolios, and questionnaire responses represent their authentic, original intellectual work. Plagiarism, impersonation, or misrepresentation results in immediate disqualification.
  - **Acceptable Use & Anti-Tampering**: Strictly prohibits automated scraping, parallel bot submissions, spamming, cross-site request forgery, and payload injection attempts.
  - **Selection Discretion**: Affirms that application submission does not guarantee admission and that evaluation outcomes made by the GDG review panel are final and binding.

### 2. Form-Level Consent & Global Integration
- **Global Footer (`components/Footer.jsx`)**: Integrated permanent, accessible footer navigation links to both `/privacy` and `/terms` alongside updated site navigation (`Home`, `Explore`, `Apply`).
- **Recruitment Form Consent (`components/FormComp.jsx`)**: Placed an active consent notice directly adjacent to the primary submit button:
  > *"By submitting, you agree to our User Agreement and acknowledge our Privacy Policy."*
- **Confirmation Modal Safeguard**: Integrated applicant certification into the pre-flight confirmation dialog, ensuring affirmative candidate consent prior to database persistence.

---

## 11. Authentication Architecture & Google Account Linking

### 1. Problem & Root Cause Analysis
Candidates who created their portal account using standard email/password authentication (`authClient.signUp.email`) had local user records created in Firestore with `emailVerified: false`. When those same candidates subsequently clicked **Sign In with Google** using the identical email address:
- Better Auth's OAuth callback handler evaluated account linking conditions.
- By default, `accountLinking.requireLocalEmailVerified` evaluates to `true`, and Google was not explicitly declared as a trusted provider for implicit linking.
- As a consequence, Better Auth aborted the linking sequence and returned an `account not linked` error, redirecting to an unhandled error route.

### 2. Implementation Specifications
1. **Trusted Account Linking Configuration (`lib/auth.js`)**:
   ```javascript
   account: {
     accountLinking: {
       enabled: true,
       trustedProviders: ["google"],
       requireLocalEmailVerified: false,
     },
   },
   onAPIError: {
     errorURL: "/auth/signin",
   },
   ```
   - `trustedProviders: ["google"]`: Authorizes Better Auth to trust Google as an authoritative identity provider for linking.
   - `requireLocalEmailVerified: false`: Allows linking even if the initial password-based signup did not undergo manual email verification. Upon successful Google OAuth authentication, Better Auth automatically sets `emailVerified: true` on the local user record.
2. **Graceful Error Fallbacks & Normalized Inputs (`app/auth/signin/page.jsx`, `components/SignInButton.jsx`)**:
   - Added `errorCallbackURL: "/auth/signin"` to `authClient.signIn.social` invocations.
   - Added automatic email normalization (`email.trim().toLowerCase()`) on both sign-up and sign-in to eliminate casing discrepancies.
   - Added active query parameter listeners (`searchParams.get("error")`) to surface helpful inline error notifications if any authentication handshake fails.

---

## 12. Admin Panel Real-Time Status Synchronization & Cache Invalidation

### 1. The State Desynchronization Issue
When recruitment leads updated an applicant's review status (e.g. marking a waitlisted candidate as "rejected"):
- The home page `/` correctly reflected the rejection by fetching directly from `/api/check-applications`.
- Navigating back to `/admin` caused the candidate's status to revert to "waitlisted" in the table.
- Switching between filters or pagination tabs temporarily cleared or distorted status updates.

### 2. Root Cause Analysis
1. **Next.js Router Cache**: Next.js App Router cached the `/admin` Server Component payload in the client-side router cache. Navigating `/admin` -> `/` -> `/admin` rendered the stale in-memory RSC snapshot rather than re-evaluating the server component.
2. **Fragmented Filter Pipeline in `DataTable.jsx`**: The table maintained three independent arrays (`data`, `deptFiltered`, `shortFiltered`). `handleStatusUpdate` only updated `tableData`, leaving `data` stale. Subsequent filter changes filtered against the stale `data` prop, immediately overwriting status updates.
3. **Missing Path Revalidation**: `/api/shortlist/[id]` committed changes to Firestore but did not call `revalidatePath`.

### 3. Architectural Solution
1. **Unified Reactive State**:
   - `DataTable.jsx` maintains a single `applicantsList` master array as the source of truth, deriving `tableData` reactively using `useMemo([applicantsList, selectedDept, selectedStatus])`.
   - Any status update immediately propagates across all active department and status filters without desynchronization.
2. **Automatic Lifecycle Synchronization**:
   - Added auto-fetching (`fetchLatestApplicants` via `/api/admin/applicants` with `cache: "no-store"`):
     - Automatically runs on mount when navigating to the admin panel.
     - Automatically runs on window `focus` and document `visibilitychange` (e.g. switching between browser tabs).
3. **Server & Router Cache Invalidation**:
   - Added `revalidatePath('/admin')` and `revalidatePath('/')` to `app/api/shortlist/[id]/route.js`.
   - Added `export const revalidate = 0;` and `export const fetchCache = "force-no-store";` to `app/(pages)/admin/page.jsx`.
   - Added `router.refresh()` to `handleStatusUpdate` in `DataTable.jsx` to clear the client router cache immediately after successful PATCH requests.
4. **Dynamic Filter Resets**: Added key-based reset triggers (`filterResetKey`) to `FilterDepartment` and `FilterShortlisted` so resetting filters clears both data filters and dropdown UI states.



