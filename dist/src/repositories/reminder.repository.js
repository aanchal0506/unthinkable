"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markReminderAsFailed = exports.markReminderAsSent = exports.getPendingReminders = exports.getRemindersByPrescription = exports.getReminderById = exports.createReminder = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createReminder = async (data) => {
    return await prisma_js_1.default.medicationReminder.create({
        data: {
            prescriptionId: data.prescriptionId,
            scheduledAt: data.scheduledAt,
        },
    });
};
exports.createReminder = createReminder;
const getReminderById = async (id) => {
    return await prisma_js_1.default.medicationReminder.findUnique({
        where: {
            id,
        },
        include: {
            prescription: true,
        },
    });
};
exports.getReminderById = getReminderById;
const getRemindersByPrescription = async (prescriptionId) => {
    return await prisma_js_1.default.medicationReminder.findMany({
        where: {
            prescriptionId,
        },
        orderBy: {
            scheduledAt: "asc",
        },
    });
};
exports.getRemindersByPrescription = getRemindersByPrescription;
const getPendingReminders = async (before) => {
    return await prisma_js_1.default.medicationReminder.findMany({
        where: {
            status: "PENDING",
            scheduledAt: {
                lte: before,
            },
        },
        include: {
            prescription: {
                include: {
                    consultation: {
                        include: {
                            appointment: {
                                include: {
                                    patient: {
                                        include: {
                                            user: {
                                                select: {
                                                    email: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            scheduledAt: "asc",
        },
    });
};
exports.getPendingReminders = getPendingReminders;
const markReminderAsSent = async (id) => {
    return await prisma_js_1.default.medicationReminder.update({
        where: {
            id,
        },
        data: {
            status: "SENT",
            sentAt: new Date(),
        },
    });
};
exports.markReminderAsSent = markReminderAsSent;
const markReminderAsFailed = async (id) => {
    return await prisma_js_1.default.medicationReminder.update({
        where: {
            id,
        },
        data: {
            status: "FAILED",
        },
    });
};
exports.markReminderAsFailed = markReminderAsFailed;
