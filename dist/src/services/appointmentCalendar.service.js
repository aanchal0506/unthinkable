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
exports.syncDelete = exports.syncCreate = void 0;
const googleCalendarService = __importStar(require("./googleCalendar.service"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
// Creates a calendar event on each side that has linked Google Calendar.
// Either, both, or neither may succeed — this never throws, so a booking
// always succeeds even if Google Calendar is unreachable.
const syncCreate = async (appointment) => {
    const [patientEventId, doctorEventId] = await Promise.all([
        googleCalendarService.createEvent(appointment.patient.user.id, {
            summary: `Appointment with Dr. ${appointment.doctor.user.name}`,
            description: "Healthcare Appointment Manager booking",
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
        }),
        googleCalendarService.createEvent(appointment.doctor.user.id, {
            summary: `Appointment with ${appointment.patient.user.name}`,
            description: "Healthcare Appointment Manager booking",
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
        }),
    ]);
    if (patientEventId || doctorEventId) {
        await appointmentRepository.updateGoogleEventIds(appointment.id, {
            googlePatientEventId: patientEventId,
            googleDoctorEventId: doctorEventId,
        });
    }
};
exports.syncCreate = syncCreate;
const syncDelete = async (appointment) => {
    await Promise.all([
        appointment.googlePatientEventId
            ? googleCalendarService.deleteEvent(appointment.patient.user.id, appointment.googlePatientEventId)
            : Promise.resolve(),
        appointment.googleDoctorEventId
            ? googleCalendarService.deleteEvent(appointment.doctor.user.id, appointment.googleDoctorEventId)
            : Promise.resolve(),
    ]);
};
exports.syncDelete = syncDelete;
