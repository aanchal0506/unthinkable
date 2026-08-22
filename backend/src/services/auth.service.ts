import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as userRepository from "../repositories/user.repository"

const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "PATIENT" | "DOCTOR" | "ADMIN"
) => {
  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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

const loginUser = async (email: string, password: string) => {
  const user = await userRepository.findUserByEmail(email);

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