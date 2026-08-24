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
const slotService = __importStar(require("../services/slot.service"));
const getAvailableSlots = async (req, res) => {
    try {
        const doctorId = Number(req.params.doctorId);
        const { date } = req.query;
        if (isNaN(doctorId)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }
        if (!date || typeof date !== "string") {
            return res.status(400).json({
                message: "Date is required",
            });
        }
        const slots = await slotService.getAvailableSlots(doctorId, date);
        return res.status(200).json({
            doctorId,
            date,
            slots,
        });
    }
    catch (error) {
        console.error("Get slots error:", error);
        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch available slots",
        });
    }
};
exports.getAvailableSlots = getAvailableSlots;
const holdSlot = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (req.user.role !== "PATIENT") {
            return res.status(403).json({ message: "Only patients can hold slots" });
        }
        const { doctorId, date, startTime } = req.body;
        if (!doctorId || !date || !startTime) {
            return res.status(400).json({
                message: "doctorId, date and startTime are required",
            });
        }
        const hold = await slotService.holdSlot(Number(doctorId), date, startTime, req.user.id);
        return res.status(200).json({
            message: "Slot held successfully",
            ...hold,
        });
    }
    catch (error) {
        console.error("Hold slot error:", error);
        if (error.message.includes("currently held")) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === "Doctor not found" ||
            error.message === "Patient profile not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Invalid date" ||
            error.message === "Selected time slot is not available") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Failed to hold slot" });
    }
};
exports.holdSlot = holdSlot;
const releaseSlotHold = async (req, res) => {
    try {
        const { doctorId, date, startTime } = req.body;
        if (!doctorId || !date || !startTime) {
            return res.status(400).json({
                message: "doctorId, date and startTime are required",
            });
        }
        const result = await slotService.releaseSlotHold(Number(doctorId), date, startTime);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Release hold error:", error);
        return res.status(500).json({ message: "Failed to release hold" });
    }
};
exports.releaseSlotHold = releaseSlotHold;
