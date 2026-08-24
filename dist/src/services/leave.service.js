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
exports.deleteLeave = exports.getMyLeaves = exports.createLeave = void 0;
const leaveRepository = __importStar(require("../repositories/leave.repository"));
const doctorRepository = __importStar(require("../repositories/doctor.repository"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const notificationService = __importStar(require("./notification.service"));
const appointmentCalendarService = __importStar(require("./appointmentCalendar.service"));
const email_service_1 = require("./email.service");
const createLeave = async (userId, dateString, reason) => {
    // Find doctor using logged-in user's ID
    const doctor = await doctorRepository.getDoctorByUserId(userId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    // Validate date
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    // Check if leave already exists
    const existingLeave = await leaveRepository.getLeaveByDoctorAndDate(doctor.id, date);
    if (existingLeave) {
        throw new Error("Leave already exists for this date");
    }
    const leave = await leaveRepository.createLeave({
        doctorId: doctor.id,
        date,
        reason,
    });
    // Find any patients already booked on this date and cancel + notify them.
    // Each patient is handled independently so one failed email/calendar call
    // never stops the others (or the leave itself) from going through.
    const affectedAppointments = await appointmentRepository.getBookedAppointmentsByDoctorAndDate(doctor.id, date);
    let notifiedCount = 0;
    for (const appointment of affectedAppointments) {
        try {
            const cancelled = await appointmentRepository.cancelAppointmentWithMeta(appointment.id, "DOCTOR", reason ? `Doctor on leave: ${reason}` : "Doctor marked unavailable for this date");
            const { subject, html } = (0, email_service_1.buildLeaveConflictEmail)(appointment.patient.user.name, doctor.user.name, appointment.date, appointment.startTime, appointment.endTime);
            await notificationService.dispatch("LEAVE_CONFLICT", appointment.patient.user.email, subject, html, appointment.id);
            await appointmentCalendarService.syncDelete({
                id: appointment.id,
                date: appointment.date,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                googlePatientEventId: cancelled.googlePatientEventId,
                googleDoctorEventId: cancelled.googleDoctorEventId,
                patient: { user: appointment.patient.user },
                doctor: { user: doctor.user },
            });
            notifiedCount += 1;
        }
        catch (error) {
            console.error(`[leave] Failed to cancel/notify for appointment ${appointment.id}:`, error);
        }
    }
    return { leave, affectedAppointments: notifiedCount };
};
exports.createLeave = createLeave;
const getMyLeaves = async (userId) => {
    const doctor = await doctorRepository.getDoctorByUserId(userId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    return await leaveRepository.getDoctorLeaves(doctor.id);
};
exports.getMyLeaves = getMyLeaves;
const deleteLeave = async (userId, leaveId) => {
    const doctor = await doctorRepository.getDoctorByUserId(userId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    const leave = await leaveRepository.getLeaveById(leaveId);
    if (!leave) {
        throw new Error("Leave not found");
    }
    // Make sure doctor owns this leave
    if (leave.doctorId !== doctor.id) {
        throw new Error("You can only delete your own leaves");
    }
    return await leaveRepository.deleteLeave(leaveId);
};
exports.deleteLeave = deleteLeave;
