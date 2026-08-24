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
exports.deleteLeave = exports.getMyLeaves = exports.createLeave = void 0;
const leaveService = __importStar(require("../services/leave.service"));
// Create leave
const createLeave = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({
                message: "Only doctors can create leaves",
            });
        }
        const { date, reason } = req.body;
        if (!date) {
            return res.status(400).json({
                message: "Date is required",
            });
        }
        const result = await leaveService.createLeave(req.user.id, date, reason);
        return res.status(201).json({
            message: result.affectedAppointments > 0
                ? `Leave created successfully. ${result.affectedAppointments} existing appointment(s) were cancelled and the affected patient(s) notified.`
                : "Leave created successfully",
            leave: result.leave,
            affectedAppointments: result.affectedAppointments,
        });
    }
    catch (error) {
        console.error("Create leave error:", error);
        if (error.message ===
            "Doctor profile not found") {
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
            "Leave already exists for this date") {
            return res.status(409).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to create leave",
        });
    }
};
exports.createLeave = createLeave;
// Get logged-in doctor's leaves
const getMyLeaves = async (req, res) => {
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
        const leaves = await leaveService.getMyLeaves(req.user.id);
        return res.status(200).json({
            leaves,
        });
    }
    catch (error) {
        console.error("Get leaves error:", error);
        if (error.message ===
            "Doctor profile not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch leaves",
        });
    }
};
exports.getMyLeaves = getMyLeaves;
// Delete leave
const deleteLeave = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({
                message: "Only doctors can delete leaves",
            });
        }
        const leaveId = Number(req.params.id);
        if (isNaN(leaveId)) {
            return res.status(400).json({
                message: "Invalid leave ID",
            });
        }
        const leave = await leaveService.deleteLeave(req.user.id, leaveId);
        return res.status(200).json({
            message: "Leave deleted successfully",
            leave,
        });
    }
    catch (error) {
        console.error("Delete leave error:", error);
        if (error.message ===
            "Doctor profile not found" ||
            error.message === "Leave not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        if (error.message ===
            "You can only delete your own leaves") {
            return res.status(403).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to delete leave",
        });
    }
};
exports.deleteLeave = deleteLeave;
