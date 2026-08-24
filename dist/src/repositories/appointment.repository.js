"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointmentWithMeta = exports.updateGoogleEventIds = exports.markReminderSent = exports.getAppointmentsNeedingReminder = exports.getBookedAppointmentsByDoctorAndDate = exports.getAppointmentNotificationDetails = exports.getPatientAppointmentDetails = exports.getDoctorAppointmentDetails = exports.completeAppointment = exports.cancelAppointment = exports.rebookAppointment = exports.getAppointmentBySlot = exports.getBookedAppointments = exports.getDoctorAppointments = exports.getPatientAppointments = exports.getAppointmentById = exports.bookSlotTransactionally = exports.createAppointment = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const client_js_1 = require("../generated/prisma/client.js");
const createAppointment = async (data) => {
    return await prisma_js_1.default.appointment.create({
        data,
    });
};
exports.createAppointment = createAppointment;
// Atomically creates the appointment (or rebooks a cancelled one) and
// releases the corresponding slot hold in a single transaction, catching the
// database's own unique-constraint violation (doctorId+date+startTime) as
// the final, race-proof line of defense against double-booking — the earlier
// availability check and the slot hold are both just best-effort UX layers
// on top of this.
const bookSlotTransactionally = async (params) => {
    try {
        return await prisma_js_1.default.$transaction(async (tx) => {
            let appointment;
            if (params.existingCancelledAppointmentId) {
                appointment = await tx.appointment.update({
                    where: { id: params.existingCancelledAppointmentId },
                    data: {
                        patientId: params.patientId,
                        endTime: params.endTime,
                        status: "BOOKED",
                        cancelledBy: null,
                        cancelReason: null,
                        googlePatientEventId: null,
                        googleDoctorEventId: null,
                        reminderSentAt: null,
                    },
                });
            }
            else {
                appointment = await tx.appointment.create({
                    data: {
                        patientId: params.patientId,
                        doctorId: params.doctorId,
                        date: params.date,
                        startTime: params.startTime,
                        endTime: params.endTime,
                    },
                });
            }
            await tx.slotHold.deleteMany({
                where: {
                    doctorId: params.doctorId,
                    date: params.date,
                    startTime: params.startTime,
                },
            });
            return appointment;
        });
    }
    catch (error) {
        if (error instanceof client_js_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            throw new Error("This slot has already been booked");
        }
        throw error;
    }
};
exports.bookSlotTransactionally = bookSlotTransactionally;
const getAppointmentById = async (id) => {
    return await prisma_js_1.default.appointment.findUnique({
        where: {
            id,
        },
    });
};
exports.getAppointmentById = getAppointmentById;
const getDoctorAppointmentDetails = async (appointmentId) => {
    return await prisma_js_1.default.appointment.findUnique({
        where: {
            id: appointmentId,
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            doctor: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            symptomSubmission: true,
            consultation: {
                include: {
                    prescriptions: true,
                },
            },
        },
    });
};
exports.getDoctorAppointmentDetails = getDoctorAppointmentDetails;
const getPatientAppointments = async (patientId) => {
    return await prisma_js_1.default.appointment.findMany({
        where: {
            patientId,
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            date: "asc",
        },
    });
};
exports.getPatientAppointments = getPatientAppointments;
const getPatientAppointmentDetails = async (appointmentId, patientId) => {
    return await prisma_js_1.default.appointment.findFirst({
        where: {
            id: appointmentId,
            patientId,
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            symptomSubmission: true,
            consultation: {
                include: {
                    prescriptions: true,
                },
            },
        },
    });
};
exports.getPatientAppointmentDetails = getPatientAppointmentDetails;
const getDoctorAppointments = async (doctorId) => {
    return await prisma_js_1.default.appointment.findMany({
        where: {
            doctorId,
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            date: "asc",
        },
    });
};
exports.getDoctorAppointments = getDoctorAppointments;
const getBookedAppointments = async (doctorId, date) => {
    return await prisma_js_1.default.appointment.findMany({
        where: {
            doctorId,
            date,
            status: "BOOKED",
        },
        select: {
            startTime: true,
            endTime: true,
        },
    });
};
exports.getBookedAppointments = getBookedAppointments;
const cancelAppointment = async (id) => {
    return await prisma_js_1.default.appointment.update({
        where: {
            id,
        },
        data: {
            status: "CANCELLED",
        },
    });
};
exports.cancelAppointment = cancelAppointment;
const getAppointmentBySlot = async (doctorId, date, startTime) => {
    return await prisma_js_1.default.appointment.findUnique({
        where: {
            doctorId_date_startTime: {
                doctorId,
                date,
                startTime,
            },
        },
    });
};
exports.getAppointmentBySlot = getAppointmentBySlot;
const rebookAppointment = async (id, patientId, endTime) => {
    return await prisma_js_1.default.appointment.update({
        where: {
            id,
        },
        data: {
            patientId,
            endTime,
            status: "BOOKED",
        },
    });
};
exports.rebookAppointment = rebookAppointment;
const completeAppointment = async (id) => {
    return await prisma_js_1.default.appointment.update({
        where: {
            id,
        },
        data: {
            status: "COMPLETED",
        },
    });
};
exports.completeAppointment = completeAppointment;
const getAppointmentNotificationDetails = async (appointmentId) => {
    return await prisma_js_1.default.appointment.findUnique({
        where: {
            id: appointmentId,
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};
exports.getAppointmentNotificationDetails = getAppointmentNotificationDetails;
const getBookedAppointmentsByDoctorAndDate = async (doctorId, date) => {
    return await prisma_js_1.default.appointment.findMany({
        where: {
            doctorId,
            date,
            status: "BOOKED",
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};
exports.getBookedAppointmentsByDoctorAndDate = getBookedAppointmentsByDoctorAndDate;
// Appointments happening within [from, to) that haven't had a reminder
// email sent yet. Used by the appointment reminder cron job.
const getAppointmentsNeedingReminder = async (from, to) => {
    return await prisma_js_1.default.appointment.findMany({
        where: {
            status: "BOOKED",
            date: { gte: from, lt: to },
            reminderSentAt: null,
        },
        include: {
            patient: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            doctor: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
        },
    });
};
exports.getAppointmentsNeedingReminder = getAppointmentsNeedingReminder;
const markReminderSent = async (id) => {
    return await prisma_js_1.default.appointment.update({
        where: { id },
        data: { reminderSentAt: new Date() },
    });
};
exports.markReminderSent = markReminderSent;
const updateGoogleEventIds = async (id, data) => {
    return await prisma_js_1.default.appointment.update({
        where: { id },
        data,
    });
};
exports.updateGoogleEventIds = updateGoogleEventIds;
const cancelAppointmentWithMeta = async (id, cancelledBy, cancelReason) => {
    return await prisma_js_1.default.appointment.update({
        where: { id },
        data: {
            status: "CANCELLED",
            cancelledBy,
            cancelReason,
        },
    });
};
exports.cancelAppointmentWithMeta = cancelAppointmentWithMeta;
