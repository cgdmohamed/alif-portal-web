# Alef Future — Admin Portal

React + Vite + TypeScript web dashboard for **منصة ألف** (Alef Future) — the operator console platform
admins, school admins, and teachers use to run schools, classes, live sessions, content, and reporting.
Wired to the real Alef Future backend (`D:\2026\Alif Future\v2\api`, NestJS + Postgres) — see that repo's
own README/`docs` for the API it calls.

## Roles

Login is email + password against the real backend (`POST /auth/login`) — this is the operator side, not
the OTP-based mobile app. Three separate route trees, gated by role via `ProtectedRoute`:

- **platform_admin** — the full console: schools, packages, classes, catalog/question bank, content
  library, calendar, live sessions, recordings, assignments/grading, reports, support, users & roles,
  settings, activity log.
- **school_admin** — a school-scoped subset: dashboard, resources, classes, teachers, students,
  enrollment codes, package, settings, live sessions.
- **teacher** — dashboard, classes, settings, live sessions.

## Features

- **Live sessions** — real Agora RTC video (camera/mic, local + remote tiles, screen sharing) via
  `agora-rtc-sdk-ng`, joined through the backend's `/meetings/:id/join` token endpoint.
- **Schools, packages, classes, catalog** — full CRUD against the real backend, no mock data.
- **Content library, recordings, assignments/grading, reports** — same: real API-backed CRUD/reporting.
- **Enrollment codes** — school admins generate the `ALEF-XXXX-XXXX` codes the mobile app redeems.
- **Activity log, support chat, auto-messages, settings** — operational tooling for platform admins.

## Local setup

1. **Have the API running** (see `D:\2026\Alif Future\v2\api`'s README) — this dashboard has no backend
   of its own.
2. **Configure env**:
   ```bash
   cp .env.example .env
   ```
   Defaults to `http://localhost:3000`, matching the API's local dev default.
3. **Install deps**:
   ```bash
   npm install
   ```
4. **Run**:
   ```bash
   npm run dev
   ```
5. **Log in** with any seeded platform_admin/school_admin/teacher account (see the API repo's `npm run
   seed` — password `Passw0rd!` for all three).

## Build

```bash
npm run build      # tsc -b && vite build — output in dist/
npm run preview    # serve the production build locally
npm run lint
```

## Production notes

- **Static SPA behind nginx** — `Dockerfile` builds with Vite then serves `dist/` via `nginx:alpine`
  (`nginx.conf`). `VITE_API_URL` is a **build-time** arg (Vite bakes `VITE_*` vars into the JS bundle),
  not a runtime env var — it must be set before the image is built, not after the container starts.
- **Deploying with Docker/Coolify**: `docker-compose.yaml` builds the image with `VITE_API_URL` passed as
  a build arg and exposes port 80 (nginx) — assign the domain in Coolify's Domains UI (no `ports:`
  mapping; the proxy routes to the container once a domain is set). `SERVICE_FQDN_ADMIN` is a Coolify
  magic variable resolved to the assigned domain automatically.
- Make sure the backend's `CORS_ORIGIN` includes this app's deployed origin, or every API request will be
  blocked by the browser.
