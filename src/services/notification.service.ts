import nodemailer from "nodemailer";

import * as notificationRepository from "../repositories/notification.repository";
import type { NotificationType } from "../generated/prisma/client";

const MAX_RETRY_ATTEMPTS = 5;

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return transporter;
};

// Sends (or, if the email provider isn't configured / is down, records a
// FAILED NotificationLog for the retry job to pick up later). Callers should
// NOT await this for correctness of the main flow — booking/cancelling an
// appointment must succeed even if notifications are degraded.
const dispatch = async (
  type: NotificationType,
  to: string,
  subject: string,
  html: string,
  appointmentId?: number
): Promise<void> => {
  const mailer = getTransporter();

  if (!mailer) {
    await notificationRepository.createLog({
      type,
      recipient: to,
      subject,
      html,
      appointmentId,
      status: "FAILED",
      lastError: "Email transport not configured (EMAIL_USER/EMAIL_PASSWORD missing)",
    });

    return;
  }

  try {
    await mailer.sendMail({
      from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    await notificationRepository.createLog({
      type,
      recipient: to,
      subject,
      html,
      appointmentId,
      status: "SENT",
    });
  } catch (error: any) {
    console.error(`[notification] Failed to send "${subject}" to ${to}:`, error?.message || error);

    await notificationRepository.createLog({
      type,
      recipient: to,
      subject,
      html,
      appointmentId,
      status: "FAILED",
      lastError: error?.message || "Unknown email error",
    });
  }
};

// Called by the notification retry cron job.
const retryFailed = async (): Promise<{ retried: number; sent: number }> => {
  const mailer = getTransporter();

  if (!mailer) {
    return { retried: 0, sent: 0 };
  }

  const failed = await notificationRepository.getFailedForRetry(MAX_RETRY_ATTEMPTS);

  let sent = 0;

  for (const log of failed) {
    try {
      const payload = log.payload as { html?: string };

      await mailer.sendMail({
        from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
        to: log.recipient,
        subject: log.subject,
        html: payload.html || "",
      });

      await notificationRepository.markSent(log.id);
      sent += 1;
    } catch (error: any) {
      await notificationRepository.markRetryFailed(log.id, error?.message || "Unknown email error");
    }
  }

  return { retried: failed.length, sent };
};

export { dispatch, retryFailed };
