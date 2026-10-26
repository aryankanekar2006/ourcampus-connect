# OurCampus Connect — Complete Project Report

## 1. Confirmed technologies and platform
This project is a full-stack college event platform built as an in-place Vite + React front end and an Express + Node back end. The code in the workspace contains:
- Front end: React 19 with Vite, JSX, and Tailwind-style utility classes
- Back end: Express in `server.ts`
- Database: PostgreSQL via Drizzle ORM and `pg`
- Authentication: custom session cookie flow plus role checks in the server
- AI/image generation: `@google/genai` and Gemini endpoints
- QR generation: `qrcode`
- PDF generation: `jspdf`
- HTML-to-image capture: `html2canvas`
- DOCX generation: `docx`
- Front-end icons: `lucide-react`

## 2. Front-end and back-end architecture
### Front end
The React app is organized under `src/` with the main UI split into:
- `src/pages/` — role-based dashboards and main screens (teacher, student, admin, login)
- `src/components/` — shared UI such as `FlyerCreatorModal.jsx`, `EventDetailModal.jsx`, and the college logo modal
- `src/context/AuthContext.jsx` — shared auth and session state, plus event/flyer API helpers
- `src/features/` — business rules such as artwork validation, event date logic, and login/session validation
- `src/db/schema.ts` — database schema representation used by Drizzle

### Back end
`server.ts` is the main server file and includes:
- health check route
- authentication routes and session cookie creation
- database connection and startup seeding
- QR generation endpoint
- Gemini flyer generation endpoints
- event CRUD routes and approval logic
- student-facing event data routes
- attendance, notifications, messaging, and reporting endpoints
- a ZIP download route for project export

## 3. Database tables, columns, keys, and relationships
The schema is defined in `src/db/schema.ts` and includes the following main tables:

### `users`
Core identity and role table. Fields include:
- `id` (primary key)
- `uid`, `role`, `name`, `email`, `password`, `passwordHash`
- `rollNo`, `facultyId`, `adminId`, `studentClass`, `stream`, `department`
- `adminRole`, `phone`, `avatar`, `isVerified`, `verificationStatus`, `createdAt`

### `auth_sessions`
Stores hashed auth tokens for the app session system:
- `tokenHash` (primary key)
- `userId` (foreign key to `users.id`)
- `expiresAt`, `createdAt`

### `events`
Main event/seminar table. Important fields include:
- `id` (primary key)
- `type`, `programmeType`, `title`, `subHeadline`, `category`, `department`
- `dateMode`, `date`, `endDate`, `multipleDates`
- `time`, `venue`, `description`, `highlights`, `resourcePerson`, `forWhom`
- `prizes`, `contact`, `socialHandle`, `image`, `collegeLogo`, `deptLogo`
- `maxSeats`, `registrationEnabled`, `ticketPrice`, `eligibility`, `registrationDeadline`
- `externalRegistrationUrl`, `qrCodeUrl`, `targetAudience`, `attendanceEnabled`
- `status`, `principalMessage`, `flyerData`, `flyerVersions`, `selectedFlyerImage`
- `proposedFlyerImage`, `approvedFlyerImage`, `proposedCoverImage`, `approvedCoverImage`
- `flyerReviewStatus`, `coverReviewStatus`, `flyerReviewMessage`
- `createdBy`, `creatorEmail`, `creatorName`, `createdAt`

### `registrations`
Tracks student registrations to an event:
- `id`, `eventId`, `userEmail`, `userName`, `rollNo`, `studentClass`, `registeredAt`

### `volunteers`
Tracks volunteer applications:
- `id`, `eventId`, `userEmail`, `userName`, `roleApplied`, `reason`, `skills`, `status`, `appliedAt`

### `attendanceSessions` and `attendanceRequests`
Used for OTP and attendance tracking:
- `attendanceSessions`: `id`, `eventId`, `code`, `expiresAt`, `isActive`, `createdAt`
- `attendanceRequests`: `id`, `sessionId`, `eventId`, `userEmail`, `userName`, `rollNo`, `studentClass`, `status`, `submittedAt`, `approvedAt`

### `messages`
Principal-to-faculty or student-to-faculty messaging:
- `id`, `type`, `senderEmail`, `senderName`, `senderRole`, `recipientEmail`, `recipientName`, `eventId`, `eventTitle`, `subject`, `content`, `isRead`, `createdAt`

### `notifications`
Role-targeted notifications:
- `id`, `title`, `message`, `targetRole`, `targetAudience`, `recipientEmail`, `eventId`, `createdAt`

### `notification_reads`
Join table tracking notification read status by user.

### `feedbacks`
Feedback for events and seminars:
- `id`, `eventId`, `userEmail`, `userName`, `eventTitle`, `rating`, `comment`, `createdAt`

## 4. API routes and authorization
The server relies on Express middleware such as `requireAuth`, `requireRole`, `requireSameOrigin`, and `requireVerifiedFaculty` for authorization and session handling.

Examples from the code:
- `/api/health` — health check
- `/api/generate-qr` — QR generation helper
- `/api/db/register` — registration
- `/api/db/login` — login
- `/api/db/events` — create event or seminar
- `/api/db/events/:id` — update events
- `/api/db/events/:id/artwork` — save proposed flyer/cover artwork
- `/api/db/events/:id/flyer-review` — principal approval flow
- `/api/db/events/:id/college-logo` — save the college logo
- `/api/reports/docx/:eventId` — summary report export
- `/api/download-project-zip` — project zip export

