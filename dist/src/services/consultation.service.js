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
const consultation_repository_1 = __importDefault(require("../repositories/consultation.repository"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const doctor_repository_1 = require("../repositories/doctor.repository");
const reminder_service_1 = require("./reminder.service");
const llmService = __importStar(require("./llm.service"));
const createConsultation = async (appointmentId, doctorUserId, clinicalNotes, diagnosis, followUpInstructions, prescriptions = []) => {
    if (!clinicalNotes || !clinicalNotes.trim()) {
        throw new Error("Clinical notes are required");
    }
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    // Get DoctorProfile using the logged-in User ID
    const doctor = await (0, doctor_repository_1.getDoctorByUserId)(doctorUserId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    // appointment.doctorId = DoctorProfile.id
    // doctor.id = DoctorProfile.id
    if (appointment.doctorId !== doctor.id) {
        throw new Error("You are not authorized to consult this appointment");
    }
    if (appointment.status !== "BOOKED") {
        throw new Error("Consultation can only be created for a booked appointment");
    }
    const existing = await consultation_repository_1.default.findByAppointmentId(appointmentId);
    if (existing) {
        throw new Error("Consultation already exists for this appointment");
    }
    const consultation = await consultation_repository_1.default.createConsultation(appointmentId, clinicalNotes.trim(), diagnosis?.trim(), followUpInstructions?.trim());
    // Create prescriptions + medication reminders
    for (const prescription of prescriptions) {
        if (!prescription.medication ||
            !prescription.dosage ||
            !prescription.frequency) {
            throw new Error("Medication, dosage and frequency are required for prescriptions");
        }
        const createdPrescription = await consultation_repository_1.default.createPrescription(consultation.id, prescription);
        // Generate medication reminders
        const durationDays = (0, reminder_service_1.parseDuration)(prescription.duration);
        await (0, reminder_service_1.generateReminders)(createdPrescription.id, prescription.frequency, durationDays);
    }
    await consultation_repository_1.default.updateAppointmentStatus(appointmentId);
    // Best-effort: generate the patient-friendly post-visit summary. Failures
    // (LLM timeout/outage) never break consultation creation — aiStatus just
    // ends up FAILED and the doctor/patient can trigger a manual retry.
    const llmResult = await llmService.generatePostVisitSummary(clinicalNotes.trim(), prescriptions, followUpInstructions?.trim());
    if (llmResult.ok) {
        await consultation_repository_1.default.updateAIResult(consultation.id, {
            patientSummary: llmResult.data,
            aiStatus: "COMPLETED",
        });
    }
    else {
        await consultation_repository_1.default.updateAIResult(consultation.id, {
            aiStatus: "FAILED",
            aiError: llmResult.error,
        });
    }
    return consultation_repository_1.default.findByAppointmentId(appointmentId);
};
const getConsultation = async (appointmentId, doctorUserId) => {
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    const doctor = await (0, doctor_repository_1.getDoctorByUserId)(doctorUserId);
    if (!doctor) {
        throw new Error("Doctor profile not found");
    }
    if (appointment.doctorId !== doctor.id) {
        throw new Error("You are not authorized to view this consultation");
    }
    return consultation_repository_1.default.findByAppointmentId(appointmentId);
};
// Manual retry if the post-visit LLM summary previously failed.
const regeneratePatientSummary = async (appointmentId, doctorUserId) => {
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    const doctor = await (0, doctor_repository_1.getDoctorByUserId)(doctorUserId);
    if (!doctor || appointment.doctorId !== doctor.id) {
        throw new Error("You are not authorized to modify this consultation");
    }
    const consultation = await consultation_repository_1.default.findByAppointmentId(appointmentId);
    if (!consultation) {
        throw new Error("Consultation not found");
    }
    const llmResult = await llmService.generatePostVisitSummary(consultation.clinicalNotes, consultation.prescriptions, consultation.followUpInstructions || undefined);
    if (llmResult.ok) {
        await consultation_repository_1.default.updateAIResult(consultation.id, {
            patientSummary: llmResult.data,
            aiStatus: "COMPLETED",
        });
    }
    else {
        await consultation_repository_1.default.updateAIResult(consultation.id, {
            aiStatus: "FAILED",
            aiError: llmResult.error,
        });
    }
    return consultation_repository_1.default.findByAppointmentId(appointmentId);
};
exports.default = {
    createConsultation,
    getConsultation,
    regeneratePatientSummary,
};
