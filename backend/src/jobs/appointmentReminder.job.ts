import cron from "node-cron";

import * as appointmentRepository from "../repositories/appointment.repository";
import * as notificationService from "../services/notification.service";
import { buildAppointmentReminderEmail } from "../services/email.service";

// Every 15 minutes, look for BOOKED appointments happening between 23 and 25
// hours from now that haven't been reminded yet, and email the patient.
// The 2-hour window (instead of an exact 24h mark) makes the job tolerant of
// being paused/restarted without missing appointments.
const startAppointmentReminderJob = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();

      const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const appointments = await appointmentRepository.getAppointmentsNeedingReminder(
        from,
        to
      );

      for (const appointment of appointments) {
        try {
          const { subject, html } = buildAppointmentReminderEmail(
            appointment.patient.user.name,
            appointment.doctor.user.name,
            appointment.date,
            appointment.startTime,
            appointment.endTime
          );

          await notificationService.dispatch(
            "APPOINTMENT_REMINDER",
            appointment.patient.user.email,
            subject,
            html,
            appointment.id
          );

          await appointmentRepository.markReminderSent(appointment.id);
        } catch (error) {
          console.error(
            `[appointment-reminder] Failed for appointment ${appointment.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("[appointment-reminder] Job failed:", error);
    }
  });

  console.log("Appointment reminder job started");
};

export default startAppointmentReminderJob;
