import prisma from "../config/prisma";
import type { NotificationType } from "../generated/prisma/client";

const createLog = async (data: {
  type: NotificationType;
  recipient: string;
  subject: string;
  html: string;
  appointmentId?: number;
  status: "SENT" | "FAILED";
  lastError?: string;
}) => {
  return prisma.notificationLog.create({
    data: {
      type: data.type,
      recipient: data.recipient,
      subject: data.subject,
      payload: { html: data.html },
      appointmentId: data.appointmentId,
      status: data.status,
      attempts: 1,
      lastError: data.lastError,
    },
  });
};

const getFailedForRetry = async (maxAttempts: number) => {
  return prisma.notificationLog.findMany({
    where: {
      status: "FAILED",
      attempts: { lt: maxAttempts },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
};

const markSent = async (id: number) => {
  return prisma.notificationLog.update({
    where: { id },
    data: { status: "SENT" },
  });
};

const markRetryFailed = async (id: number, error: string) => {
  return prisma.notificationLog.update({
    where: { id },
    data: {
      attempts: { increment: 1 },
      lastError: error,
    },
  });
};

export { createLog, getFailedForRetry, markSent, markRetryFailed };
