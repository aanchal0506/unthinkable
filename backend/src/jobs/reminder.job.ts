import cron from "node-cron";

import * as reminderRepository from "../repositories/reminder.repository";

import {
  sendMedicationReminder,
} from "../services/email.service";

const startReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const reminders =
        await reminderRepository.getPendingReminders(
          now
        );

      for (const reminder of reminders) {
        try {
          const prescription =
            reminder.prescription;

          const patient =
            prescription.consultation
              .appointment
              .patient;

          const email =
            patient.user.email;

          await sendMedicationReminder(
            email,
            prescription.medication,
            prescription.dosage,
            prescription.instructions?
          );

          await reminderRepository.markReminderAsSent(
            reminder.id
          );

          console.log(
            `Medication reminder sent to ${email}`
          );
        } catch (error) {
          console.error(
            `Failed to send reminder ${reminder.id}:`,
            error
          );

          await reminderRepository.markReminderAsFailed(
            reminder.id
          );
        }
      }
    } catch (error) {
      console.error(
        "Reminder job failed:",
        error
      );
    }
  });

  console.log(
    "Medication reminder job started"
  );
};

export default startReminderJob;