import prisma from "../config/prisma.js";

const createSymptomSubmission = async (
  appointmentId: number,
  symptoms: string
) => {
  return prisma.symptomSubmission.create({
    data: {
      appointmentId,
      symptoms,
    },
  });
};

const getByAppointmentId = async (appointmentId: number) => {
  return prisma.symptomSubmission.findUnique({
    where: {
      appointmentId,
    },
  });
};

const updateAIResult = async (
  id: number,
  data: {
    aiSummary?: string;
    urgency?: "LOW" | "MEDIUM" | "HIGH";
    chiefComplaint?: string;
    suggestedQuestions?: string[];
    aiStatus?: "PENDING" | "COMPLETED" | "FAILED";
    aiError?: string;
  }
) => {
  return prisma.symptomSubmission.update({
    where: {
      id,
    },
    data,
  });
};

export default {
  createSymptomSubmission,
  getByAppointmentId,
  updateAIResult,
};