import prisma from "../config/prisma.js";

const createAvailability = async (
  doctorId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  slotDuration: number
) => {
  return await prisma.doctorAvailability.create({
    data: {
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    },
  });
};

const getDoctorAvailability = async (doctorId: number) => {
  return await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
    },
    orderBy: {
      dayOfWeek: "asc",
    },
  });
};

const getAvailabilityById = async (id: number) => {
  return await prisma.doctorAvailability.findUnique({
    where: {
      id,
    },
  });
};

const updateAvailability = async (
  id: number,
  data: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    slotDuration?: number;
  }
) => {
  return await prisma.doctorAvailability.update({
    where: {
      id,
    },
    data,
  });
};

const deleteAvailability = async (id: number) => {
  return await prisma.doctorAvailability.delete({
    where: {
      id,
    },
  });
};

export {
  createAvailability,
  getDoctorAvailability,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
};