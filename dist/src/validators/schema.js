"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsultationSchema = exports.submitSymptomsSchema = exports.createDoctorSchema = exports.createLeaveSchema = exports.holdSlotSchema = exports.bookAppointmentSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Name is required").max(120),
    email: zod_1.z.string().trim().toLowerCase().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.enum(["PATIENT", "DOCTOR", "ADMIN"]).optional(),
});
exports.registerSchema = registerSchema;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.loginSchema = loginSchema;
const dateStringSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const timeStringSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm 24-hour format");
const bookAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.coerce.number().int().positive(),
    date: dateStringSchema,
    startTime: timeStringSchema,
});
exports.bookAppointmentSchema = bookAppointmentSchema;
const holdSlotSchema = zod_1.z.object({
    doctorId: zod_1.z.coerce.number().int().positive(),
    date: dateStringSchema,
    startTime: timeStringSchema,
});
exports.holdSlotSchema = holdSlotSchema;
const createLeaveSchema = zod_1.z.object({
    date: dateStringSchema,
    reason: zod_1.z.string().trim().max(500).optional(),
});
exports.createLeaveSchema = createLeaveSchema;
const createDoctorSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(120),
    email: zod_1.z.string().trim().toLowerCase().email(),
    password: zod_1.z.string().min(8),
    specialization: zod_1.z.string().trim().min(1).max(120),
    qualification: zod_1.z.string().trim().max(200).optional(),
    experience: zod_1.z.coerce.number().int().min(0).optional(),
    bio: zod_1.z.string().trim().max(2000).optional(),
    consultationFee: zod_1.z.coerce.number().min(0).optional(),
});
exports.createDoctorSchema = createDoctorSchema;
const submitSymptomsSchema = zod_1.z.object({
    symptoms: zod_1.z.string().trim().min(3, "Please describe your symptoms").max(4000),
});
exports.submitSymptomsSchema = submitSymptomsSchema;
const prescriptionSchema = zod_1.z.object({
    medication: zod_1.z.string().trim().min(1),
    dosage: zod_1.z.string().trim().min(1),
    frequency: zod_1.z.string().trim().min(1),
    duration: zod_1.z.string().trim().optional(),
    instructions: zod_1.z.string().trim().optional(),
});
const createConsultationSchema = zod_1.z.object({
    clinicalNotes: zod_1.z.string().trim().min(3),
    diagnosis: zod_1.z.string().trim().optional(),
    followUpInstructions: zod_1.z.string().trim().optional(),
    prescriptions: zod_1.z.array(prescriptionSchema).optional().default([]),
});
exports.createConsultationSchema = createConsultationSchema;
