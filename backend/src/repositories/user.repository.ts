import prisma from "../config/prisma";

const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}) => {
  return await prisma.user.create({
    data,
  });
};

const getPatientProfileByUserId = async (userId: number) => {
  return await prisma.patientProfile.findUnique({
    where: {
      userId,
    },
  });
};

const getUserById = async (id: number) => {
  return await prisma.user.findUnique({ where: { id } });
};

const updateGoogleTokens = async (
  userId: number,
  data: {
    googleAccessToken?: string | null;
    googleRefreshToken?: string | null;
    googleTokenExpiry?: Date | null;
    googleCalendarLinked?: boolean;
  }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

export {
  findUserByEmail,
  createUser,
  getPatientProfileByUserId,
  getUserById,
  updateGoogleTokens,
};