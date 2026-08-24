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
exports.getPrescriptionReminders = void 0;
const reminderService = __importStar(require("../services/reminder.service"));
const getPrescriptionReminders = async (req, res) => {
    try {
        const prescriptionId = Number(req.params.prescriptionId);
        if (!prescriptionId || Number.isNaN(prescriptionId)) {
            return res.status(400).json({
                message: "Invalid prescription ID",
            });
        }
        const reminders = await reminderService.getRemindersByPrescription(prescriptionId);
        return res.status(200).json({
            message: "Reminders fetched successfully",
            reminders,
        });
    }
    catch (error) {
        console.error("Get reminders error:", error);
        return res.status(400).json({
            message: error.message || "Failed to fetch reminders",
        });
    }
};
exports.getPrescriptionReminders = getPrescriptionReminders;
