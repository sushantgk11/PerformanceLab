# Performance Lab

A hands-on enterprise frontend workspace for exploring customers, commerce, and business reporting.

## Requirements and quick start

Use Node.js 22.9 or newer (Node 24 LTS recommended) and npm. The lockfile records the installed dependency versions.

```powershell
cd D:\personal\performance
npm ci
npm run dev
```

Open http://localhost:3000. No environment file or cloud account is required for the demo.

- Email: `alex@performancelab.dev`
- Password: `demo1234`

## Commands

```powershell
npm run dev          # Development server, with React development tooling
npm run typecheck    # Strict TypeScript validation
npm run lint         # ESLint
npm test             # Dataset integrity and reporting tests
npm run build        # Production build
npm start            # Serve the production build at localhost:3000
npm run analyze      # Next.js bundle analysis
npm run format       # Format project source
```

Stop the development server before serving production on the same port. To use a different port, run `npm run dev -- --port 3001` or `npm start -- --port 3001`.

The project uses a workspace-local npm cache (`.npm-cache`) so installation does not depend on free space in the system drive's npm cache. Cache contents are ignored by Git.

## Browser tests

The integration suite expects a server at http://localhost:3000 and an installed Google Chrome. Start `npm start` after building in one terminal, then run `npm run test:e2e` in another. Tests use the demo authentication mode; leave Firebase configuration empty. Browser artifacts are written to `artifacts/`. The suite checks authentication, protected routes, lists, searching, dialogs, exports, analytics, settings persistence, live events, and mobile navigation.

If your system temporary directory is full, use a project directory in the test terminal:

```powershell
New-Item -ItemType Directory -Force .tmp
$env:TEMP = "$PWD\.tmp"
$env:TMP = "$PWD\.tmp"
npm run test:e2e
```

## Features

- **Overview:** Revenue and customer charts, KPI cards, recent activity, notifications, top products, recent orders with pagination, and CSV reports.
- **Users:** 10,000 customers with avatars, company and country details, search, status and role filters, sorting, and detail dialogs.
- **Products:** 1,000 catalog entries with individual image URLs, category tabs, search, sorting, stock information, and detail dialogs.
- **Orders:** 10,000 linked transactions with search, status filtering, sorting, row selection, CSV exports, and order details.
- **Analytics:** Date-filtered revenue, customer and product views; geographic and category breakdowns; reporting exports.
- **Activity:** 12,000 historical events and a mock event subscription, with type filters, search, pause/resume, and exports.
- **Settings:** Browser-persisted profile, light/dark/system theme, table density, reporting defaults, notification preferences, and a local permission policy preview.
- **Application shell:** Responsive navigation, workspace search (submit to search users), session information, loading, error, and empty states.

The reproducible dataset ends on **October 8, 2026**, independently of your system date. All reporting amounts are USD. Revenue excludes cancelled orders; total order counts include all statuses. User lifetime spend reconciles with the non-cancelled transaction ledger. External product photography and avatars require an internet connection. The records are synthetic and reset with the application data module; settings are stored in your browser. Email preferences and permission previews are local demo settings, not email delivery or enforced authorization policies.

## Architecture

```text
app/                 App Router pages, protected layout, and HTTP route handlers
components/          Shell, reusable controls, dialogs, tables, and charts
features/            Feature screens organized by workspace area
hooks/               Shared query hooks
providers/           Query, Redux, and global settings providers
store/               Redux Toolkit workspace search, selection, notifications
services/            API access, reporting calculations, activity subscription
lib/                 Session signing and Firebase initialization
data/               Deterministic, relational mock dataset generation
types/              Shared TypeScript domain models
utils/              Formatting and CSV export
tests/              Data/reporting unit tests and browser integration tests
```

Pages and session checks use Server Components. Interactive screens use Client Components. The API layer lives at `/api/data/[resource]`; it requires a valid session and returns JSON. TanStack Query owns fetched data; Redux Toolkit owns workspace search, order selection, and dismissed notifications; Separate contexts own application settings, the workspace clock, and notification actions; feature components own their controls and open dialogs. The mock subscription exposes an unsubscribe function used during navigation and pause/resume.

## Authentication and environment

Copy `.env.example` to `.env.local` if you want to configure Firebase. In the Firebase console, register a web app, enable Email/Password authentication, and create a test account. Add localhost to authorized domains if needed.

| Variable                           | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Firebase web API key                                  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain                                  |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase project ID                                   |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | Firebase web app ID                                   |
| `SESSION_SECRET`                   | Long random signing secret; required in Firebase mode |

Restart/rebuild after changing environment variables. Public Firebase values are bundled into the client. Keep `SESSION_SECRET` server-only. Firebase ID tokens are verified through Firebase's account lookup endpoint before the application issues its own signed, HTTP-only, one-day session cookie. Sign-out expires that cookie. Dashboard layouts and data endpoints both validate sessions. The application does not implement password resets or registration.

Without Firebase configuration the application uses the published demo credentials and a local demo signing key. This mode is for the sample workspace; do not put private data behind the demo login. Firebase sessions in this project are validated at login and expire after one day; this is not a production identity-management system.

## Investigation tools

Use Chrome DevTools Performance, Network, Memory, and Lighthouse against the application normally. Use React DevTools Profiler with `npm run dev`. For a production profiling build, run `npm run build -- --profile`, then `npm start`. Use production builds for Lighthouse comparisons. `npm run analyze` starts Next.js's bundle analyzer. There is no custom performance dashboard.

## Dependency maintenance

The initial installation's npm audit reports transitive advisories through Firebase/Firestore and the Next.js ESLint toolchain. Authentication uses the Firebase Auth modules; this project does not use Firestore. Review current advisories before deploying externally; the suggested forced downgrades are not applied to this training workspace.
