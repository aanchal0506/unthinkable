"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consultation_service_1 = __importDefault(require("../services/consultation.service"));
const createConsultation = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const { clinicalNotes, diagnosis, followUpInstructions, prescriptions, } = req.body;
        const doctorUserId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const consultation = await consultation_service_1.default.createConsultation(appointmentId, doctorUserId, clinicalNotes, diagnosis, followUpInstructions, prescriptions);
        return res.status(201).json({
            message: "Consultation created successfully",
            consultation,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
const getConsultation = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const doctorUserId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const consultation = await consultation_service_1.default.getConsultation(appointmentId, doctorUserId);
        if (!consultation) {
            return res.status(404).json({
                message: "Consultation not found",
            });
        }
        return res.status(200).json({
            consultation,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
const regeneratePatientSummary = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const doctorUserId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const consultation = await consultation_service_1.default.regeneratePatientSummary(appointmentId, doctorUserId);
        return res.status(200).json({
            message: "Patient summary regeneration attempted",
            consultation,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
exports.default = {
    createConsultation,
    getConsultation,
    regeneratePatientSummary,
};
