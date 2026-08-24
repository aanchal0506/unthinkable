# Healthcare Appointment & Follow-up Manager — Backend

Node.js + TypeScript + Express + PostgreSQL (Prisma) backend for the clinic
appointment platform: patient/doctor/admin auth, slot booking with
race-safe double-booking prevention, AI pre-visit and post-visit summaries
(Anthropic), Google Calendar sync, and email notifications with a retry
queue.

## 1. Tech Stack

- **Runtime:** Node.js + TypeScript, Express 5
- **Database:** PostgreSQL via Prisma ORM 7
- **Auth:** JWT (role-based: `PATIENT` / `DOCTOR` / `ADMIN`)
- **AI:** Anthropic API (`@anthropic-ai/sdk`)
- **Calendar:** Google Calendar API (OAuth 2.0, `googleapis`)
- **Email:** Nodemailer (Gmail/SMTP)
- **Jobs:** `node-cron` (medication reminders, appointment reminders,
  notification retries, slot-hold cleanup)
- **Security:** Helmet, CORS, rate limiting, Zod input validation

## 2. Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── migrations/            # SQL migrations
├── src/
│   ├── config/                 # env validation, prisma client, google oauth client
│   ├── controllers/            # request/response handling
│   ├── services/                # business logic (LLM, calendar, notifications, booking...)
│   ├── repositories/            # Prisma queries only
│   ├── routes/                  # Express routers
│   ├── middleware/              # auth, role, validation, rate limit, error handler
│   ├── jobs/                    # cron jobs
│   ├── validators/              # Zod schemas
│   └── utils/                   # crypto helpers
├── server.ts                    # app entrypoint
└── .env.example
```

## 3. Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local, Docker, Supabase, Neon, Railway, etc.)

### Steps

```bash
cd backend
cp .env.example .env      # fill in the values (see section 6 & 7 below)
npm install                # also runs `prisma generate` via postinstall
npx prisma migrate deploy  # applies all migrations to your database
npm run dev                 # starts the API on http://localhost:5000 with hot reload
```

Production build:

```bash
npm run build      # tsc -> dist/
npm start           # node dist/server.js
```

Health check: `GET /health`

## 4. Database Schema (overview)

| Model | Purpose |
|---|---|
| `User` | Login credentials + role. Also stores encrypted Google Calendar OAuth tokens. |
| `PatientProfile` / `DoctorProfile` | Role-specific profile linked 1:1 to `User`. |
| `DoctorAvailability` | Per-doctor working hours + slot duration per weekday. |
| `DoctorLeave` | Dates a doctor is unavailable. |
| `Appointment` | The booking itself. Unique on `(doctorId, date, startTime)` — this is what actually prevents double-booking at the database level. Also stores Google Calendar event ids and cancellation metadata. |
| `SlotHold` | Short-lived (5 min) hold placed while a patient is mid-booking-flow, unique on `(doctorId, date, startTime)`. |
| `SymptomSubmission` | Patient's pre-visit symptoms + AI-generated urgency/chief complaint/questions. |
| `Consultation` | Doctor's clinical notes + AI-generated patient-friendly summary. |
| `Prescription` / `MedicationReminder` | Prescribed medication and its scheduled reminders. |
| `NotificationLog` | Every outbound email attempt, with status, for the retry job. |

Run `npx prisma studio` to browse the data visually.

## 5. API Reference

All authenticated routes expect `Authorization: Bearer <JWT>`.

### Auth
| Method | Path | Body | Role |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role? }` | Public |
| POST | `/api/auth/login` | `{ email, password }` | Public |

### Doctors
| Method | Path | Role |
|---|---|---|
| GET | `/api/doctors?specialization=` | Public |
| GET | `/api/doctors/:id` | Public |
| POST | `/api/doctors` | Admin |
| PUT | `/api/doctors/:id` | Admin |
| DELETE | `/api/doctors/:id` | Admin |

### Availability & Leave (Admin sets working hours, doctor manages leave)
| Method | Path | Role |
|---|---|---|
| GET | `/api/availability/doctor/:doctorId` | Public |
| POST/PUT/DELETE | `/api/availability/...` | Admin |
| POST | `/api/doctors/leaves` `{ date, reason? }` | Doctor — auto-cancels & notifies any already-booked patients on that date |
| GET | `/api/doctors/leaves/my` | Doctor |
| DELETE | `/api/doctors/leaves/:id` | Doctor |

### Slots & Booking
| Method | Path | Body | Role |
|---|---|---|---|
| GET | `/api/slots/doctor/:doctorId?date=YYYY-MM-DD` | – | Public |
| POST | `/api/slots/hold` | `{ doctorId, date, startTime }` | Patient — places a 5-min hold |
| POST | `/api/slots/release` | `{ doctorId, date, startTime }` | Patient |
| POST | `/api/appointments` | `{ doctorId, date, startTime }` | Patient — books, sends emails, syncs Calendar |
| GET | `/api/appointments/my` / `/api/appointments/patient/appointments` | – | Patient |
| GET | `/api/appointments/patient/appointments/:appointmentId` | – | Patient |
| GET | `/api/appointments/doctor/my` | – | Doctor |
| GET | `/api/appointments/doctor/appointments/:appointmentId` | – | Doctor |
| PATCH | `/api/appointments/:id/complete` | – | Doctor |
| DELETE | `/api/appointments/:id` | `{ reason? }` | Patient/Doctor/Admin |

