import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR", "ADMIN"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm 24-hour format");

const bookAppointmentSchema = z.object({
  doctorId: z.coerce.number().int().positive(),
  date: dateStringSchema,
  startTime: timeStringSchema,
});

const holdSlotSchema = z.object({
  doctorId: z.coerce.number().int().positive(),
  date: dateStringSchema,
  startTime: timeStringSchema,
});

const createLeaveSchema = z.object({
  date: dateStringSchema,
  reason: z.string().trim().max(500).optional(),
});

const createDoctorSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  specialization: z.string().trim().min(1).max(120),
  qualification: z.string().trim().max(200).optional(),
  experience: z.coerce.number().int().min(0).optional(),
  bio: z.string().trim().max(2000).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
});

const submitSymptomsSchema = z.object({
  symptoms: z.string().trim().min(3, "Please describe your symptoms").max(4000),
});

const prescriptionSchema = z.object({
  medication: z.string().trim().min(1),
  dosage: z.string().trim().min(1),
  frequency: z.string().trim().min(1),
  duration: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
});

const createConsultationSchema = z.object({
  clinicalNotes: z.string().trim().min(3),
  diagnosis: z.string().trim().optional(),
  followUpInstructions: z.string().trim().optional(),
  prescriptions: z.array(prescriptionSchema).optional().default([]),
});

export {
  registerSchema,
  loginSchema,
  bookAppointmentSchema,
  holdSlotSchema,
  createLeaveSchema,
  createDoctorSchema,
  submitSymptomsSchema,
  createConsultationSchema,
};
