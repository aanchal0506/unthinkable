import consultationRepository from "../repositories/consultation.repository";
import * as appointmentRepository from "../repositories/appointment.repository";
import { getDoctorByUserId } from "../repositories/doctor.repository";
import { parseDuration, generateReminders } from "./reminder.service";
import * as llmService from "./llm.service";

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

  // Create prescriptions + medication reminders
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

    const createdPrescription =
      await consultationRepository.createPrescription(
        consultation.id,
        prescription
      );

    // Generate medication reminders
    const durationDays = parseDuration(
      prescription.duration
    );

    await generateReminders(
      createdPrescription.id,
      prescription.frequency,
      durationDays
    );
  }

  await consultationRepository.updateAppointmentStatus(
    appointmentId
  );

  // Best-effort: generate the patient-friendly post-visit summary. Failures
  // (LLM timeout/outage) never break consultation creation — aiStatus just
  // ends up FAILED and the doctor/patient can trigger a manual retry.
  const llmResult = await llmService.generatePostVisitSummary(
    clinicalNotes.trim(),
    prescriptions,
    followUpInstructions?.trim()
  );

  if (llmResult.ok) {
    await consultationRepository.updateAIResult(consultation.id, {
      patientSummary: llmResult.data,
      aiStatus: "COMPLETED",
    });
  } else {
    await consultationRepository.updateAIResult(consultation.id, {
      aiStatus: "FAILED",
      aiError: llmResult.error,
    });
  }

  return consultationRepository.findByAppointmentId(
    appointmentId
  );
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

// Manual retry if the post-visit LLM summary previously failed.
const regeneratePatientSummary = async (
  appointmentId: number,
  doctorUserId: number
) => {
  const appointment =
    await appointmentRepository.getAppointmentById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const doctor = await getDoctorByUserId(doctorUserId);

  if (!doctor || appointment.doctorId !== doctor.id) {
    throw new Error(
      "You are not authorized to modify this consultation"
    );
  }

  const consultation =
    await consultationRepository.findByAppointmentId(appointmentId);

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  const llmResult = await llmService.generatePostVisitSummary(
    consultation.clinicalNotes,
    consultation.prescriptions,
    consultation.followUpInstructions || undefined
  );

  if (llmResult.ok) {
    await consultationRepository.updateAIResult(consultation.id, {
      patientSummary: llmResult.data,
      aiStatus: "COMPLETED",
    });
  } else {
    await consultationRepository.updateAIResult(consultation.id, {
      aiStatus: "FAILED",
      aiError: llmResult.error,
    });
  }

  return consultationRepository.findByAppointmentId(appointmentId);
};

export default {
  createConsultation,
  getConsultation,
  regeneratePatientSummary,
};
