import cron from "node-cron";

import * as reminderRepository from "../repositories/reminder.repository";
import * as notificationService from "../services/notification.service";
import { buildMedicationReminderEmail } from "../services/email.service";

const startReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const reminders = await reminderRepository.getPendingReminders(now);

      for (const reminder of reminders) {
        try {
          const prescription = reminder.prescription;

          const patient = prescription.consultation.appointment.patient;

          const email = patient.user.email;

          const { subject, html } = buildMedicationReminderEmail(
            prescription.medication,
            prescription.dosage,
            prescription.instructions ?? undefined
          );

          await notificationService.dispatch("MEDICATION_REMINDER", email, subject, html);

          await reminderRepository.markReminderAsSent(reminder.id);

          console.log(`Medication reminder sent to ${email}`);
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error);

          await reminderRepository.markReminderAsFailed(reminder.id);
        }
      }
    } catch (error) {
      console.error("Reminder job failed:", error);
    }
  });

  console.log("Medication reminder job started");
};

export default startReminderJob;
