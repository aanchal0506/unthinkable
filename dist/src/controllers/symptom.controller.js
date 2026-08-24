"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const symptom_service_1 = __importDefault(require("../services/symptom.service"));
const submitSymptoms = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const { symptoms } = req.body;
        const patientId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        if (!symptoms || !symptoms.trim()) {
            return res.status(400).json({
                message: "Symptoms are required",
            });
        }
        const result = await symptom_service_1.default.submitSymptoms(appointmentId, patientId, symptoms);
        return res.status(201).json({
            message: "Symptoms submitted successfully",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
const getSymptoms = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const patientId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const result = await symptom_service_1.default.getSymptoms(appointmentId, patientId);
        return res.status(200).json({
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
const regenerateSummary = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const result = await symptom_service_1.default.regenerateSummary(appointmentId);
        return res.status(200).json({
            message: "AI summary regeneration attempted",
            data: result,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
exports.default = {
    submitSymptoms,
    getSymptoms,
    regenerateSummary,
};
