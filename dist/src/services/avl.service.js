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
const availabilityRepository = __importStar(require("../repositories/avl.repository"));
const doctorRepository = __importStar(require("../repositories/doctor.repository"));
const createAvailability = async (doctorId, dayOfWeek, startTime, endTime, slotDuration) => {
    const doctor = await doctorRepository.getDoctorById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error("dayOfWeek must be between 0 and 6");
    }
    if (startTime >= endTime) {
        throw new Error("Start time must be before end time");
    }
    if (slotDuration <= 0) {
        throw new Error("Slot duration must be greater than 0");
    }
    const availability = await availabilityRepository.createAvailability(doctorId, dayOfWeek, startTime, endTime, slotDuration);
    return availability;
};
exports.createAvailability = createAvailability;
const getDoctorAvailability = async (doctorId) => {
    const doctor = await doctorRepository.getDoctorById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    return await availabilityRepository.getDoctorAvailability(doctorId);
};
exports.getDoctorAvailability = getDoctorAvailability;
const updateAvailability = async (id, data) => {
    const availability = await availabilityRepository.getAvailabilityById(id);
    if (!availability) {
        throw new Error("Availability not found");
    }
    if (data.dayOfWeek !== undefined &&
        (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
        throw new Error("dayOfWeek must be between 0 and 6");
    }
    if (data.startTime &&
        data.endTime &&
        data.startTime >= data.endTime) {
        throw new Error("Start time must be before end time");
    }
    if (data.slotDuration !== undefined &&
        data.slotDuration <= 0) {
        throw new Error("Slot duration must be greater than 0");
    }
    return await availabilityRepository.updateAvailability(id, data);
};
exports.updateAvailability = updateAvailability;
const deleteAvailability = async (id) => {
    const availability = await availabilityRepository.getAvailabilityById(id);
    if (!availability) {
        throw new Error("Availability not found");
    }
    await availabilityRepository.deleteAvailability(id);
    return {
        message: "Availability deleted successfully",
    };
};
exports.deleteAvailability = deleteAvailability;
