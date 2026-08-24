"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFailed = exports.dispatch = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const notificationRepository = __importStar(require("../repositories/notification.repository"));
const MAX_RETRY_ATTEMPTS = 5;
let transporter = null;
const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return null;
    }
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
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
const dispatch = async (type, to, subject, html, appointmentId) => {
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
    }
    catch (error) {
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
exports.dispatch = dispatch;
// Called by the notification retry cron job.
const retryFailed = async () => {
    const mailer = getTransporter();
    if (!mailer) {
        return { retried: 0, sent: 0 };
    }
    const failed = await notificationRepository.getFailedForRetry(MAX_RETRY_ATTEMPTS);
    let sent = 0;
    for (const log of failed) {
        try {
            const payload = log.payload;
            await mailer.sendMail({
                from: `"Healthcare Appointment Manager" <${process.env.EMAIL_USER}>`,
                to: log.recipient,
                subject: log.subject,
                html: payload.html || "",
            });
            await notificationRepository.markSent(log.id);
            sent += 1;
        }
        catch (error) {
            await notificationRepository.markRetryFailed(log.id, error?.message || "Unknown email error");
        }
    }
    return { retried: failed.length, sent };
};
exports.retryFailed = retryFailed;
