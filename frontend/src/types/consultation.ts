export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH";
export type AIStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface SymptomSubmission {
  id: number;
  appointmentId: number;
  symptoms: string;
  aiSummary: string | null;
  urgency: UrgencyLevel | null;
  chiefComplaint: string | null;
  suggestedQuestions: string[] | null;
  aiStatus: AIStatus;
  aiError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
}

export interface Consultation {
  id: number;
  appointmentId: number;
  clinicalNotes: string;
  diagnosis: string | null;
  followUpInstructions: string | null;
  patientSummary: string | null;
  aiStatus: AIStatus;
  aiError: string | null;
  prescriptions: Prescription[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionInput {
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}
