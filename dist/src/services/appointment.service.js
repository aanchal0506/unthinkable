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
exports.getPatientAppointmentDetailsService = exports.getPatientAppointmentsService = exports.getDoctorAppointmentDetails = exports.completeAppointment = exports.getDoctorAppointmentsByUserId = exports.cancelAppointment = exports.getDoctorAppointments = exports.getPatientAppointments = exports.bookAppointment = void 0;
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const doctorRepository = __importStar(require("../repositories/doctor.repository"));
const userRepository = __importStar(require("../repositories/user.repository"));
const slotService = __importStar(require("./slot.service"));
const notificationService = __importStar(require("./notification.service"));
const appointmentCalendarService = __importStar(require("./appointmentCalendar.service"));
const email_service_1 = require("./email.service");
const bookAppointment = async (patientUserId, doctorId, dateString, startTime) => {
    // 1. Check if doctor exists
    const doctor = await doctorRepository.getDoctorById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    // 2. Find patient profile
    const patient = await userRepository.getPatientProfileByUserId(patientUserId);
    if (!patient) {
        throw new Error("Patient profile not found");
    }
    // 3. Validate date
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    // 4. Get available slots
    const slots = await slotService.getAvailableSlots(doctorId, dateString, true);
    // 5. Check requested slot
    const slot = slots.find((item) => item.startTime === startTime);
    if (!slot) {
        throw new Error("Selected time slot is not available");
    }
    // 6. Check existing appointment
    const existingAppointment = await appointmentRepository.getAppointmentBySlot(doctorId, date, slot.startTime);
    // Slot already booked
    if (existingAppointment &&
        existingAppointment.status === "BOOKED") {
        throw new Error("This slot has already been booked");
    }
    // 7 & 8. Atomically create (or rebook) the appointment and release the
    // slot hold. The database's unique constraint on
    // (doctorId, date, startTime) is what actually prevents two simultaneous
    // bookings from succeeding — everything before this point is a
    // best-effort UX check that can still race.
    const appointment = await appointmentRepository.bookSlotTransactionally({
        doctorId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        patientId: patient.id,
        existingCancelledAppointmentId: existingAppointment?.status === "CANCELLED"
            ? existingAppointment.id
            : undefined,
    });
    // 9. Get patient + doctor email/name details
    const appointmentDetails = await appointmentRepository.getAppointmentNotificationDetails(appointment.id);
    // 10. Send booking confirmation to both + sync Google Calendar.
    // Both are best-effort: failures are logged/retried but never bubble up
    // and break the booking response.
    if (appointmentDetails) {
        const patientEmail = (0, email_service_1.buildBookingConfirmationPatientEmail)(appointmentDetails.patient.user.name, appointmentDetails.doctor.user.name, appointmentDetails.date, appointmentDetails.startTime, appointmentDetails.endTime);
        const doctorEmail = (0, email_service_1.buildBookingConfirmationDoctorEmail)(appointmentDetails.doctor.user.name, appointmentDetails.patient.user.name, appointmentDetails.date, appointmentDetails.startTime, appointmentDetails.endTime);
        await Promise.all([
            notificationService.dispatch("BOOKING_CONFIRMATION_PATIENT", appointmentDetails.patient.user.email, patientEmail.subject, patientEmail.html, appointment.id),
            notificationService.dispatch("BOOKING_CONFIRMATION_DOCTOR", appointmentDetails.doctor.user.email, doctorEmail.subject, doctorEmail.html, appointment.id),
            appointmentCalendarService.syncCreate({
                id: appointment.id,
                date: appointmentDetails.date,
                startTime: appointmentDetails.startTime,
                endTime: appointmentDetails.endTime,
                patient: { user: appointmentDetails.patient.user },
                doctor: { user: appointmentDetails.doctor.user },
            }),
        ]);
    }
    // 11. Return appointment
    return appointment;
};
exports.bookAppointment = bookAppointment;
const getPatientAppointments = async (patientUserId) => {
    // Convert User ID → PatientProfile ID
    const patient = await userRepository.getPatientProfileByUserId(patientUserId);
    if (!patient) {
        throw new Error("Patient profile not found");
    }
    return await appointmentRepository.getPatientAppointments(patient.id);
};
exports.getPatientAppointments = getPatientAppointments;
const getDoctorAppointments = async (doctorId) => {
    return await appointmentRepository.getDoctorAppointments(doctorId);
};
exports.getDoctorAppointments = getDoctorAppointments;
const getDoctorAppointmentsByUserId = async (userId) => {
    const doctor = await doctorRepository.getDoctorByUserId(userId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    return await appointmentRepository.getDoctorAppointments(doctor.id);
};
exports.getDoctorAppointmentsByUserId = getDoctorAppointmentsByUserId;
const completeAppointment = async (appointmentId, userId) => {
    // Find appointment
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    // Find logged-in doctor's profile
    const doctor = await doctorRepository.getDoctorByUserId(userId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    // Make sure this appointment belongs to this doctor
    if (appointment.doctorId !== doctor.id) {
        throw new Error("You can only complete your own appointments");
    }
    // Only BOOKED appointments can be completed
    if (appointment.status !== "BOOKED") {
        throw new Error("Only booked appointments can be completed");
    }
    return await appointmentRepository.completeAppointment(appointmentId);
};
exports.completeAppointment = completeAppointment;
const cancelAppointment = async (appointmentId, userId, role, reason) => {
    // 1. Find appointment
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    // 2. Check if already cancelled
    if (appointment.status === "CANCELLED") {
        throw new Error("Appointment already cancelled");
    }
    // 3. Patient can cancel only their own appointment
    if (role === "PATIENT") {
        const patient = await userRepository.getPatientProfileByUserId(userId);
        if (!patient ||
            appointment.patientId !== patient.id) {
            throw new Error("You can only cancel your own appointments");
        }
    }
    // 4. Doctor can cancel only their own appointment
    if (role === "DOCTOR") {
        const doctor = await doctorRepository.getDoctorByUserId(userId);
        if (!doctor ||
            appointment.doctorId !== doctor.id) {
            throw new Error("You can only cancel your own appointments");
        }
    }
    // 5. Admin can cancel any appointment
    const details = await appointmentRepository.getAppointmentNotificationDetails(appointmentId);
    const cancelled = await appointmentRepository.cancelAppointmentWithMeta(appointmentId, role, reason);
    // 6. Notify the other party + tear down Google Calendar events.
    // Best-effort: never allowed to fail the cancellation itself.
    if (details) {
        const cancelledByPatient = role === "PATIENT";
        const recipientEmail = cancelledByPatient
            ? details.doctor.user.email
            : details.patient.user.email;
        const recipientName = cancelledByPatient
            ? details.doctor.user.name
            : details.patient.user.name;
        const otherPartyName = cancelledByPatient
            ? details.patient.user.name
            : details.doctor.user.name;
        const { subject, html } = (0, email_service_1.buildCancellationEmail)(recipientName, otherPartyName, details.date, details.startTime, details.endTime, reason);
        await Promise.all([
            notificationService.dispatch("APPOINTMENT_CANCELLATION", recipientEmail, subject, html, appointmentId),
            appointmentCalendarService.syncDelete({
                id: appointmentId,
                date: details.date,
                startTime: details.startTime,
                endTime: details.endTime,
                googlePatientEventId: appointment.googlePatientEventId,
                googleDoctorEventId: appointment.googleDoctorEventId,
                patient: { user: details.patient.user },
                doctor: { user: details.doctor.user },
            }),
        ]);
    }
    return cancelled;
};
exports.cancelAppointment = cancelAppointment;
const getDoctorAppointmentDetails = async (appointmentId, doctorUserId) => {
    const appointment = await appointmentRepository.getDoctorAppointmentDetails(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    // appointment.doctorId is DoctorProfile.id
    // doctorUserId is User.id from JWT
    if (appointment.doctor.userId !== doctorUserId) {
        throw new Error("You are not authorized to view this appointment");
    }
    return appointment;
};
exports.getDoctorAppointmentDetails = getDoctorAppointmentDetails;
const getPatientAppointmentsService = async (patientUserId) => {
    const patient = await userRepository.getPatientProfileByUserId(patientUserId);
    if (!patient) {
        throw new Error("Patient profile not found");
    }
    return await appointmentRepository.getPatientAppointments(patient.id);
};
exports.getPatientAppointmentsService = getPatientAppointmentsService;
const getPatientAppointmentDetailsService = async (appointmentId, patientUserId) => {
    const patient = await userRepository.getPatientProfileByUserId(patientUserId);
    if (!patient) {
        throw new Error("Patient profile not found");
    }
    const appointment = await appointmentRepository.getPatientAppointmentDetails(appointmentId, patient.id);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    return appointment;
};
exports.getPatientAppointmentDetailsService = getPatientAppointmentDetailsService;
