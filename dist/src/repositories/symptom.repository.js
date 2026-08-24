"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createSymptomSubmission = async (appointmentId, symptoms) => {
    return prisma_js_1.default.symptomSubmission.create({
        data: {
            appointmentId,
            symptoms,
        },
    });
};
const getByAppointmentId = async (appointmentId) => {
    return prisma_js_1.default.symptomSubmission.findUnique({
        where: {
            appointmentId,
        },
    });
};
const updateAIResult = async (id, data) => {
    return prisma_js_1.default.symptomSubmission.update({
        where: {
            id,
        },
        data,
    });
};
exports.default = {
    createSymptomSubmission,
    getByAppointmentId,
    updateAIResult,
};
