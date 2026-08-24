"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createConsultation = async (appointmentId, clinicalNotes, diagnosis, followUpInstructions) => {
    return prisma_js_1.default.consultation.create({
        data: {
            appointmentId,
            clinicalNotes,
            diagnosis,
            followUpInstructions,
        },
        include: {
            prescriptions: true,
        },
    });
};
const findByAppointmentId = async (appointmentId) => {
    return prisma_js_1.default.consultation.findUnique({
        where: {
            appointmentId,
        },
        include: {
            prescriptions: true,
        },
    });
};
const createPrescription = async (consultationId, data) => {
    return prisma_js_1.default.prescription.create({
        data: {
            consultationId,
            medication: data.medication,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            instructions: data.instructions,
        },
    });
};
const updateAppointmentStatus = async (appointmentId) => {
    return prisma_js_1.default.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status: "COMPLETED",
        },
    });
};
const updateAIResult = async (id, data) => {
    return prisma_js_1.default.consultation.update({
        where: { id },
        data,
    });
};
exports.default = {
    createConsultation,
    findByAppointmentId,
    createPrescription,
    updateAppointmentStatus,
    updateAIResult,
};
