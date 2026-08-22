import symptomRepository from "../repositories/symptom.repository";
import * as appointmentRepository from "../repositories/appointment.repository";

const submitSymptoms = async (
  appointmentId: number,
  patientId: number,
  symptoms: string
) => {
  if (!symptoms || !symptoms.trim()) {
    throw new Error("Symptoms are required");
  }

  const appointment =
    await appointmentRepository.getAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status !== "BOOKED") {
    throw new Error(
      "Symptoms can only be submitted for a booked appointment"
    );
  }

  const existing =
    await symptomRepository.getByAppointmentId(appointmentId);

  if (existing) {
    throw new Error("Symptoms have already been submitted");
  }

  return symptomRepository.createSymptomSubmission(
    appointmentId,
    symptoms.trim()
  );
};

const getSymptoms = async (
  appointmentId: number,
  patientId: number
) => {
  const appointment =
    await appointmentRepository.getAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.patientId !== patientId) {
    throw new Error("You are not authorized to access this appointment");
  }

  return symptomRepository.getByAppointmentId(appointmentId);
};

export default {
  submitSymptoms,
  getSymptoms,
};