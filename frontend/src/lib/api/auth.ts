import apiClient from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types/auth";

export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/register", {
    ...data,
    role: "PATIENT",
  });

  return response.data;
};

export const loginUser = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/login", data);

  return response.data;
};

export const logoutUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

// Fetches the current user's live profile (including whether Google
// Calendar is linked) rather than relying only on what was cached at
// login time.
export const getCurrentUser = async (): Promise<
  User & { googleCalendarLinked?: boolean }
> => {
  const response = await apiClient.get("/auth/me");

  return response.data.user;
};

export const saveAuthData = (data: AuthResponse) => {
  if (typeof window === "undefined" || !data.token || !data.user) {
    return;
  }

  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
};