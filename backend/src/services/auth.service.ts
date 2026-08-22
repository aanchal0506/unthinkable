import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma";
import * as userRepository from "../repositories/user.repository";

const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "PATIENT" | "DOCTOR" | "ADMIN"
) => {
  const existingUser =
    await userRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // PATIENT
  if (role === "PATIENT") {
    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

        const patientProfile =
          await tx.patientProfile.create({
            data: {
              userId: user.id,
            },
          });

        return {
          user,
          patientProfile,
        };
      }
    );

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    };
  }

  // DOCTOR / ADMIN
  const user = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async (
  email: string,
  password: string
) => {
  const user =
    await userRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export {
  registerUser,
  loginUser,
};