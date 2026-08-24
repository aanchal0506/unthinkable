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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctor = exports.updateDoctor = exports.getDoctor = exports.getDoctors = exports.createDoctor = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const doctorRepository = __importStar(require("../repositories/doctor.repository"));
const userRepository = __importStar(require("../repositories/user.repository"));
const createDoctor = async (data) => {
    // Check whether email already exists
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("User already exists");
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const result = await doctorRepository.createDoctor({
        ...data,
        password: hashedPassword,
    });
    return {
        id: result.doctor.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        specialization: result.doctor.specialization,
        qualification: result.doctor.qualification,
        experience: result.doctor.experience,
        bio: result.doctor.bio,
        consultationFee: result.doctor.consultationFee,
    };
};
exports.createDoctor = createDoctor;
const getDoctors = async (specialization, name) => {
    return await doctorRepository.getAllDoctors(specialization, name);
};
exports.getDoctors = getDoctors;
const getDoctor = async (id) => {
    const doctor = await doctorRepository.getDoctorById(id);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    return doctor;
};
exports.getDoctor = getDoctor;
const updateDoctor = async (id, data) => {
    const doctor = await doctorRepository.getDoctorById(id);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    return await doctorRepository.updateDoctor(id, data);
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (id) => {
    const doctor = await doctorRepository.getDoctorById(id);
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    await doctorRepository.deleteDoctor(id);
    return {
        message: "Doctor deleted successfully",
    };
};
exports.deleteDoctor = deleteDoctor;
