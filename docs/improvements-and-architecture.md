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
    - Prominent banner: *"🎉 Congratulations! You have been shortlisted for the next round. Check your email for further instructions!"*
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
