import prisma from "../config/prisma";

const createConsultation = async (
  appointmentId: number,
  clinicalNotes: string,
  diagnosis?: string,
  followUpInstructions?: string
) => {
  return prisma.consultation.create({
    data: {
      appointmentId,
      clinicalNotes,
      diagnosis,
      followUpInstructions,
    },
    include: {
      prescriptions: true,
    },
  });
};

const findByAppointmentId = async (appointmentId: number) => {
  return prisma.consultation.findUnique({
    where: {
      appointmentId,
    },
    include: {
      prescriptions: true,
    },
  });
};

const createPrescription = async (
  consultationId: number,
  data: {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }
) => {
  return prisma.prescription.create({
    data: {
      consultationId,
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      instructions: data.instructions,
    },
  });
};

const updateAppointmentStatus = async (appointmentId: number) => {
  return prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: "COMPLETED",
    },
  });
};

export default {
  createConsultation,
  findByAppointmentId,
  createPrescription,
  updateAppointmentStatus,
};