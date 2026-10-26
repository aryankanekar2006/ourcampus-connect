# Download and Share Audit

## Scope
This audit reviews the links, buttons, and routes that trigger file downloads, PDF exports, browser share flows, clipboard backups, and ZIP/DOCX generation across the OurCampus Connect app.

## Source evidence summary
The implementation is distributed across:
- `src/components/FlyerCreatorModal.jsx`
- `src/components/EventDetailModal.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/TeacherDashboard.jsx`
- `src/components/TechStackModal.jsx`
- `server.ts`

## Actual controls discovered

| # | Control | Source file | Intended action | Implementation | Actual test result |
|---|----------|-------------|-----------------|---------------|-------------------|
| 1 | `Download JPG` in flyer editor | `src/components/FlyerCreatorModal.jsx` (`handleDownloadJPG`) | Download the current flyer preview as a JPG | Uses `html2canvas` to render the poster and triggers `a.download` with `canvas.toDataURL('image/jpeg', 0.96)` | Code is present and compiles. Browser download behavior was not executed in this environment because no browser automation session was available. |
| 2 | `Download PDF` in flyer editor | `src/components/FlyerCreatorModal.jsx` (`handleDownloadPDF`) | Export the current flyer preview as PDF | Uses `html2canvas` + `jsPDF` and calls `pdf.save(...)` | Code is present and compiles. No browser-side PDF file save was executed during this run. |
| 3 | `Share` in flyer editor | `src/components/FlyerCreatorModal.jsx` (`handleShare`) | Share a PNG flyer or fall back to download/copy | Captures poster with `html2canvas`, creates a `File`, checks `navigator.share`/`navigator.canShare`, then falls back to clipboard or a forced download | Code is present and compiles. Native share and browser download fallback were not exercised here because no browser UI session was available. |
| 4 | `Download JPG` for approved flyer | `src/components/FlyerCreatorModal.jsx` (`handleDownloadSavedFlyer`) | Download the saved approved flyer image | Uses the event's `selectedFlyerImage` and creates a download link from that data URL | Code is present and compiles. Browser download not executed in this environment. |
| 5 | `Share` in event detail modal | `src/components/EventDetailModal.jsx` (`handleShare`) | Share a public event or flyer link | Uses `navigator.share` when available; otherwise copies `window.location.href` to the clipboard | Code is present and compiles. Browser share flow was not executed here. |
| 6 | `Download Word Document (.docx)` in admin dashboard | `src/pages/AdminDashboard.jsx` and `server.ts` (`/api/reports/docx/:eventId`) | Generate and download a summary report for event analytics | Server builds a DOCX document with `docx` and returns it as a file attachment | Route exists and project compiles. No actual browser download test was run in this environment. |
| 7 | `Download Word Document (.docx)` in teacher dashboard | `src/pages/TeacherDashboard.jsx` and `server.ts` (`/api/reports/docx/:eventId`) | Download the same summary report for faculty-owned events | Same server route as above, triggered from teacher pages | Route exists and compiles. Browser download not executed here. |
| 8 | `.ZIP` project download | `src/components/TechStackModal.jsx` and `server.ts` (`/api/download-project-zip`) | Download a zip bundle of the project export | Link points to `/api/download-project-zip` and the server builds a zip archive with `serveProjectZip` | The route and archive builder exist and the project builds successfully. No browser zip download was executed here. |
| 9 | QR image generation route | `server.ts` (`/api/generate-qr`) | Generate a real QR code for a URL | Uses `qrcode.toDataURL(url)` with a PNG fallback path | Verified directly with Node using the same package. The generated output is a valid `data:image/png;base64,...` QR code. |

## Important notes
- The project does not include a browser automation test suite or Playwright/Cypress setup in `package.json`; therefore browser-level file downloads and native share behavior were not executed during this session.
- The current code path is implemented in the front-end and server, and the project compiles successfully with `npm run lint` and `npm run build`.
- QR generation was validated at runtime by starting the built server and calling `/api/generate-qr`, which returned a real `data:image/png;base64,...` payload. That QR image was then decoded by OpenCV and matched the exact original URL string.
- The app health endpoint also responded successfully from the running server with `{"status":"ok","app":"OurCampus Connect","college":"R. K. Talreja College"}`.
- For the final flyer workflow, the QR image is generated in the selected flyer preview and is included in the captured poster used by the export and share logic.

## Final status by action
- QR generation: verified at library level.
- Flyer JPG export: implemented, compiled, not browser-verified here.
- Flyer PDF export: implemented, compiled, not browser-verified here.
- Flyer share flow: implemented, compiled, not browser-verified here.
- Word report generation: implemented, compiled, not browser-verified here.
- Project zip download: implemented, compiled, not browser-verified here.
- Authorization checks: guarded by `requireAuth`, `requireRole`, `requireSameOrigin`, and `requireVerifiedFaculty` in the relevant routes.
