# GDG Recruitment Portal

Official recruitment and candidate evaluation portal for Google Developer Groups (GDG) student community. Built with Next.js 14 App Router, Better Auth, Cloud Firestore, Tailwind CSS, and Nodemailer.

---

## 1. Prerequisites

Before setting up the repository locally, ensure you have the following installed:
- Node.js (version 18.17.0 or higher, version 20 LTS recommended)
- npm (version 9 or higher) or bun
- A Firebase project with Cloud Firestore enabled
- A Google Cloud Console OAuth 2.0 Client ID (for Google Sign-In)
- A Gmail account with an App Password (for OTP verification emails)

---

## 2. Getting Started (Initialization)

Follow these steps once you have cloned or pulled the repository:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the example environment template to create your local environment configuration:
```bash
cp .env.example .env.local
```

Open `.env.local` and populate the required configuration values:

```env
# 1. Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# 2. Better Auth Configuration
BETTER_AUTH_SECRET="a_random_32_character_secret_key"
BETTER_AUTH_URL="http://localhost:3000"

# 3. Google OAuth Provider
GOOGLE_CLIENT_ID="xxxx-xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# 4. Nodemailer Transport (OTP and Candidate Emails)
EMAIL_USERNAME="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"

# 5. Campaign Schedule (Optional)
RECRUITMENT_DEADLINE="2026-12-31T23:59:59+05:30"
```

> Note: If SMTP credentials (`EMAIL_USERNAME` and `EMAIL_PASSWORD`) are omitted during local development, the system runs in Development Mode and logs all generated 6-digit OTP verification codes directly to your terminal.

### Step 3: Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Step 4: Building and Running in Production
```bash
npm run build
npm run start
```

The production server will listen on `http://localhost:3000`.

---

## 3. Core System Architecture

### Authentication
- Google OAuth: Single-click authentication bypassing secondary verification codes.
- Dual-Tab Interface: Organized with Sign Up on the left tab for new registrations and Log In on the right tab for returning candidates.
- Manual Login OTP: Manual credential logins enforce a 6-digit email OTP challenge before establishing session access.
- Account Isolation: The Sign Up tab strictly creates new accounts. Existing accounts attempting to sign up again are rejected and guided to the Log In tab.

### Candidate Workflows
- Domain Exploration (`/explore-departments`): Interactive cards and department modals detailing scope, tech stack, and responsibilities.
- Department Selection (`/departments`): Real-time tracker enforcing the maximum 2-department submission policy.
- Application Submission (`/join/[...joinIds]`): Friendly slug routing (e.g., `/join/management`) and system ID support, auto-saving local drafts, registration number validation (`25BCE5612`), and atomic Firestore transactions.

### Administrative Capabilities (`/admin`)
- Accessible only to accounts with `role: "admin"` in the Firestore `users` collection.
- Applicant Triage Table: Sortable records, instant multi-field search, department filters, and status filters.
- 3-Tier Lifecycle Controls: Dynamic status transitions (`Waitlist`, `Shortlist`, `Reject`) with asynchronous updates.
- Applicant Dossier: Comprehensive modal displaying candidate registration details, contact info, motivation essay, and questionnaire responses.
- CSV Export: One-click export of applicant rosters including formatted questionnaire submissions.

---

## 4. Administrative User Management

To grant admin privileges to an account, use the administrative management utility:

```bash
node scripts/manage-admin.js grant your-email@example.com
```

To revoke admin privileges:
```bash
node scripts/manage-admin.js revoke your-email@example.com
```

To list current administrators:
```bash
node scripts/manage-admin.js list
```

---

## 5. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack / HMR |
| `npm run build` | Compiles the optimized production build |
| `npm run start` | Runs the compiled production Next.js server |
| `npm run lint` | Runs ESLint checks across all project files |
