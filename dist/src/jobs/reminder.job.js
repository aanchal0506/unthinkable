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
const reminderRepository = __importStar(require("../repositories/reminder.repository"));
const notificationService = __importStar(require("../services/notification.service"));
const email_service_1 = require("../services/email.service");
const startReminderJob = () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const reminders = await reminderRepository.getPendingReminders(now);
            for (const reminder of reminders) {
                try {
                    const prescription = reminder.prescription;
                    const patient = prescription.consultation.appointment.patient;
                    const email = patient.user.email;
                    const { subject, html } = (0, email_service_1.buildMedicationReminderEmail)(prescription.medication, prescription.dosage, prescription.instructions ?? undefined);
                    await notificationService.dispatch("MEDICATION_REMINDER", email, subject, html);
                    await reminderRepository.markReminderAsSent(reminder.id);
                    console.log(`Medication reminder sent to ${email}`);
                }
                catch (error) {
                    console.error(`Failed to send reminder ${reminder.id}:`, error);
                    await reminderRepository.markReminderAsFailed(reminder.id);
                }
            }
        }
        catch (error) {
            console.error("Reminder job failed:", error);
        }
    });
    console.log("Medication reminder job started");
};
exports.default = startReminderJob;
