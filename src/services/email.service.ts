// Pure email TEMPLATE builders. Nothing in this file sends mail or touches
// the database — see notification.service.ts for the transport + retry
// logic. Keeping templates separate means the same rendered HTML can be
// persisted and safely re-sent by the retry job without recomputing it.

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <h2 style="margin-bottom: 4px;">${title}</h2>
    ${bodyHtml}
    <hr style="margin-top: 24px; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="color: #6b7280; font-size: 13px;">Healthcare Appointment &amp; Follow-up Manager</p>
  </div>
`;

const buildBookingConfirmationPatientEmail = (
  patientName: string,
  doctorName: string,
  date: Date,
  startTime: string,
  endTime: string
) => ({
  subject: "Appointment Confirmed",
  html: wrapper(
    "✅ Appointment Confirmed",
    `
      <p>Hi ${patientName},</p>
      <p>Your appointment with <strong>Dr. ${doctorName}</strong> is confirmed.</p>
      <p>
        <strong>Date:</strong> ${formatDate(date)}<br/>
        <strong>Time:</strong> ${startTime} - ${endTime}
      </p>
      <p>Please fill out the pre-visit symptom form before your appointment so your doctor can prepare.</p>
    `
  ),
});

const buildBookingConfirmationDoctorEmail = (
  doctorName: string,
  patientName: string,
  date: Date,
  startTime: string,
  endTime: string
) => ({
  subject: "New Appointment Booked",
  html: wrapper(
    "📅 New Appointment Booked",
    `
      <p>Hi Dr. ${doctorName},</p>
      <p>A new appointment has been booked with <strong>${patientName}</strong>.</p>
      <p>
        <strong>Date:</strong> ${formatDate(date)}<br/>
        <strong>Time:</strong> ${startTime} - ${endTime}
      </p>
    `
  ),
});

const buildCancellationEmail = (
  recipientName: string,
  otherPartyName: string,
  date: Date,
  startTime: string,
  endTime: string,
  reason?: string
) => ({
  subject: "Appointment Cancelled",
  html: wrapper(
    "❌ Appointment Cancelled",
    `
      <p>Hi ${recipientName},</p>
      <p>Your appointment with <strong>${otherPartyName}</strong> scheduled for:</p>
      <p>
        <strong>Date:</strong> ${formatDate(date)}<br/>
        <strong>Time:</strong> ${startTime} - ${endTime}
      </p>
      <p>has been cancelled${reason ? `. Reason: <em>${reason}</em>` : "."}</p>
    `
  ),
});

const buildLeaveConflictEmail = (
  patientName: string,
  doctorName: string,
  date: Date,
  startTime: string,
  endTime: string
) => ({
  subject: "Your Appointment Has Been Cancelled (Doctor Unavailable)",
  html: wrapper(
    "⚠️ Appointment Cancelled — Doctor Unavailable",
    `
      <p>Hi ${patientName},</p>
      <p>
        Unfortunately Dr. ${doctorName} has marked
        <strong>${formatDate(date)}</strong> as a leave day, and your
        appointment slot (${startTime} - ${endTime}) on that date has been
        cancelled as a result.
      </p>
      <p>We're sorry for the inconvenience — please book a new slot at your convenience.</p>
    `
  ),
});

const buildAppointmentReminderEmail = (
  patientName: string,
  doctorName: string,
  date: Date,
  startTime: string,
  endTime: string
) => ({
  subject: "Appointment Reminder",
  html: wrapper(
    "⏰ Appointment Reminder",
    `
      <p>Hi ${patientName},</p>
      <p>This is a reminder of your upcoming appointment with <strong>Dr. ${doctorName}</strong>.</p>
      <p>
        <strong>Date:</strong> ${formatDate(date)}<br/>
        <strong>Time:</strong> ${startTime} - ${endTime}
      </p>
      <p>If you haven't already, please submit your symptoms ahead of the visit.</p>
    `
  ),
});

const buildMedicationReminderEmail = (
  medication: string,
  dosage: string,
  instructions?: string
) => ({
  subject: `Medication Reminder - ${medication}`,
  html: wrapper(
    "💊 Medication Reminder",
    `
      <p>It's time to take your medication.</p>
      <p><strong>Medication:</strong> ${medication}</p>
      <p><strong>Dosage:</strong> ${dosage}</p>
      ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ""}
      <p>Please follow the medication instructions provided by your doctor.</p>
    `
  ),
});

export {
  buildBookingConfirmationPatientEmail,
  buildBookingConfirmationDoctorEmail,
  buildCancellationEmail,
  buildLeaveConflictEmail,
  buildAppointmentReminderEmail,
  buildMedicationReminderEmail,
};
