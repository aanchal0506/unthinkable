# CarePoint — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS v4 frontend for the
Healthcare Appointment & Follow-up Manager. Talks to the Express/Prisma
backend in `../backend`.

## Design

A distinct "clinic ledger" visual language instead of a generic SaaS
template: Spectral (serif) for headings, Public Sans for body text, IBM
Plex Mono for times/data, a pine-green + clay + amber palette, stamp-style
status badges, and a signature perforated "ticket" card for appointments.
Configured CSS-first via `@theme` in `src/app/globals.css` (Tailwind v4 —
no `tailwind.config.ts` needed).

## Structure

Pages and API/data-fetching are kept strictly separate:

```
src/
├── app/                  # Routes only — pages call lib/api, never fetch() directly
│   ├── page.tsx           # Landing
│   ├── login/ register/
│   ├── dashboard/          # Patient dashboard
│   ├── doctors/             # Patient: find a doctor
│   ├── book/[doctorId]/      # Patient: booking flow (slot hold → symptoms → confirm)
│   ├── appointments/          # Patient: appointment list/detail
│   ├── doctor/                 # Doctor portal (dashboard, appointments, leaves)
│   ├── admin/                   # Admin portal (doctor directory, availability)
│   └── settings/                 # Shared: Google Calendar connect/disconnect
├── components/
│   ├── ui/                # Button, Input, Textarea, Select, Alert, Loading
│   ├── layout/             # AppShell, Sidebar, Header
│   ├── auth/                 # ProtectedRoute (role-based guard)
│   ├── appointments/          # AppointmentCard, StatusBadge, UrgencyBadge, Tabs
│   ├── booking/                 # DatePicker, SlotGrid, BookingSummary
│   ├── consultation/             # ConsultationForm (doctor notes + prescriptions)
│   └── doctors/                    # DoctorCard, DoctorSearch
├── lib/
│   ├── api/                # One module per backend resource (auth, doctors,
│   │                          availability, slots, appointments, consultations,
│   │                          leaves, google) — the ONLY place that calls the backend
│   └── auth.ts              # Token/user storage, role-based redirect helper
└── types/                    # Shared TS types mirroring backend Prisma models
```

## Setup

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev                   # http://localhost:3000
```

Requires the backend (`../backend`) running and reachable at
`NEXT_PUBLIC_API_URL`.

## Roles & routes

| Role | Home | Key routes |
|---|---|---|
| Patient | `/dashboard` | `/doctors`, `/book/[doctorId]`, `/appointments`, `/settings` |
| Doctor | `/doctor` | `/doctor/appointments`, `/doctor/leaves`, `/settings` |
| Admin | `/admin` | `/admin/doctors`, `/admin/doctors/[id]` (profile + weekly availability) |

`ProtectedRoute` (via `AppShell allow={[...]}`) redirects unauthenticated
users to `/login` and wrong-role users to their own portal home.

Public registration is patient-only (`role: "PATIENT"` is hardcoded on
submit) — per the spec, doctor accounts are created by an admin from
`/admin/doctors`.

## Notable flows

- **Booking**: date → available slots → `POST /slots/hold` (5 min hold,
  session-stored) → symptom form → `POST /appointments` +
  `POST .../symptoms` → confirmation. If the hold expires or the slot gets
  taken, the booking call fails cleanly and the user is told to pick again.
- **AI summaries**: both the patient's pre-visit view and the doctor's
  appointment detail page show the AI urgency/chief-complaint/questions
  and post-visit patient summary, with a "Retry" action if the backend
  reports `aiStatus: FAILED` (LLM timeout/outage) — never a hard error.
- **Google Calendar**: `/settings` reads `?googleCalendar=connected|error`
  from the backend's OAuth redirect and shows live connection status via
  `GET /api/auth/me`.

## Build note

`next/font/google` requires network access to `fonts.googleapis.com` at
build time. If your build environment blocks that domain, either allow it
or switch the font imports in `src/app/layout.tsx` to `next/font/local`
with self-hosted font files.
