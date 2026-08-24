import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as userRepository from "../repositories/user.repository";
import { AuthRequest } from "../middleware/auth.middleware";

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await authService.registerUser(
      name,
      email,
      password,
      role || "PATIENT"
    );

    return res.status(201).json({
      message: "Patient registered successfully",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await authService.loginUser(
      email,
      password
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await userRepository.getPublicProfileById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({ message: "Failed to fetch current user" });
  }
};

export {
  register,
  login,
  getMe,
};