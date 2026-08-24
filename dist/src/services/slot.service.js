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
exports.releaseSlotHold = exports.holdSlot = exports.getAvailableSlots = void 0;
const availabilityRepository = __importStar(require("../repositories/avl.repository"));
const doctorRepository = __importStar(require("../repositories/doctor.repository"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const leaveRepository = __importStar(require("../repositories/leave.repository"));
const slotHoldRepository = __importStar(require("../repositories/slotHold.repository"));
const userRepository = __importStar(require("../repositories/user.repository"));
const getDayOfWeek = (date) => {
    const day = new Date(`${date}T00:00:00`);
    return day.getDay();
};
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};
const getAvailableSlots = async (doctorId, date, ignoreHolds = false) => {
    // 1. Check doctor
    const doctor = await doctorRepository.getDoctorById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    // 2. Convert requested date
    const appointmentDate = new Date(`${date}T00:00:00`);
    if (isNaN(appointmentDate.getTime())) {
        throw new Error("Invalid date");
    }
    // 3. Check whether doctor is on leave
    const leave = await leaveRepository.getLeaveByDoctorAndDate(doctorId, appointmentDate);
    if (leave) {
        return [];
    }
    // 4. Get day of week
    const dayOfWeek = getDayOfWeek(date);
    // 5. Get doctor's availability
    const availabilities = await availabilityRepository.getDoctorAvailability(doctorId);
    const availability = availabilities.find((item) => item.dayOfWeek === dayOfWeek);
    // Doctor doesn't work on this day
    if (!availability) {
        return [];
    }
    // 6. Generate all possible slots
    const start = timeToMinutes(availability.startTime);
    const end = timeToMinutes(availability.endTime);
    const duration = availability.slotDuration;
    const slots = [];
    let current = start;
    while (current + duration <= end) {
        slots.push({
            startTime: minutesToTime(current),
            endTime: minutesToTime(current + duration),
        });
        current += duration;
    }
    // 7. Get already BOOKED appointments
    const bookedAppointments = await appointmentRepository.getBookedAppointments(doctorId, appointmentDate);
    // 8. Get active (unexpired) holds placed by other patients mid-booking
    // 8. Get active holds only when we need to hide them
    // from normal slot availability.
    let activeHolds = [];
    if (!ignoreHolds) {
        activeHolds =
            await slotHoldRepository.getActiveHoldsForDoctorAndDate(doctorId, appointmentDate);
    }
    // 9. Remove booked slots
    const availableSlots = slots
        .filter((slot) => {
        return !bookedAppointments.some((appointment) => appointment.startTime === slot.startTime);
    })
        .map((slot) => {
        const hold = activeHolds.find((h) => h.startTime === slot.startTime);
        return {
            ...slot,
            held: Boolean(hold),
        };
    })
        .filter((slot) => !slot.held);
    return availableSlots;
};
exports.getAvailableSlots = getAvailableSlots;
// Places a short-lived (5 minute) hold on a slot so the UI can walk the
// patient through the symptom form before finalizing the booking, without
// another patient snatching the same slot in the meantime. This is a UX
// convenience layer only — the Appointment table's own unique constraint
// (doctorId, date, startTime) remains the actual source of truth against
// double-booking if two bookings somehow race past this check.
const holdSlot = async (doctorId, dateString, startTime, patientUserId) => {
    const doctor = await doctorRepository.getDoctorById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    const patient = await userRepository.getPatientProfileByUserId(patientUserId);
    if (!patient) {
        throw new Error("Patient profile not found");
    }
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    const slots = await getAvailableSlots(doctorId, dateString);
    if (!slots.some((slot) => slot.startTime === startTime)) {
        throw new Error("Selected time slot is not available");
    }
    try {
        const hold = await slotHoldRepository.acquireHold(doctorId, date, startTime, patient.id);
        return {
            holdId: hold.id,
            expiresAt: hold.expiresAt,
        };
    }
    catch (error) {
        if (error.message === "SLOT_HELD_BY_OTHER") {
            throw new Error("This slot is currently held by another patient. Please choose a different slot or try again shortly.");
        }
        throw error;
    }
};
exports.holdSlot = holdSlot;
const releaseSlotHold = async (doctorId, dateString, startTime) => {
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    await slotHoldRepository.releaseHold(doctorId, date, startTime);
    return { message: "Hold released" };
};
exports.releaseSlotHold = releaseSlotHold;
