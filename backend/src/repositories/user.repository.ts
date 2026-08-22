//user.repository.ts

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

export {
  findUserByEmail,
  createUser,
};