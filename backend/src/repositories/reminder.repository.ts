import prisma from "../config/prisma";

const createReminder = async (data: {
  prescriptionId: number;
  scheduledAt: Date;
}) => {
  return await prisma.medicationReminder.create({
    data: {
      prescriptionId: data.prescriptionId,
      scheduledAt: data.scheduledAt,
    },
  });
};

const getReminderById = async (id: number) => {
  return await prisma.medicationReminder.findUnique({
    where: {
      id,
    },
    include: {
      prescription: true,
    },
  });
};

const getRemindersByPrescription = async (
  prescriptionId: number
) => {
  return await prisma.medicationReminder.findMany({
    where: {
      prescriptionId,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

const getPendingReminders = async (before: Date) => {
  return await prisma.medicationReminder.findMany({
    where: {
      status: "PENDING",
      scheduledAt: {
        lte: before,
      },
    },
    include: {
      prescription: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

const markReminderAsSent = async (id: number) => {
  return await prisma.medicationReminder.update({
    where: {
      id,
    },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });
};

const markReminderAsFailed = async (id: number) => {
  return await prisma.medicationReminder.update({
    where: {
      id,
    },
    data: {
      status: "FAILED",
    },
  });
};

export {
  createReminder,
  getReminderById,
  getRemindersByPrescription,
  getPendingReminders,
  markReminderAsSent,
  markReminderAsFailed,
};