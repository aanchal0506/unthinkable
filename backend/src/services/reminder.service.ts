import * as reminderRepository from "../repositories/reminder.repository";

const getTimesForFrequency = (frequency: string) => {
  const normalized = frequency.toLowerCase().trim();

  if (
    normalized.includes("4") ||
    normalized.includes("four")
  ) {
    return ["08:00", "12:00", "16:00", "20:00"];
  }

  if (
    normalized.includes("3") ||
    normalized.includes("three")
  ) {
    return ["08:00", "14:00", "20:00"];
  }

  if (
    normalized.includes("2") ||
    normalized.includes("twice")
  ) {
    return ["08:00", "20:00"];
  }

  return ["08:00"];
};

const createReminder = async (
  prescriptionId: number,
  scheduledAt: Date
) => {
  return await reminderRepository.createReminder({
    prescriptionId,
    scheduledAt,
  });
};

const parseDuration = (duration?: string) => {
  if (!duration) {
    return 1;
  }

  const match = duration.match(/\d+/);

  if (!match) {
    return 1;
  }

  return Number(match[0]);
};

const generateReminders = async (
  prescriptionId: number,
  frequency: string,
  durationDays: number
) => {
  const times = getTimesForFrequency(frequency);

  const reminders = [];

  const today = new Date();

  for (let day = 0; day < durationDays; day++) {
    for (const time of times) {
      const [hour, minute] = time.split(":").map(Number);

      const scheduledAt = new Date(today);

      scheduledAt.setDate(
        today.getDate() + day
      );

      scheduledAt.setHours(hour, minute, 0, 0);

      const reminder = await createReminder(
        prescriptionId,
        scheduledAt
      );

      reminders.push(reminder);
    }
  }

  return reminders;
};

const getRemindersByPrescription = async (
  prescriptionId: number
) => {
  return await reminderRepository.getRemindersByPrescription(
    prescriptionId
  );
};

export {
  createReminder,
  generateReminders,
  getRemindersByPrescription,
  parseDuration
};