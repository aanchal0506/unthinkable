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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDuration = exports.getRemindersByPrescription = exports.generateReminders = exports.createReminder = void 0;
const reminderRepository = __importStar(require("../repositories/reminder.repository"));
const getTimesForFrequency = (frequency) => {
    const normalized = frequency.toLowerCase().trim();
    if (normalized.includes("4") ||
        normalized.includes("four")) {
        return ["08:00", "12:00", "16:00", "20:00"];
    }
    if (normalized.includes("3") ||
        normalized.includes("three")) {
        return ["08:00", "14:00", "20:00"];
    }
    if (normalized.includes("2") ||
        normalized.includes("twice")) {
        return ["08:00", "20:00"];
    }
    return ["08:00"];
};
const createReminder = async (prescriptionId, scheduledAt) => {
    return await reminderRepository.createReminder({
        prescriptionId,
        scheduledAt,
    });
};
exports.createReminder = createReminder;
const parseDuration = (duration) => {
    if (!duration) {
        return 1;
    }
    const match = duration.match(/\d+/);
    if (!match) {
        return 1;
    }
    return Number(match[0]);
};
exports.parseDuration = parseDuration;
const generateReminders = async (prescriptionId, frequency, durationDays) => {
    const times = getTimesForFrequency(frequency);
    const reminders = [];
    const today = new Date();
    for (let day = 0; day < durationDays; day++) {
        for (const time of times) {
            const [hour, minute] = time.split(":").map(Number);
            const scheduledAt = new Date(today);
            scheduledAt.setDate(today.getDate() + day);
            scheduledAt.setHours(hour, minute, 0, 0);
            const reminder = await createReminder(prescriptionId, scheduledAt);
            reminders.push(reminder);
        }
    }
    return reminders;
};
exports.generateReminders = generateReminders;
const getRemindersByPrescription = async (prescriptionId) => {
    return await reminderRepository.getRemindersByPrescription(prescriptionId);
};
exports.getRemindersByPrescription = getRemindersByPrescription;
