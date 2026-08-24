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
const symptom_repository_1 = __importDefault(require("../repositories/symptom.repository"));
const appointmentRepository = __importStar(require("../repositories/appointment.repository"));
const llmService = __importStar(require("./llm.service"));
const generateAndStoreSummary = async (submissionId, symptoms) => {
    const result = await llmService.generatePreVisitSummary(symptoms);
    if (result.ok) {
        await symptom_repository_1.default.updateAIResult(submissionId, {
            aiSummary: `Urgency: ${result.data.urgency}. Chief complaint: ${result.data.chiefComplaint}`,
            urgency: result.data.urgency,
            chiefComplaint: result.data.chiefComplaint,
            suggestedQuestions: result.data.suggestedQuestions,
            aiStatus: "COMPLETED",
            aiError: undefined,
        });
    }
    else {
        await symptom_repository_1.default.updateAIResult(submissionId, {
            aiStatus: "FAILED",
            aiError: result.error,
        });
    }
};
const submitSymptoms = async (appointmentId, patientId, symptoms) => {
    if (!symptoms || !symptoms.trim()) {
        throw new Error("Symptoms are required");
    }
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    if (appointment.status !== "BOOKED") {
        throw new Error("Symptoms can only be submitted for a booked appointment");
    }
    const existing = await symptom_repository_1.default.getByAppointmentId(appointmentId);
    if (existing) {
        throw new Error("Symptoms have already been submitted");
    }
    const submission = await symptom_repository_1.default.createSymptomSubmission(appointmentId, symptoms.trim());
    // Best-effort: the AI pre-visit summary is generated inline (with its own
    // internal timeout) so the doctor usually has it well before the visit,
    // but if the LLM is slow/unavailable this NEVER blocks or fails the
    // patient's symptom submission — aiStatus just ends up FAILED and the
    // doctor can trigger a manual regeneration later.
    await generateAndStoreSummary(submission.id, symptoms.trim());
    return symptom_repository_1.default.getByAppointmentId(appointmentId);
};
const getSymptoms = async (appointmentId, patientId) => {
    const appointment = await appointmentRepository.getAppointmentById(appointmentId);
    if (!appointment) {
        throw new Error("Appointment not found");
    }
    if (appointment.patientId !== patientId) {
        throw new Error("You are not authorized to access this appointment");
    }
    return symptom_repository_1.default.getByAppointmentId(appointmentId);
};
// Lets a patient or doctor manually retry AI summary generation if it
// previously failed (LLM outage, timeout, etc.) without resubmitting symptoms.
const regenerateSummary = async (appointmentId) => {
    const submission = await symptom_repository_1.default.getByAppointmentId(appointmentId);
    if (!submission) {
        throw new Error("No symptom submission found for this appointment");
    }
    await generateAndStoreSummary(submission.id, submission.symptoms);
    return symptom_repository_1.default.getByAppointmentId(appointmentId);
};
exports.default = {
    submitSymptoms,
    getSymptoms,
    regenerateSummary,
};
