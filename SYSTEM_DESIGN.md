# System Design Write-up

## 1. Double-Booking Prevention

Booking a slot goes through three layers, each cheaper and less strict than
the last:

1. **Availability check** — `GET /slots/doctor/:id` computes candidate
   slots from the doctor's `DoctorAvailability` rows, then filters out
   slots that already have a `BOOKED` `Appointment` or an unexpired
   `SlotHold` for that exact `(doctorId, date, startTime)`.
2. **Slot hold** — before a patient finishes the symptom form and confirms,
   the frontend calls `POST /slots/hold`, which upserts a `SlotHold` row
   (unique on `doctorId+date+startTime`, 5-minute TTL). If another patient
   already holds that slot, the request is rejected with 409. This is a UX
   layer, not the actual guarantee — it exists so two patients don't both
   walk through the whole booking flow only to have one fail at the end.
3. **The real guarantee: a database unique constraint.** `Appointment` has
   `@@unique([doctorId, date, startTime])`. The booking write itself
   happens inside a single Prisma transaction (`bookSlotTransactionally`)
   that creates the appointment row and deletes the corresponding hold
   together. If two requests somehow race past steps 1–2 simultaneously,
   Postgres rejects the second `INSERT` with a `P2002` unique-violation
   error, which the service layer catches and turns into a clean "this slot
   has already been booked" response. This is what actually makes booking
   safe under concurrency — the availability check and the hold are both
   optimizations on top of it, not the source of truth.

## 2. Doctor Leave Conflict Handling

When a doctor calls `POST /doctors/leaves` for a date, `leave.service.ts`:
1. Creates the `DoctorLeave` row (itself guarded by a check for an existing
   leave on that date).
2. Queries all `BOOKED` appointments for that doctor on that date.
3. For **each** affected appointment, independently: marks it `CANCELLED`
   (with `cancelledBy: DOCTOR` and a reason), emails the patient
   (`LEAVE_CONFLICT` template), and deletes any Google Calendar events tied
   to it.

Each iteration is wrapped in its own `try/catch` so that one patient's
email/calendar failure can't stop the others from being processed, and
can't roll back the leave itself — the leave is the doctor's authoritative
action; notification is best-effort on top of it. The response tells the
doctor how many appointments were affected, so this isn't a silent
side-effect.

## 3. Slot Hold Mechanism

Described above (§1.2) — a `SlotHold` table with a unique constraint
mirroring `Appointment`'s, a 5-minute `expiresAt`, and a cron job
(`slotHoldCleanup.job.ts`, every 5 min) that deletes expired rows. Reads
(`getAvailableSlots`) also filter on `expiresAt > now()` directly, so an
expired-but-not-yet-swept hold never blocks a slot from showing as
available — the cleanup job is pure housekeeping, not a correctness
dependency.

## 4. Notification Failure Handling

Every outbound email goes through `notification.service.ts::dispatch()`,
never called directly from a controller. It:
1. Attempts to send via Nodemailer.
2. Persists the outcome to a `NotificationLog` row regardless of success —
   on failure, `status: FAILED` with the error message and the **fully
   rendered HTML** (so a retry doesn't need to recompute anything, e.g. by
   re-fetching appointment data that might have since changed).
3. A cron job (`notification.job.ts`, every 5 min) finds `FAILED` rows with
   `attempts < 5`, retries them, and updates status accordingly.

Because email templates are pure functions (`email.service.ts`) with no
side effects, and `dispatch()` is always called with `await` but its
result is never used to gate the surrounding operation, a total email
outage degrades to "notifications are delayed by up to 5 minutes and
retried automatically" rather than "booking/cancellation/leave fails."

The same "never block the primary action" principle applies to two other
integrations:
- **LLM summaries** (`llm.service.ts`): a 15s timeout per call, strict
  response parsing, and a result type (`{ ok, data | error }`) instead of
  thrown exceptions. On failure, `aiStatus` is set to `FAILED` and a
  `regenerate-summary` endpoint lets the doctor/patient retry manually
  without resubmitting the underlying data.
- **Google Calendar** (`googleCalendar.service.ts`): every method catches
  its own errors and returns `null`/`false` rather than throwing; a user
  who hasn't connected Calendar, or whose token has expired, simply gets
  `null` back and sync is skipped for their side only. Patient-side and
  doctor-side sync are independent `Promise.all` calls, so one side failing
  doesn't affect the other.

## 5. Consistent Failure Philosophy

All three "external dependency" integrations (email, LLM, Calendar) follow
the same shape: isolate the call, give it a timeout where relevant, log and
persist the outcome, and never let a rejection propagate into the
request/response cycle for the core domain action (booking, cancelling,
completing a consultation). This is what "LLM/notification failures must
not break the system" means in practice here — not just try/catch at the
call site, but designing the data model (`NotificationLog`, `aiStatus` on
`SymptomSubmission`/`Consultation`) so failures are visible and retriable
rather than silently swallowed.