### Symptoms (pre-visit AI summary)
| Method | Path | Body | Role |
|---|---|---|---|
| POST | `/api/appointments/:appointmentId/symptoms` | `{ symptoms }` | Patient |
| GET | `/api/appointments/:appointmentId/symptoms` | – | Patient |
| POST | `/api/appointments/:appointmentId/symptoms/regenerate-summary` | – | Patient/Doctor — retry if AI generation failed |

### Consultation (post-visit AI summary + prescriptions)
| Method | Path | Body | Role |
|---|---|---|---|
| POST | `/api/appointments/:appointmentId/consultation` | `{ clinicalNotes, diagnosis?, followUpInstructions?, prescriptions[] }` | Doctor |
| GET | `/api/appointments/:appointmentId/consultation` | – | Doctor |
| POST | `/api/appointments/:appointmentId/consultation/regenerate-summary` | – | Doctor — retry if AI generation failed |

### Reminders
| Method | Path | Role |
|---|---|---|
| GET | `/api/reminders/prescription/:prescriptionId` | Patient |

### Google Calendar
| Method | Path | Role |
|---|---|---|
| GET | `/api/google/connect` | Any authenticated user — returns `{ url }` to redirect the browser to |
| GET | `/api/google/callback` | Google redirects here automatically |
| DELETE | `/api/google/disconnect` | Any authenticated user |

## 6. LLM Prompts

Both live in `src/services/llm.service.ts` and call the Anthropic Messages
API (`claude-sonnet-4-5` by default, configurable via `ANTHROPIC_MODEL`).

**Pre-visit summary** (on symptom submission):
> Analyse these symptoms and return: urgency level (Low / Medium / High),
> chief complaint, and three suggested questions for the doctor. Symptoms:
> `<symptoms>`
>
> (Instructed to respond as strict JSON so the result is parsed and stored
> as structured `urgency` / `chiefComplaint` / `suggestedQuestions` fields.)

**Post-visit summary** (on consultation submission):
> Convert these clinical notes into a patient-friendly summary with
> medication schedule and follow-up steps: `<notes + prescriptions +
> follow-up instructions>`

**Failure handling:** every LLM call has a 15s timeout and is wrapped so it
can never throw into the request path. On failure, `aiStatus` is set to
`FAILED` with `aiError` recorded, the surrounding request (symptom
submission / consultation creation) still succeeds, and the doctor/patient
can hit the `regenerate-summary` endpoint to retry.

## 7. Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create
   (or select) a project.
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **APIs & Services → OAuth consent screen** → configure it (External is
   fine for testing; add your test users' emails while the app is
   unpublished).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type: **Web application**.
   - Authorized redirect URI: `http://localhost:5000/api/google/callback`
     (or your deployed backend URL + `/api/google/callback`).
5. Copy the generated **Client ID** and **Client Secret** into `.env` as
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and set
   `GOOGLE_REDIRECT_URI` to the exact URI you registered.
6. In the app, an authenticated patient or doctor calls
   `GET /api/google/connect`, opens the returned `url`, signs in, and grants
   calendar access. Google redirects back to
   `/api/google/callback`, which stores an **encrypted** refresh token on
   that user and redirects the browser to
   `${FRONTEND_URL}/settings?googleCalendar=connected`.
7. From then on, every booked/cancelled appointment automatically
   creates/deletes an event on that user's **primary** calendar. If a user
   hasn't connected Google Calendar, sync is silently skipped for their
   side only — it never blocks booking.

## 8. Email Setup

Any Nodemailer-supported provider works; the default is Gmail:

1. Enable 2-Step Verification on the sending Gmail account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set `EMAIL_USER` to the Gmail address and `EMAIL_PASSWORD` to the App
   Password (not your regular password).

To use a different provider (SendGrid, Mailgun, SES, etc.), swap the
`nodemailer.createTransport(...)` config in
`src/services/notification.service.ts`.

## 9. Background Jobs

| Job | Schedule | Purpose |
|---|---|---|
| `reminder.job.ts` | every minute | Sends due medication reminders |
| `appointmentReminder.job.ts` | every 15 min | Emails patients ~24h before their appointment |
| `notification.job.ts` | every 5 min | Retries any `FAILED` `NotificationLog` row (up to 5 attempts) |
| `slotHoldCleanup.job.ts` | every 5 min | Deletes expired `SlotHold` rows |

## 10. Notes on this build

- `src/generated/prisma` is gitignored and **must** be regenerated locally
  via `npx prisma generate` (this runs automatically via `postinstall`
  after `npm install`).
- The migration in
  `prisma/migrations/20260822170000_add_calendar_notifications_holds/` was
  authored by hand against the schema (this sandbox had no network access
  to Prisma's engine binary host to run `prisma migrate dev` itself) —
  double check it against your Postgres version with `prisma migrate diff`
  if you have any doubts, then apply with `npx prisma migrate deploy`.
- See `SYSTEM_DESIGN.md` for the write-up on double-booking prevention,
  leave conflict handling, the slot-hold mechanism, and notification
  failure handling.
