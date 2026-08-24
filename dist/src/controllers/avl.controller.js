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
exports.deleteAvailability = exports.updateAvailability = exports.getDoctorAvailability = exports.createAvailability = void 0;
const availabilityService = __importStar(require("../services/avl.service"));
const createAvailability = async (req, res) => {
    try {
        const doctorId = Number(req.params.doctorId);
        const { dayOfWeek, startTime, endTime, slotDuration, } = req.body;
        if (isNaN(doctorId)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        if (dayOfWeek === undefined ||
            !startTime ||
            !endTime ||
            slotDuration === undefined) {
            return res.status(400).json({
                message: "dayOfWeek, startTime, endTime and slotDuration are required",
            });
        }
        const availability = await availabilityService.createAvailability(doctorId, Number(dayOfWeek), startTime, endTime, Number(slotDuration));
        return res.status(201).json({
            message: "Availability created successfully",
            availability,
        });
    }
    catch (error) {
        console.error("Create availability error:", error);
        if (error.message === "Doctor not found" ||
            error.message.includes("must be")) {
            return res.status(400).json({
                message: error.message,
            });
        }
        // Prisma unique constraint
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Availability already exists for this day",
            });
        }
        return res.status(500).json({
            message: "Failed to create availability",
        });
    }
};
exports.createAvailability = createAvailability;
const getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = Number(req.params.doctorId);
        if (isNaN(doctorId)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        const availability = await availabilityService.getDoctorAvailability(doctorId);
        return res.status(200).json({
            availability,
        });
    }
    catch (error) {
        console.error("Get availability error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch availability",
        });
    }
};
exports.getDoctorAvailability = getDoctorAvailability;
const updateAvailability = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid availability ID",
            });
        }
        const { dayOfWeek, startTime, endTime, slotDuration, } = req.body;
        const availability = await availabilityService.updateAvailability(id, {
            dayOfWeek: dayOfWeek !== undefined
                ? Number(dayOfWeek)
                : undefined,
            startTime,
            endTime,
            slotDuration: slotDuration !== undefined
                ? Number(slotDuration)
                : undefined,
        });
        return res.status(200).json({
            message: "Availability updated successfully",
            availability,
        });
    }
    catch (error) {
        console.error("Update availability error:", error);
        if (error.message === "Availability not found" ||
            error.message.includes("must be")) {
            return res.status(400).json({
                message: error.message,
            });
        }
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Availability already exists for this day",
            });
        }
        return res.status(500).json({
            message: "Failed to update availability",
        });
    }
};
exports.updateAvailability = updateAvailability;
const deleteAvailability = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid availability ID",
            });
        }
        const result = await availabilityService.deleteAvailability(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete availability error:", error);
        if (error.message === "Availability not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to delete availability",
        });
    }
};
exports.deleteAvailability = deleteAvailability;
