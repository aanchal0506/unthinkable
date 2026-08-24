import apiClient from "./client";
import type { Consultation, PrescriptionInput } from "@/types/consultation";

export interface CreateConsultationInput {
  clinicalNotes: string;
  diagnosis?: string;
  followUpInstructions?: string;
  prescriptions: PrescriptionInput[];
}

export const createConsultation = async (
  appointmentId: number,
  data: CreateConsultationInput
): Promise<Consultation> => {
  const response = await apiClient.post(
    `/appointments/${appointmentId}/consultation`,
    data
  );

  return response.data.consultation;
};

export const getConsultation = async (
  appointmentId: number
): Promise<Consultation> => {
  const response = await apiClient.get(
    `/appointments/${appointmentId}/consultation`
  );

  return response.data.consultation;
};

// Doctor-only. Retries the AI patient-friendly summary if it previously failed.
export const regeneratePatientSummary = async (
  appointmentId: number
): Promise<Consultation> => {
  const response = await apiClient.post(
    `/appointments/${appointmentId}/consultation/regenerate-summary`
  );

  return response.data.consultation;
};
