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
exports.deleteDoctor = exports.updateDoctor = exports.getDoctor = exports.getDoctors = exports.createDoctor = void 0;
const doctorService = __importStar(require("../services/doctor.service"));
const createDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, qualification, experience, bio, consultationFee, } = req.body;
        if (!name ||
            !email ||
            !password ||
            !specialization) {
            return res.status(400).json({
                message: "Name, email, password and specialization are required",
            });
        }
        const doctor = await doctorService.createDoctor({
            name,
            email,
            password,
            specialization,
            qualification,
            experience: experience !== undefined
                ? Number(experience)
                : undefined,
            bio,
            consultationFee: consultationFee !== undefined
                ? Number(consultationFee)
                : undefined,
        });
        return res.status(201).json({
            message: "Doctor created successfully",
            doctor,
        });
    }
    catch (error) {
        console.error("Create doctor error:", error);
        if (error.message === "User already exists") {
            return res.status(409).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to create doctor",
        });
    }
};
exports.createDoctor = createDoctor;
const getDoctors = async (req, res) => {
    try {
        const specialization = typeof req.query.specialization === "string"
            ? req.query.specialization
            : undefined;
        const name = typeof req.query.name === "string"
            ? req.query.name
            : undefined;
        const doctors = await doctorService.getDoctors(specialization, name);
        return res.status(200).json({
            doctors,
        });
    }
    catch (error) {
        console.error("Get doctors error:", error);
        return res.status(500).json({
            message: "Failed to fetch doctors",
        });
    }
};
exports.getDoctors = getDoctors;
const getDoctor = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        const doctor = await doctorService.getDoctor(id);
        return res.status(200).json({
            doctor,
        });
    }
    catch (error) {
        console.error("Get doctor error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch doctor",
        });
    }
};
exports.getDoctor = getDoctor;
const updateDoctor = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        const { specialization, qualification, experience, bio, consultationFee, } = req.body;
        const doctor = await doctorService.updateDoctor(id, {
            specialization,
            qualification,
            experience,
            bio,
            consultationFee,
        });
        return res.status(200).json({
            message: "Doctor updated successfully",
            doctor,
        });
    }
    catch (error) {
        console.error("Update doctor error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to update doctor",
        });
    }
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        const result = await doctorService.deleteDoctor(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete doctor error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to delete doctor",
        });
    }
};
exports.deleteDoctor = deleteDoctor;
