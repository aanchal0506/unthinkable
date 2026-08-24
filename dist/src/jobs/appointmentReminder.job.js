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
const node_cron_1 = __importDefault(require("node-cron"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const notificationService = __importStar(require("../services/notification.service"));
const email_service_1 = require("../services/email.service");
// Every 15 minutes, look for BOOKED appointments happening between 23 and 25
// hours from now that haven't been reminded yet, and email the patient.
// The 2-hour window (instead of an exact 24h mark) makes the job tolerant of
// being paused/restarted without missing appointments.
const startAppointmentReminderJob = () => {
    node_cron_1.default.schedule("*/15 * * * *", async () => {
        try {
            const now = new Date();
            const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
            const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);
            const appointments = await appointmentRepository.getAppointmentsNeedingReminder(from, to);
            for (const appointment of appointments) {
                try {
                    const { subject, html } = (0, email_service_1.buildAppointmentReminderEmail)(appointment.patient.user.name, appointment.doctor.user.name, appointment.date, appointment.startTime, appointment.endTime);
                    await notificationService.dispatch("APPOINTMENT_REMINDER", appointment.patient.user.email, subject, html, appointment.id);
                    await appointmentRepository.markReminderSent(appointment.id);
                }
                catch (error) {
                    console.error(`[appointment-reminder] Failed for appointment ${appointment.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error("[appointment-reminder] Job failed:", error);
        }
    });
    console.log("Appointment reminder job started");
};
exports.default = startAppointmentReminderJob;
