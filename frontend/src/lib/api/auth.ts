import apiClient from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types/auth";

export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};