import consultationRepository from "../repositories/consultation.repository";
import * as appointmentRepository from "../repositories/appointment.repository";
import { getDoctorByUserId } from "../repositories/doctor.repository";

const createConsultation = async (
  appointmentId: number,
  doctorUserId: number,
  clinicalNotes: string,
  diagnosis?: string,
  followUpInstructions?: string,
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }[] = []
) => {
  if (!clinicalNotes || !clinicalNotes.trim()) {
    throw new Error("Clinical notes are required");
  }

  const appointment =
    await appointmentRepository.getAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Get DoctorProfile using the logged-in User ID
  const doctor = await getDoctorByUserId(doctorUserId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  // appointment.doctorId = DoctorProfile.id
  // doctor.id = DoctorProfile.id
  if (appointment.doctorId !== doctor.id) {
    throw new Error(
      "You are not authorized to consult this appointment"
    );
  }

  if (appointment.status !== "BOOKED") {
    throw new Error(
      "Consultation can only be created for a booked appointment"
    );
  }

  const existing =
    await consultationRepository.findByAppointmentId(appointmentId);

  if (existing) {
    throw new Error(
      "Consultation already exists for this appointment"
    );
  }

  const consultation =
    await consultationRepository.createConsultation(
      appointmentId,
      clinicalNotes.trim(),
      diagnosis?.trim(),
      followUpInstructions?.trim()
    );

  for (const prescription of prescriptions) {
    if (
      !prescription.medication ||
      !prescription.dosage ||
      !prescription.frequency
    ) {
      throw new Error(
        "Medication, dosage and frequency are required for prescriptions"
      );
    }

    await consultationRepository.createPrescription(
      consultation.id,
      prescription
    );
  }

  await consultationRepository.updateAppointmentStatus(
    appointmentId
  );

  return consultationRepository.findByAppointmentId(appointmentId);
};

const getConsultation = async (
  appointmentId: number,
  doctorUserId: number
) => {
  const appointment =
    await appointmentRepository.getAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const doctor = await getDoctorByUserId(doctorUserId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  if (appointment.doctorId !== doctor.id) {
    throw new Error(
      "You are not authorized to view this consultation"
    );
  }

  return consultationRepository.findByAppointmentId(appointmentId);
};

export default {
  createConsultation,
  getConsultation,
};