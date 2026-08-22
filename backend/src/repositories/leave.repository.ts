import prisma from "../config/prisma";

const createLeave = async (data: {
  doctorId: number;
  date: Date;
  reason?: string;
}) => {
  return await prisma.doctorLeave.create({
    data,
  });
};

const getDoctorLeaves = async (doctorId: number) => {
  return await prisma.doctorLeave.findMany({
    where: {
      doctorId,
    },
    orderBy: {
      date: "asc",
    },
  });
};

const getLeaveById = async (id: number) => {
  return await prisma.doctorLeave.findUnique({
    where: {
      id,
    },
  });
};

const deleteLeave = async (id: number) => {
  return await prisma.doctorLeave.delete({
    where: {
      id,
    },
  });
};

const getLeaveByDoctorAndDate = async (
  doctorId: number,
  date: Date
) => {
  return await prisma.doctorLeave.findUnique({
    where: {
      doctorId_date: {
        doctorId,
        date,
      },
    },
  });
};

export {
  createLeave,
  getDoctorLeaves,
  getLeaveById,
  deleteLeave,
  getLeaveByDoctorAndDate,
};