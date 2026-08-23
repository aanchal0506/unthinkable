import symptomRepository from "../repositories/symptom.repository";
import * as appointmentRepository from "../repositories/appointment.repository";
import * as llmService from "./llm.service";

const generateAndStoreSummary = async (
  submissionId: number,
  symptoms: string
) => {
  const result = await llmService.generatePreVisitSummary(symptoms);

  if (result.ok) {
    await symptomRepository.updateAIResult(submissionId, {
      aiSummary: `Urgency: ${result.data.urgency}. Chief complaint: ${result.data.chiefComplaint}`,
      urgency: result.data.urgency,
      chiefComplaint: result.data.chiefComplaint,
      suggestedQuestions: result.data.suggestedQuestions,
      aiStatus: "COMPLETED",
      aiError: undefined,
    });
  } else {
    await symptomRepository.updateAIResult(submissionId, {
      aiStatus: "FAILED",
      aiError: result.error,
    });
  }
};

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

  const submission = await symptomRepository.createSymptomSubmission(
    appointmentId,
    symptoms.trim()
  );

  // Best-effort: the AI pre-visit summary is generated inline (with its own
  // internal timeout) so the doctor usually has it well before the visit,
  // but if the LLM is slow/unavailable this NEVER blocks or fails the
  // patient's symptom submission — aiStatus just ends up FAILED and the
  // doctor can trigger a manual regeneration later.
  await generateAndStoreSummary(submission.id, symptoms.trim());

  return symptomRepository.getByAppointmentId(appointmentId);
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

// Lets a patient or doctor manually retry AI summary generation if it
// previously failed (LLM outage, timeout, etc.) without resubmitting symptoms.
const regenerateSummary = async (appointmentId: number) => {
  const submission = await symptomRepository.getByAppointmentId(appointmentId);

  if (!submission) {
    throw new Error("No symptom submission found for this appointment");
  }

  await generateAndStoreSummary(submission.id, submission.symptoms);

  return symptomRepository.getByAppointmentId(appointmentId);
};

export default {
  submitSymptoms,
  getSymptoms,
  regenerateSummary,
};
