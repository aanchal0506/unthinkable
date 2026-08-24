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
exports.getPatientAppointmentDetails = exports.getPatientAppointments = exports.getDoctorAppointmentDetails = exports.completeAppointment = exports.getMyDoctorAppointments = exports.cancelAppointment = exports.getMyAppointments = exports.bookAppointment = void 0;
const appointmentService = __importStar(require("../services/appointment.service"));
// Book appointment
const bookAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "PATIENT") {
            return res.status(403).json({
                message: "Only patients can book appointments",
            });
        }
        const { doctorId, date, startTime } = req.body;
        if (!doctorId || !date || !startTime) {
            return res.status(400).json({
                message: "doctorId, date and startTime are required",
            });
        }
        const appointment = await appointmentService.bookAppointment(req.user.id, Number(doctorId), date, startTime);
        return res.status(201).json({
            message: "Appointment booked successfully",
            appointment,
        });
    }
    catch (error) {
        console.error("Book appointment error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        if (error.message === "Patient profile not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        if (error.message === "Invalid date") {
            return res.status(400).json({
                message: error.message,
            });
        }
        if (error.message ===
            "Selected time slot is not available") {
            return res.status(409).json({
                message: error.message,
            });
        }
        if (error.message ===
            "This slot has already been booked") {
            return res.status(409).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to book appointment",
        });
    }
};
exports.bookAppointment = bookAppointment;
// Get logged-in patient's appointments
const getMyAppointments = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "PATIENT") {
            return res.status(403).json({
                message: "Only patients can access this",
            });
        }
        const appointments = await appointmentService.getPatientAppointments(req.user.id);
        return res.status(200).json({
            appointments,
        });
    }
    catch (error) {
        console.error("Get appointments error:", error);
        if (error.message === "Patient profile not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch appointments",
        });
    }
};
exports.getMyAppointments = getMyAppointments;
// Get logged-in doctor's appointments
const getMyDoctorAppointments = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({
                message: "Only doctors can access this",
            });
        }
        const appointments = await appointmentService.getDoctorAppointmentsByUserId(req.user.id);
        return res.status(200).json({
            appointments,
        });
    }
    catch (error) {
        console.error("Get doctor appointments error:", error);
        if (error.message ===
            "Doctor profile not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch appointments",
        });
    }
};
exports.getMyDoctorAppointments = getMyDoctorAppointments;
// Complete appointment
const completeAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({
                message: "Only doctors can complete appointments",
            });
        }
        const appointmentId = Number(req.params.id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const appointment = await appointmentService.completeAppointment(appointmentId, req.user.id);
        return res.status(200).json({
            message: "Appointment completed successfully",
            appointment,
        });
    }
    catch (error) {
        console.error("Complete appointment error:", error);
        if (error.message === "Appointment not found" ||
            error.message ===
                "Doctor profile not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        if (error.message ===
            "You can only complete your own appointments" ||
            error.message ===
                "Only booked appointments can be completed") {
            return res.status(403).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to complete appointment",
        });
    }
};
exports.completeAppointment = completeAppointment;
// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const appointmentId = Number(req.params.id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const { reason } = req.body || {};
        const appointment = await appointmentService.cancelAppointment(appointmentId, req.user.id, req.user.role, typeof reason === "string" ? reason : undefined);
        return res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment,
        });
    }
    catch (error) {
        console.error("Cancel appointment error:", error);
        if (error.message === "Appointment not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        if (error.message ===
            "Appointment already cancelled") {
            return res.status(400).json({
                message: error.message,
            });
        }
        if (error.message.includes("only cancel your own appointments")) {
            return res.status(403).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to cancel appointment",
        });
    }
};
exports.cancelAppointment = cancelAppointment;
const getDoctorAppointmentDetails = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const doctorUserId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const appointment = await appointmentService.getDoctorAppointmentDetails(appointmentId, doctorUserId);
        return res.status(200).json({
            appointment,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
exports.getDoctorAppointmentDetails = getDoctorAppointmentDetails;
const getPatientAppointments = async (req, res) => {
    try {
        const patientUserId = Number(req.user.id);
        const appointments = await appointmentService.getPatientAppointmentsService(patientUserId);
        return res.status(200).json({
            appointments,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
exports.getPatientAppointments = getPatientAppointments;
const getPatientAppointmentDetails = async (req, res) => {
    try {
        const appointmentId = Number(req.params.appointmentId);
        const patientUserId = Number(req.user.id);
        if (!appointmentId || Number.isNaN(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID",
            });
        }
        const appointment = await appointmentService.getPatientAppointmentDetailsService(appointmentId, patientUserId);
        return res.status(200).json({
            appointment,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: error.message,
        });
    }
};
exports.getPatientAppointmentDetails = getPatientAppointmentDetails;