The base permission model is:
- `student` — can register, attend, submit feedback, etc.
- `teacher` — can create events, submit flyers, manage own events, and view their own reports
- `admin` — acts as principal/admin for approval and system oversight

## 5. Authentication and user roles
Authentication is handled in `server.ts` and uses serialized session cookies. Role-based access is enforced via the middleware and checks on event ownership. The key user-role logic in the workspace is aligned with:
- `student` for event participation
- `teacher` for event creation and faculty management
- `admin` for principal review / approval

The app also includes verification checks for faculty access (`isVerified`, `verificationStatus`).

## 6. Gemini configuration and flyer generation
The Gemini configuration is created with `GoogleGenAI` in `server.ts` and uses the environment variable `GEMINI_API_KEY`.

Routes include:
- `/api/gemini/generate-flyer`
- `/api/gemini/generate-cover-artwork`

These generate image data URLs for event posters and cover images, which are then stored in the event record and used in the preview/export workflow.

## 7. QR generation and artwork composition
The QR code path is implemented in:
- `server.ts` — `GET /api/generate-qr`
- `src/components/FlyerCreatorModal.jsx` — QR generation with `qrcode` and rendering inside the flyer preview

Key behavior:
- The QR target uses the exact event registration URL supplied by faculty (via `externalRegistrationUrl` / `qrCodeUrl` / spatial fallback values)
- The QR is generated as a PNG data URL using `qrcode.toDataURL(...)`
- The generated QR is overlaid in the flyer preview so it becomes part of the final artwork used for snapshot export
- The exact registration URL is also written back to the event record in `externalRegistrationUrl` / `qrCodeUrl` before submission for approval

This is the real QR behavior currently in the codebase; it is not a decorative placeholder.

## 8. Download and share controls
The app includes several file export and share paths:
- Flyer JPG export
- Flyer PDF export
- Native share / clipboard fallback
- Saved approved flyer download
- Word summary export for faculty/admin
- Project zip export

The detailed implementation and status are recorded in `DOWNLOAD_SHARE_AUDIT.md`.

## 9. Event, registration, attendance, and volunteer workflows
The app supports:
- Event creation from teacher dashboards
- Event review and status updates from the principal admin flow
- Registration flows for students
- Attendance tracking with generated OTP logic
- Volunteer applications
- Messaging and notification system for principal / faculty / student updates
- Feedback collection after events

## 10. Environment variable names (without secret values)
Based on the workspace source, the following environment variable names are used:
- `GEMINI_API_KEY`
- `NODE_ENV`
- `ENABLE_DEMO_ACCOUNTS`
- `PRINCIPAL_REGISTRATION_KEY`
- `DATABASE_URL` or `POSTGRES_URL`
- `SQL_HOST`, `DB_HOST`, `PGHOST`
- `SQL_PORT`, `DB_PORT`, `PGPORT`
- `SQL_USER`, `SQL_ADMIN_USER`, `DB_USER`, `PGUSER`
- `SQL_PASSWORD`, `SQL_ADMIN_PASSWORD`, `DB_PASSWORD`, `POSTGRES_PASSWORD`, `PGPASSWORD`
- `SQL_DB_NAME`, `DB_NAME`, `PGDATABASE`
- `DISABLE_HMR`

No secret values have been added to this report.

## 11. Dependencies and their purposes
From `package.json`:
- `react`, `react-dom`, `vite` — front-end app and build tooling
- `express` — server runtime
- `pg`, `drizzle-orm`, `drizzle-kit` — PostgreSQL connectivity and schema management
- `@google/genai` — Gemini AI image generation
- `qrcode` — QR generation
- `html2canvas` — DOM capture into image data
- `jspdf` — client-side PDF export
- `docx` — Word document export
- `firebase`, `firebase-admin` — auth/integration support
- `lucide-react` — icons
- `dotenv` — environment variables
- `tsc`, `tsx`, `esbuild` — TypeScript/build support

## 12. Installation, configuration, and execution commands
From `package.json`:
- `npm install`
- `npm run dev` — run the project in development mode (`tsx server.ts`)
- `npm run lint` — TypeScript validation (`tsc --noEmit`)
- `npm run build` — Vite bundle + server bundle build
- `npm run start` — run the built server from `dist/server.cjs`
- `npm run db:push` — push schema changes with Drizzle
- `npm run db:generate` — generate DB migrations

## 13. Test results actually executed
The following validation was actually run in this environment:
- `npm run lint` — passed
- `npm run build` — passed
- QR generation library check using Node (`qrcode.toDataURL(...)`) — passed (`data:image/png;base64,...` was produced)

Browser-level tests for the UI exports, share fallbacks, and the live approval workflow were not executed here because no browser automation or live session was available.

## 14. Modified and created files for this task
Relevant code updates for this pass:
- `src/components/FlyerCreatorModal.jsx`
- `server.ts`
- `DOWNLOAD_SHARE_AUDIT.md`
- `OURCAMPUS_CONNECT_COMPLETE_PROJECT_REPORT.md`

## 15. Known limitations and remaining work
- Browser automation is not available in this session, so live end-to-end UI export/share verification remains unexecuted here.
- The project compiles and the backing QR generation is validated, but a real browser-based visual confirmation of the downloaded PNG/PDF and share dialogs would still need to be performed in an interactive browser.
- Some project features depend on PostgreSQL and a valid `GEMINI_API_KEY`, so local runtime verification requires the filled environment configuration and a database instance.
- The app currently enforces the same event approval flow with database fields for image proposal and approval, but the final end-to-end UI confirmation still requires a live browser session with the college data and event workflow configured.
